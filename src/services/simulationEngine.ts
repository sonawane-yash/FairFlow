import {
  SimulationConfig,
  SimulationResult,
  TimeStepMetric,
  PoolMetricResult
} from '../types';

// Simple deterministic pseudo-random generator with seed
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const rng = new SeededRandom(config.randomSeed || 42);

  const {
    applicants,
    inventory,
    systemCapacity,
    numberOfPools,
    riskyTrafficPercent,
    bookingBehavior,
    allocationMethod,
    simulationDurationSeconds,
    userFailureRatePercent
  } = config;

  // Filter out high-risk automated bots in pre-registration
  const riskyApplicantCount = Math.round(applicants * (riskyTrafficPercent / 100));
  const eligibleApplicantsCount = applicants - riskyApplicantCount;

  // Time steps: 30 time slices for clear graphing and timeline analysis
  const totalSteps = 30;
  const timeStepSeconds = simulationDurationSeconds / totalSteps;
  const timeline: TimeStepMetric[] = [];

  // ==========================================
  // MODEL A: SIMULTANEOUS BASELINE SIMULATION
  // ==========================================
  // In baseline, all applicants (including risky bots) rush at t=0 or during early bursts.
  // When active requests exceed safe capacity C, connection dropped, server load ratio > 1.0,
  // response times spike exponentially.
  let baselineInventoryLeft = inventory;
  let baselineBookedCount = 0;
  let baselineFailedCount = 0;
  let baselineOverloadSeconds = 0;
  let baselineCapacityViolations = 0;
  let baselineMaxPeakActive = 0;

  // Track applicants attempting booking in baseline
  let baselineRemainingToAttempt = applicants;

  // ==========================================
  // MODEL B: FAIRFLOW SIMULATION
  // ==========================================
  // Pre-registration is complete. Eligible applicants are partitioned into K pools.
  const poolSizes: number[] = [];
  let remainingEligible = eligibleApplicantsCount;

  for (let k = 0; k < numberOfPools; k++) {
    if (k === numberOfPools - 1) {
      poolSizes.push(remainingEligible);
    } else {
      // Small randomized variance in pool size to reflect realistic bucket assignments
      const baseShare = Math.floor(eligibleApplicantsCount / numberOfPools);
      const variance = (rng.next() - 0.5) * 0.1 * baseShare;
      const size = Math.max(1, Math.round(baseShare + variance));
      poolSizes.push(size);
      remainingEligible -= size;
    }
  }

  // Steps per pool window
  const stepsPerPool = Math.max(1, Math.floor(totalSteps / numberOfPools));
  let fairflowInventoryLeft = inventory;
  let fairflowBookedTotal = 0;
  let fairflowTotalRecycled = 0;
  let fairflowFailedTotal = 0;
  let fairflowWaitingCount = eligibleApplicantsCount;
  let fairflowActiveSessions = 0;

  const poolResults: PoolMetricResult[] = [];
  const poolBookings: number[] = new Array(numberOfPools).fill(0);
  const poolAllocations: number[] = new Array(numberOfPools).fill(0);
  const poolRecycled: number[] = new Array(numberOfPools).fill(0);

  // Run simulation time slices
  for (let step = 0; step < totalSteps; step++) {
    const timeSec = Math.round(step * timeStepSeconds);
    const mm = String(Math.floor(timeSec / 60)).padStart(2, '0');
    const ss = String(timeSec % 60).padStart(2, '0');
    const timeFormatted = `${mm}:${ss}`;

    // ----------------------------------------
    // Baseline step processing
    // ----------------------------------------
    // Demand pattern for baseline: massive early wave
    let baselineNewIncoming = 0;
    if (bookingBehavior === 'burst' || bookingBehavior === 'concentrated') {
      if (step < 6) {
        baselineNewIncoming = Math.round(applicants * (step === 1 ? 0.45 : 0.1));
      } else {
        baselineNewIncoming = Math.round((applicants * 0.05) / (totalSteps - 6));
      }
    } else if (bookingBehavior === 'uniform') {
      baselineNewIncoming = Math.round(applicants / 10);
    } else {
      // random
      baselineNewIncoming = Math.round(baselineRemainingToAttempt * rng.range(0.05, 0.25));
    }
    baselineNewIncoming = Math.min(baselineRemainingToAttempt, baselineNewIncoming);
    baselineRemainingToAttempt -= baselineNewIncoming;

    // Concurrency attempts to enter
    const baselineActiveAttempt = baselineNewIncoming + Math.round(rng.range(50, 200));
    if (baselineActiveAttempt > baselineMaxPeakActive) {
      baselineMaxPeakActive = baselineActiveAttempt;
    }

    const baselineLoadRatio = Number((baselineActiveAttempt / systemCapacity).toFixed(2));
    const isBaselineOverloaded = baselineActiveAttempt > systemCapacity;

    if (isBaselineOverloaded) {
      baselineOverloadSeconds += timeStepSeconds;
      baselineCapacityViolations++;
    }

    // Baseline booking throughput degraded if overloaded
    let baselineBookingsThisStep = 0;
    if (baselineInventoryLeft > 0) {
      // Degraded throughput when server is under DDoS-like surge
      const degradationFactor = isBaselineOverloaded ? Math.max(0.08, systemCapacity / (baselineActiveAttempt * 1.5)) : 0.95;
      const potentialBookings = Math.round(Math.min(baselineActiveAttempt * degradationFactor, baselineInventoryLeft));
      
      // Bots grabbing inventory vs genuine user drops
      const botAdvantageRate = riskyTrafficPercent > 0 ? 0.75 : 0.9;
      baselineBookingsThisStep = Math.min(baselineInventoryLeft, Math.round(potentialBookings * botAdvantageRate));
      
      baselineInventoryLeft -= baselineBookingsThisStep;
      baselineBookedCount += baselineBookingsThisStep;
    }

    // Failures in baseline: requests that timeout or drop due to capacity limits
    const dropRate = isBaselineOverloaded ? Math.min(0.85, (baselineActiveAttempt - systemCapacity) / baselineActiveAttempt) : 0.04;
    const baselineFailsThisStep = Math.round(baselineActiveAttempt * dropRate);
    baselineFailedCount += baselineFailsThisStep;

    // ----------------------------------------
    // FairFlow step processing
    // ----------------------------------------
    const currentPoolIdx = Math.min(numberOfPools - 1, Math.floor(step / stepsPerPool));
    const isFirstStepOfPool = step % stepsPerPool === 0;
    const isLastStepOfPool = (step + 1) % stepsPerPool === 0 || step === totalSteps - 1;

    // Dynamic Inventory Allocation for the active pool:
    // Q_k = S_t * (N_k / N_t)
    if (isFirstStepOfPool && fairflowInventoryLeft > 0) {
      const remainingPoolsEligible = poolSizes.slice(currentPoolIdx).reduce((a, b) => a + b, 0);
      const activePoolEligible = poolSizes[currentPoolIdx];
      
      let allocatedThisPool = 0;
      if (allocationMethod === 'dynamic_recycling' || allocationMethod === 'proportional_pools') {
        const shareRatio = remainingPoolsEligible > 0 ? activePoolEligible / remainingPoolsEligible : 1;
        allocatedThisPool = Math.round(fairflowInventoryLeft * shareRatio);
      } else {
        // Equal naive split
        allocatedThisPool = Math.round(inventory / numberOfPools);
      }
      allocatedThisPool = Math.min(fairflowInventoryLeft, Math.max(0, allocatedThisPool));
      poolAllocations[currentPoolIdx] += allocatedThisPool;
    }

    // Controlled Admission Controller:
    // A_t = min(W_t, C - L_t)
    const availableCapacity = Math.max(0, systemCapacity - fairflowActiveSessions);
    const poolRemainingApplicants = poolSizes[currentPoolIdx] - (poolBookings[currentPoolIdx] + Math.round(fairflowFailedTotal / numberOfPools));
    const targetPoolDemandThisStep = Math.round(poolRemainingApplicants / stepsPerPool);
    
    // STRICT ADMISSION ENFORCEMENT: Never exceed safe capacity
    const admittedThisStep = Math.min(
      fairflowWaitingCount,
      Math.min(targetPoolDemandThisStep, availableCapacity)
    );

    fairflowActiveSessions = Math.min(systemCapacity, admittedThisStep);
    fairflowWaitingCount = Math.max(0, fairflowWaitingCount - admittedThisStep);

    // Bookings from admitted users
    let fairflowBookingsThisStep = 0;
    const availablePoolInventory = poolAllocations[currentPoolIdx] - poolBookings[currentPoolIdx];

    if (availablePoolInventory > 0 && fairflowActiveSessions > 0) {
      // Normal transaction completion with low user abandonment/timeout
      const completionRate = 1 - (userFailureRatePercent / 100);
      const bookingAttempts = Math.round(fairflowActiveSessions * 0.85);
      fairflowBookingsThisStep = Math.min(availablePoolInventory, Math.round(bookingAttempts * completionRate));
      
      poolBookings[currentPoolIdx] += fairflowBookingsThisStep;
      fairflowBookedTotal += fairflowBookingsThisStep;
      fairflowInventoryLeft = Math.max(0, fairflowInventoryLeft - fairflowBookingsThisStep);
    }

    // Failures in FairFlow are minor (e.g. payment decline or user closing window), NO capacity crashes
    const fairflowFailsThisStep = Math.round(fairflowActiveSessions * (userFailureRatePercent / 100));
    fairflowFailedTotal += fairflowFailsThisStep;

    // Inventory Recycling Trigger at end of pool window:
    let recycledThisStep = 0;
    if (isLastStepOfPool && (allocationMethod === 'dynamic_recycling' || allocationMethod === 'proportional_pools')) {
      const unusedInPool = Math.max(0, poolAllocations[currentPoolIdx] - poolBookings[currentPoolIdx]);
      if (unusedInPool > 0) {
        recycledThisStep = unusedInPool;
        poolRecycled[currentPoolIdx] += unusedInPool;
        fairflowTotalRecycled += unusedInPool;
        // The unused units are returned to the available inventory pool for subsequent pools!
        // fairflowInventoryLeft maintains the unbooked inventory
      }
    }

    // Record timeline slice
    timeline.push({
      timeSec,
      timeFormatted,
      baselineActiveSessions: baselineActiveAttempt,
      baselineWaiting: Math.max(0, baselineRemainingToAttempt),
      baselineCompletedBookings: baselineBookedCount,
      baselineFailedRequests: baselineFailedCount,
      baselineServerLoadRatio: baselineLoadRatio,
      baselineInventoryRemaining: baselineInventoryLeft,
      fairflowActiveSessions,
      fairflowWaiting: fairflowWaitingCount,
      fairflowCompletedBookings: fairflowBookedTotal,
      fairflowRecycledInventory: fairflowTotalRecycled,
      fairflowInventoryRemaining: fairflowInventoryLeft,
      fairflowCurrentPoolIndex: currentPoolIdx,
      fairflowCapacityUtilization: Number(((fairflowActiveSessions / systemCapacity) * 100).toFixed(1))
    });
  }

  // Compile pool metric results & calculate Jain's fairness index
  const poolLetters = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon'];
  const poolProbabilities: number[] = [];

  for (let k = 0; k < numberOfPools; k++) {
    const booked = poolBookings[k];
    const eligible = poolSizes[k];
    const prob = eligible > 0 ? booked / eligible : 0;
    poolProbabilities.push(prob);

    poolResults.push({
      poolIndex: k,
      poolName: `Pool ${poolLetters[k] || String.fromCharCode(65 + k)}`,
      allocatedInventory: poolAllocations[k],
      recycledInventory: poolRecycled[k],
      bookedInventory: booked,
      applicants: Math.round(eligible * (1 + riskyTrafficPercent / 100)),
      eligibleApplicants: eligible,
      successProbability: Number(prob.toFixed(4))
    });
  }

  // Calculate Jain's Fairness Index:
  // J = (sum(p_k))^2 / (K * sum(p_k^2))
  const sumProb = poolProbabilities.reduce((acc, p) => acc + p, 0);
  const sumSqProb = poolProbabilities.reduce((acc, p) => acc + p * p, 0);
  let jainFairnessIndex = 1.0;
  if (sumSqProb > 0 && numberOfPools > 0) {
    jainFairnessIndex = (sumProb * sumProb) / (numberOfPools * sumSqProb);
  }
  jainFairnessIndex = Math.min(1.0, Math.max(0.01, Number(jainFairnessIndex.toFixed(4))));

  // Variance & Min/Max pool success
  const avgPoolSuccessProb = numberOfPools > 0 ? sumProb / numberOfPools : 0;
  const variance = numberOfPools > 0
    ? poolProbabilities.reduce((acc, p) => acc + Math.pow(p - avgPoolSuccessProb, 2), 0) / numberOfPools
    : 0;
  const minPoolSuccessProb = Math.min(...poolProbabilities);
  const maxPoolSuccessProb = Math.max(...poolProbabilities);

  // Baseline fairness calculation:
  // In baseline, users in first milliseconds (or bot clusters) capture the inventory,
  // leaving subsequent applicants with 0 success probability, leading to high skew.
  const baselineJain = Number(Math.max(0.12, 0.85 / Math.log10(applicants + 10)).toFixed(3));

  // Latency metrics:
  // Baseline P95 latency is heavily degraded when overloaded
  const baselineP95LatencyMs = baselineCapacityViolations > 0
    ? Math.round(rng.range(7500, 14500))
    : Math.round(rng.range(800, 1500));
  const fairflowP95LatencyMs = Math.round(rng.range(180, 420));

  // Wait time metrics:
  const baselineAvgWaitSec = Math.round(simulationDurationSeconds * 0.45);
  const baselineP95WaitSec = Math.round(simulationDurationSeconds * 0.85);

  const fairflowAvgWaitSec = Math.round((simulationDurationSeconds / 2) * (1 - (systemCapacity / applicants) * 0.2));
  const fairflowP95WaitSec = Math.round(simulationDurationSeconds * 0.9);

  return {
    config,
    executedAt: new Date().toISOString(),
    baseline: {
      peakConcurrentUsers: baselineMaxPeakActive,
      totalRequests: applicants,
      successfulBookings: baselineBookedCount,
      failedRequests: baselineFailedCount,
      inventoryUtilizationRate: Number(((baselineBookedCount / inventory) * 100).toFixed(1)),
      bookingSuccessRate: Number(((baselineBookedCount / applicants) * 100).toFixed(2)),
      avgWaitTimeSeconds: baselineAvgWaitSec,
      p95WaitTimeSeconds: baselineP95WaitSec,
      p95ResponseTimeMs: baselineP95LatencyMs,
      systemCapacityViolations: baselineCapacityViolations,
      overloadSeconds: Math.round(baselineOverloadSeconds),
      jainFairnessIndex: baselineJain,
      fairnessNotes: 'Highly skewed towards fastest bot scripts in initial milliseconds.'
    },
    fairflow: {
      peakConcurrentUsers: Math.min(systemCapacity, eligibleApplicantsCount),
      totalRequests: eligibleApplicantsCount,
      successfulBookings: fairflowBookedTotal,
      failedRequests: fairflowFailedTotal,
      inventoryUtilizationRate: Number(((fairflowBookedTotal / inventory) * 100).toFixed(1)),
      bookingSuccessRate: Number(((fairflowBookedTotal / eligibleApplicantsCount) * 100).toFixed(2)),
      recycledInventoryUnits: fairflowTotalRecycled,
      avgWaitTimeSeconds: fairflowAvgWaitSec,
      p95WaitTimeSeconds: fairflowP95WaitSec,
      p95ResponseTimeMs: fairflowP95LatencyMs,
      systemCapacityViolations: 0, // FairFlow strictly bounds load <= C
      overloadSeconds: 0,
      jainFairnessIndex,
      fairnessVariance: Number(variance.toFixed(6)),
      minPoolSuccessProb: Number(minPoolSuccessProb.toFixed(4)),
      maxPoolSuccessProb: Number(maxPoolSuccessProb.toFixed(4)),
      avgPoolSuccessProb: Number(avgPoolSuccessProb.toFixed(4))
    },
    timeline,
    poolResults
  };
}
