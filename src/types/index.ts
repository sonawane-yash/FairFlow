export type ScenarioType = 'railway' | 'concert' | 'government' | 'medical';

export interface ReservationScenario {
  id: ScenarioType;
  title: string;
  subtitle: string;
  domainName: string;
  inventoryTerm: string; // e.g., "Berths / Seats", "Concert Tickets", "Appointment Slots"
  demandUnit: string; // "Applicants", "Fans", "Citizens"
  defaultInventory: number;
  defaultApplicants: number;
  defaultCapacity: number;
  sampleRoutesOrEvents: {
    id: string;
    label: string;
    from?: string;
    to?: string;
    date: string;
    classesOrTiers: string[];
    quotasOrTypes: string[];
  }[];
}

export type ApplicationStatus =
  | 'submitted'
  | 'processing'
  | 'eligible'
  | 'verification_required'
  | 'rejected'
  | 'pool_assigned'
  | 'waiting'
  | 'window_active'
  | 'booked'
  | 'expired'
  | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface PassengerInfo {
  name: string;
  age: number;
  idType: string;
  idNumberSynthetic: string;
  seatPreference?: string;
}

export interface UserApplication {
  id: string;
  scenarioId: ScenarioType;
  submittedAt: string;
  routeOrEventId: string;
  routeOrEventLabel: string;
  date: string;
  tierOrClass: string;
  quotaOrType: string;
  passengers: PassengerInfo[];
  flexibleTiming: boolean;
  status: ApplicationStatus;
  riskAssessment: {
    level: RiskLevel;
    score: number; // 0 to 100
    verificationFlag: string;
    explanation: string;
  };
  allocation?: {
    poolId: string;
    poolName: string;
    bookingWindowStart: string;
    bookingWindowEnd: string;
    windowDurationMinutes: number;
    priorityOrder: number;
    randomSeedUsed: string;
  };
  bookingId?: string;
}

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'released';

export interface PassengerSeatAssignment {
  passengerIndex: number;
  passengerName: string;
  coach: string;
  seatNumber: number;
  berthType: string;
  berthCode: string; // LB, MB, UB, SL, SU, WS, AS, etc.
  bayNumber?: number;
}

export interface BookingRecord {
  id: string; // e.g. FF-2026-XXXXX
  applicationId: string;
  scenarioId: ScenarioType;
  passengerCount: number;
  primaryPassenger: string;
  itemDetails: string;
  poolId: string;
  amountSynthetic: number;
  currency: string;
  paymentStatus: PaymentStatus;
  reservedAt: string;
  confirmedAt?: string;
  seatSyntheticRef: string;
  passengerSeats?: PassengerSeatAssignment[];
  googleCalendarEvent?: {
    eventId: string;
    htmlLink: string;
    syncedAt: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    trainNumber?: string;
    trainName?: string;
    summary: string;
  };
}

export interface PoolSummary {
  id: string;
  name: string;
  applicantsCount: number;
  eligibleCount: number;
  windowLabel: string;
  status: 'upcoming' | 'active' | 'completed' | 'recycled';
  provisionalInventory: number;
  bookedCount: number;
  recycledCount: number;
  successProbability: number;
}

export type DemandDistribution = 'uniform' | 'burst' | 'concentrated' | 'random';
export type AllocationMethod = 'simultaneous_baseline' | 'proportional_pools' | 'dynamic_recycling';

export interface SimulationConfig {
  applicants: number;
  inventory: number;
  systemCapacity: number;
  numberOfPools: number;
  riskyTrafficPercent: number;
  bookingBehavior: DemandDistribution;
  allocationMethod: AllocationMethod;
  randomSeed: number;
  simulationDurationSeconds: number;
  userFailureRatePercent: number; // e.g. 5% checkout abandonment/timeout
}

export interface TimeStepMetric {
  timeSec: number;
  timeFormatted: string;
  // Baseline metrics
  baselineActiveSessions: number;
  baselineWaiting: number;
  baselineCompletedBookings: number;
  baselineFailedRequests: number;
  baselineServerLoadRatio: number; // >1.0 means capacity violated
  baselineInventoryRemaining: number;
  // FairFlow metrics
  fairflowActiveSessions: number;
  fairflowWaiting: number;
  fairflowCompletedBookings: number;
  fairflowRecycledInventory: number;
  fairflowInventoryRemaining: number;
  fairflowCurrentPoolIndex: number;
  fairflowCapacityUtilization: number;
}

export interface PoolMetricResult {
  poolIndex: number;
  poolName: string;
  allocatedInventory: number;
  recycledInventory: number;
  bookedInventory: number;
  applicants: number;
  eligibleApplicants: number;
  successProbability: number; // booked / eligible
}

export interface SimulationResult {
  config: SimulationConfig;
  executedAt: string;
  baseline: {
    peakConcurrentUsers: number;
    totalRequests: number;
    successfulBookings: number;
    failedRequests: number;
    inventoryUtilizationRate: number; // 0..100
    bookingSuccessRate: number; // successful / total applicants
    avgWaitTimeSeconds: number;
    p95WaitTimeSeconds: number;
    p95ResponseTimeMs: number;
    systemCapacityViolations: number;
    overloadSeconds: number;
    jainFairnessIndex: number;
    fairnessNotes: string;
  };
  fairflow: {
    peakConcurrentUsers: number;
    totalRequests: number;
    successfulBookings: number;
    failedRequests: number;
    inventoryUtilizationRate: number; // 0..100
    bookingSuccessRate: number;
    recycledInventoryUnits: number;
    avgWaitTimeSeconds: number;
    p95WaitTimeSeconds: number;
    p95ResponseTimeMs: number;
    systemCapacityViolations: number;
    overloadSeconds: number;
    jainFairnessIndex: number; // calculated mathematically
    fairnessVariance: number;
    minPoolSuccessProb: number;
    maxPoolSuccessProb: number;
    avgPoolSuccessProb: number;
  };
  timeline: TimeStepMetric[];
  poolResults: PoolMetricResult[];
}

export interface InventoryEvent {
  id: string;
  timestamp: string;
  poolName?: string;
  type: 'provision' | 'booking' | 'recycle' | 'timeout' | 'system';
  units: number;
  description: string;
}
