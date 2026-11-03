# Interactive Coach & Berth Visual Map and Live RailMadad Incident Resolution

Deliver an interactive Indian Railways coach and berth visual seating selector and an end-to-end RailMadad 139 grievance resolution and status tracking system, styled with high-contrast railway station board aesthetics.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your responses, we are prioritizing:
> 1. **Interactive Coach & Berth Visual Layout Map**: Multi-class visual coach layouts (1A, 2A, 3A, SL, CC) with real-time berth status and interactive click-to-select during booking.
> 2. **Live RailMadad Grievance Resolution & Status Tracker**: Realistic end-to-end grievance logging, complaint reference number (CRN) tracking, automated On-Board Housekeeping Staff (OBHS) dispatch timeline, and OTP resolution verification.
> 3. **Station Board Visual Polish**: Crisp high-contrast Indian Railways livery (`#0B2545` deep navy, `#EA580C` IRCTC orange, `#FFB703` amber LED platform displays), tabular numerals, and zero-pill typographic discipline.

---

## 1. Overview & Core Concept

- **What It Does**:
  - **Interactive Coach Explorer & Berth Selector**: Allows passengers to visually explore train coaches (Sleeper, 3rd AC, 2nd AC, 1st AC, Chair Car) with true-to-life Indian Railways bay layouts, view vacant vs occupied berths, filter by quota, and pick their preferred berth directly during ticket booking.
  - **RailMadad 139 Incident Resolution System**: A comprehensive grievance redressal portal where passengers can report on-board issues (medical emergencies, AC breakdown, coach cleanliness, catering complaints, security), receive an instant tracking ID, and follow a simulated CRIS/RPF dispatch resolution timeline from assignment to station resolution.
- **Target Audience**: Indian Railways passengers, travelers booking Tatkal/General tickets, and platform administrators verifying passenger care operations.
- **Key Value**: Replaces abstract berth preference dropdowns with an intuitive visual seating map and provides transparent, actionable grievance redressal with realistic railway operational timelines.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Train Search / Booking Flow ]
              │
              ▼
   [ Select Coach & Quota ]
              │
              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Interactive Coach Layout Map (SL / 3A / 2A / 1A / CC)  │
 │  • Coach selector tabs (e.g. B1, B2, B3, S1, S2)       │
 │  • Interactive Berth Bay (Lower, Middle, Upper, Side)  │
 │  • Real-time Vacancy & Gender/Quota highlights         │
 │  • Click berth -> Auto-assigns to Passenger List       │
 └────────────────────────────────────────────────────────┘
              │
              ▼
    [ Confirm & Issue PNR ]

-----------------------------------------------------------

[ Passenger Services / RailMadad ]
              │
              ▼
 ┌────────────────────────────────────────────────────────┐
 │ File Incident or Track Existing CRN                    │
 │  • Categories: Medical, Electrical/AC, Bio-Toilet, RPF │
 │  • Auto-populates PNR & Coach/Berth from Active Ticket │
 │  • Generates Unique Complaint Number (e.g., RM-84920)  │
 └────────────────────────────────────────────────────────┘
              │
              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Live RailMadad Dispatch Timeline                       │
 │  • Step 1: Grievance Logged & CRIS Prioritized         │
 │  • Step 2: OBHS / Coach Attendant Assigned with Phone  │
 │  • Step 3: Next Junction Intercept (e.g. Bhopal Jn)    │
 │  • Step 4: Passenger OTP Verification & Closure        │
 └────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast Indian Railways station indicator board aesthetic with clean modern typography, crisp hairlines, and legible LED station board accents.
- **Color Palette & Discipline**:
  - Neutral Canvas (60%): `#0B2545` (Midnight Railways Navy) / `#001D3D` (Sub-deck) for dark displays; crisp `#F8FAFC` and `#FFFFFF` for daylight surfaces.
  - Structural Surfaces (30%): Deep blue-slate containers (`#07162C`), hairline borders (`#1E3A5F` / `#E2E8F0`), and clear tabular cards.
  - Accent Budget (10%): `#EA580C` (IRCTC Livery Vermilion) for primary actions, `#FFB703` (Amber Station Board LED) for status badges and platform displays, `#10B981` (Signal Green) for available berths.
