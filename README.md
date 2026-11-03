# FAIRFLOW: Fair Access & Dynamic Inventory Reservation System

**"An experimental reservation architecture that separates demand intake from booking access, controls system load, and dynamically manages scarce inventory."**

> **Notice:** *Research Prototype • Simulation-Based • Not affiliated with IRCTC, Indian Railways, or any real ticketing provider.*

---

## 1. Overview & Problem Statement

High-demand reservation systems (such as railway Tatkal quota releases, stadium concert sales, and urgent consular appointments) traditionally suffer from the **Synchronized Stampede**:
- 100,000+ applicants and automated bot scripts hit database locking endpoints at the exact same instant ($T=0$).
- Servers crash or experience exponential latency spikes ($>10,000\text{ ms}$).
- Optical scripts and low-latency bot scrapers monopolize inventory within milliseconds.
- Legitimate users face connection drops, timeouts, and zero allocation.

**FAIRFLOW** decomposes high-demand reservations into an asynchronous, queue-partitioned pipeline:
1. **Asynchronous Pre-Registration:** Demand is ingested hours in advance without simultaneous server stress.
2. **Eligibility & Verification Screening:** Automated bot telemetry and duplicate bursts are flagged before access windows open.
3. **Deterministic Random Shuffle:** Eligible users are assigned to randomized pools (Pools A through J).
4. **Controlled Admission Governor ($A_t = \min(W_t, C - L_t)$):** Ensures active concurrent sessions never exceed safe physical capacity ($C$).
5. **Dynamic Proportional Inventory ($Q_k = S_t \times \frac{N_k}{N_t}$):** Allocates inventory smoothly to active pools.
6. **Automatic Inventory Recycling:** Unexercised reservations from expired windows are dynamically returned to reserve for subsequent pools.

---

## 2. Mathematical Model

### A. Controlled Admission Governor
$$\mathcal{A}_t = \min\left(\mathcal{W}_t, \; \mathcal{C} - \mathcal{L}_t\right)$$
- $\mathcal{W}_t$: Waiting applicants queued for active pool
- $\mathcal{C}$: Safe maximum concurrent connection capacity
- $\mathcal{L}_t$: Current active user sessions

### B. Dynamic Proportional Allocation
$$Q_k = S_t \times \left(\frac{N_k}{N_t}\right)$$
- $S_t$: Remaining unbooked inventory at time $t$
- $N_k$: Eligible applicants in pool $k$
- $N_t$: Total remaining eligible applicants across active and future pools

### C. Jain's Fairness Index
$$J = \frac{\left(\sum_{k=1}^K p_k\right)^2}{K \times \sum_{k=1}^K p_k^2}$$
- $p_k$: Empirical booking success probability for pool $k$
- $K$: Total number of pools

*Note: In accordance with our methodology, $J=1.0$ is evaluated jointly with inventory utilization to avoid trivial zero-allocation scenarios.*

---

## 3. Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Running Locally
```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# The app runs on port 3000
http://localhost:3000
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## 4. Running Simulations

1. Navigate to the **Simulation Lab** tab (`/simulation`).
2. Click **"Run 100K Applicant Demo"** to run a benchmark comparing:
   - **Model A: Simultaneous Booking** (Unconstrained rush with capacity violations, dropped requests, and bot monopolization)
   - **Model B: FairFlow** (Controlled admission, 0 capacity violations, balanced Jain Index, dynamic recycling)
3. Adjust variables (Applicants from 10k to 500k, Inventory, Number of pools, Risky traffic %, Demand distribution) and observe the real-time Traffic Storm Visualizer.

---

## 5. Generic Reservation Scenarios Supported
- **High-Speed Railway (Tatkal Proof-of-Concept):** Morning AC berth quota allocations
- **Stadium Concert World Tour:** Arena ticket drops with high fan demand
- **Passport & Citizen Services:** Daily consular and biometrics appointment windows
- **Specialty Medical Clinic Access:** Super-specialist consultations allocated equitably

---

## 6. Known Research Limitations
- **Synthetic Data:** Uses synthetic citizen names, routes, and tickets. No personal data or real government IDs are collected.
- **Simulated Financial Transactions:** Payments are synthetic state transitions (Pending $\to$ Authorized $\to$ Captured) with zero monetary processing.
- **No Official Railway Integration:** This is an independent academic architecture prototype; it does not connect to IRCTC or any official booking system.
- **Open Optimization Frontier:** The trade-offs between window durations, user checkout timeouts, and mathematical fairness remain an ongoing research topic.
