import { ReservationScenario } from '../types';

export const RESERVATION_SCENARIOS: ReservationScenario[] = [
  {
    id: 'railway',
    title: 'High-Speed Railway (Tatkal Proof-of-Concept)',
    subtitle: 'Simulating high-demand morning quota release for limited AC berths.',
    domainName: 'Railway Transportation',
    inventoryTerm: 'Berths / Seats',
    demandUnit: 'Applicants',
    defaultInventory: 1000,
    defaultApplicants: 100000,
    defaultCapacity: 5000,
    sampleRoutesOrEvents: [
      {
        id: 'train-12001',
        label: 'Express 12001 (New Delhi → Varanasi Superfast)',
        from: 'NDLS (New Delhi)',
        to: 'BSB (Varanasi)',
        date: '2026-09-15',
        classesOrTiers: ['Executive Chair Car (EC)', 'AC 2 Tier (2A)', 'AC 3 Tier (3A)', 'AC Chair Car (CC)'],
        quotasOrTypes: ['FairFlow Experimental Quota', 'General Pre-Reg', 'Senior / Accessible']
      },
      {
        id: 'train-12952',
        label: 'Rajdhani 12952 (Mumbai Central → New Delhi Premium)',
        from: 'MMCT (Mumbai Central)',
        to: 'NDLS (New Delhi)',
        date: '2026-09-18',
        classesOrTiers: ['AC 1st Class (1A)', 'AC 2 Tier (2A)', 'AC 3 Tier (3A)'],
        quotasOrTypes: ['FairFlow Experimental Quota', 'Flexi-Pass Prototype']
      }
    ]
  },
  {
    id: 'concert',
    title: 'Stadium Concert World Tour',
    subtitle: '500,000 eager fans competing for 25,000 arena seats in under 3 minutes.',
    domainName: 'Entertainment & Ticketing',
    inventoryTerm: 'Concert Tickets',
    demandUnit: 'Fans',
    defaultInventory: 2500,
    defaultApplicants: 150000,
    defaultCapacity: 5000,
    sampleRoutesOrEvents: [
      {
        id: 'concert-stadium-1',
        label: 'Cosmic Eclipse World Tour - Metropolis Arena',
        date: '2026-10-12',
        classesOrTiers: ['VIP Floor Standing', 'Lower Bowl Premium', 'Upper Bowl Standard', 'General Admission'],
        quotasOrTypes: ['Verified Fan Pool', 'Early Supporter Tier', 'Public General Pool']
      },
      {
        id: 'concert-festival-2',
        label: 'Solstice Electronic Music Carnival - Main Stage 3-Day',
        date: '2026-11-05',
        classesOrTiers: ['VIP Pass', 'Standard 3-Day Pass', 'Single Day Saturday'],
        quotasOrTypes: ['Pre-Registered Pool', 'Local Resident Allocation']
      }
    ]
  },
  {
    id: 'government',
    title: 'Passport & Citizen Services',
    subtitle: 'Daily release of critical consular and biometrics appointment windows.',
    domainName: 'Public Administration',
    inventoryTerm: 'Appointment Slots',
    demandUnit: 'Citizens',
    defaultInventory: 500,
    defaultApplicants: 25000,
    defaultCapacity: 2000,
    sampleRoutesOrEvents: [
      {
        id: 'govt-passport-central',
        label: 'Central Passport Seva Kendra - Biometrics & Tatkal Verification',
        date: '2026-09-20',
        classesOrTiers: ['Standard Biometrics Slot', 'Urgent Tatkal Document Verification', 'Senior Citizen Express'],
        quotasOrTypes: ['Pre-screened Online Pool', 'First-time Applicant Pool']
      }
    ]
  },
  {
    id: 'medical',
    title: 'Specialty Medical Clinic Access',
    subtitle: 'Rare super-specialist consultations allocated with strict fairness.',
    domainName: 'Healthcare Allocations',
    inventoryTerm: 'Consultation Slots',
    demandUnit: 'Patients',
    defaultInventory: 150,
    defaultApplicants: 12000,
    defaultCapacity: 1000,
    sampleRoutesOrEvents: [
      {
        id: 'medical-neuro-special',
        label: 'Advanced Neurological Institute - Senior Consultant OPD',
        date: '2026-09-22',
        classesOrTiers: ['Morning Specialized Review', 'Afternoon Follow-up Slot'],
        quotasOrTypes: ['Referral-Verified Pool', 'Interstate Patient Pool']
      }
    ]
  }
];