- **Berth Color Signaling**:
  - Available: Signal Green (`#10B981`) with clear text label `Available`
  - Selected: Warm Amber (`#FFB703`) with bold checkmark
  - Booked: Quiet Slate (`#64748B`)
  - Reserved Quota (Ladies/Senior): Subtle Indigo/Purple
- **Typography & Tabular Discipline**: Tabular numerals (`tabular-nums font-mono`) for all berth numbers, train schedules, PNRs, and CRNs. Zero-pill metadata separated by typographic dots (`·`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Coach Seating Representation
- **Chosen Approach**: Authentic 2D compartment bay architecture modeled after standard Indian Railways LHB & ICF coach configurations (e.g., 72/80 berths for Sleeper, 64/72 for 3A, 46/54 for 2A, 24 for 1A).
- **Why**: Passengers in India are intimately familiar with Lower, Middle, Upper, Side Lower, and Side Upper berth designations; a faithful visual layout empowers users to pick preferred window or lower berths for seniors.
- **Alternatives Considered**: Generic airplane-style seating grid (rejected as it does not reflect Indian Railways coupe and bay layouts).

### Decision 2: RailMadad Incident Tracking State
- **Chosen Approach**: Persistent in-memory + local storage complaint registry pre-seeded with sample active grievances and real-time step progression timers.
- **Why**: Allows instant testability without waiting hours for real train operations, demonstrating automated OBHS attendance and passenger satisfaction closure.

---

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ App.tsx                                                                 │
│   ├── Header.tsx (Navigation & Station Clock)                           │
│   │                                                                     │
│   ├── BookingView.tsx                                                   │
│   │     └── CoachBerthMapModal.tsx (NEW)                                │
│   │           ├── CoachSelectorTabs (A1, B1, B2, S1, S2...)             │
│   │           ├── CoachBayLayout (Berth Grid, Windows, Gangway, Doors)  │
│   │           ├── BerthLegend (Available, Occupied, Quota, Selected)    │
│   │           └── BerthDetailsTooltip (Type, Window/Aisle, Amenities)   │
│   │                                                                     │
│   ├── ServicesHub.tsx                                                   │
│   │     └── RailMadadTracker.tsx (NEW / EXPANDED)                       │
│   │           ├── GrievanceForm (Category, Urgency, PNR, Photo Upload)  │
│   │           ├── IncidentCRNLookup (Track Existing Complaint)          │
│   │           ├── LiveDispatchTimeline (CRIS -> OBHS -> Station OTP)    │
│   │           └── ResolutionFeedbackCard (Rating & Remarks)             │
│   │                                                                     │
│   └── MyBookingsView.tsx (Includes "View Coach Layout" & "File Madad")  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component & Data Strategy
1. **`CoachBerthMapModal.tsx`**:
   - Accepts train number, travel class (`1A`, `2A`, `3A`, `SL`, `CC`), active quota, and passenger count.
   - Generates deterministic coach composition based on train class (e.g., Train 12952 Rajdhani Express with coaches `A1`, `A2`, `B1`–`B6`, `H1`).
   - Callback `onSelectBerth(coachId, berthNumber, berthType)` wires directly into passenger form rows.
2. **`RailMadadTracker.tsx`**:
   - Manages list of active and historical complaints linked to passenger PNRs.
   - Realistic step-by-step resolution simulation with countdown timers (OBHS arrives in 12 mins at next junction).
   - Generates verified PDF/text incident receipt.

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to ensure zero TypeScript errors.
2. **Coach Layout Verification**:
   - Test across Sleeper (SL), 3-Tier AC (3A), 2-Tier AC (2A), 1st AC (1A), and Chair Car (CC).
   - Verify selecting a berth properly assigns coach and berth number into the booking form.
3. **RailMadad Workflow**:
   - File a new grievance under "Bio-Toilet Cleanliness" or "AC Not Cooling".
   - Verify complaint reference number (CRN) creation, step-by-step status progression, and OTP closure.
