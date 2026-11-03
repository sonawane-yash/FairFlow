import { SyntheticAccount } from '../types/auth';

export const SYNTHETIC_ACCOUNTS: SyntheticAccount[] = [
  {
    id: 'usr-synth-001',
    fullName: 'Rahul Sharma',
    username: 'rahul_sharma',
    email: 'rahul.sharma@fairflow.in',
    mobile: '9876543210',
    password: 'IRCTC@2026',
    roleTitle: 'IRCTC Verified Master Passenger',
    categoryLabel: 'Standard Account (Recommended)',
    aadhaarStatus: 'Aadhaar Verified (UIDAI • XXXX-XXXX-7842)',
    berthPreference: 'Lower Berth (LB)',
    foodChoice: 'Veg',
    seniorCitizen: false,
    state: 'New Delhi',
    pincode: '110001',
    avatarInitials: 'RS',
    description: 'Standard master passenger account pre-configured with Aadhaar verification and regular express booking profile.'
  },
  {
    id: 'usr-synth-002',
    fullName: 'Priya Patel',
    username: 'priya_patel',
    email: 'priya.patel@fairflow.in',
    mobile: '9812345678',
    password: 'Tatkal#Pass2026',
    roleTitle: 'Tatkal Super Traveler (AC Quota)',
    categoryLabel: 'Tatkal Fast-Pass Account',
    aadhaarStatus: 'Aadhaar Verified (UIDAI • XXXX-XXXX-2190)',
    berthPreference: 'Side Lower (SL)',
    foodChoice: 'Jain',
    seniorCitizen: false,
    state: 'Gujarat',
    pincode: '380001',
    avatarInitials: 'PP',
    description: 'Fast-checkout account optimized with instant payment authorization for 10:00 AM AC Tatkal rush.'
  },
  {
    id: 'usr-synth-003',
    fullName: 'Amit Verma',
    username: 'amit_verma',
    email: 'amit.verma@fairflow.in',
    mobile: '9898912345',
    password: 'RailFast@99',
    roleTitle: 'Executive Vande Bharat Frequent Commuter',
    categoryLabel: 'Executive Lounge Account',
    aadhaarStatus: 'Aadhaar Verified (UIDAI • XXXX-XXXX-6531)',
    berthPreference: 'Window Seat (WS)',
    foodChoice: 'Non-Veg',
    seniorCitizen: false,
    state: 'Maharashtra',
    pincode: '400001',
    avatarInitials: 'AV',
    description: 'Executive frequent traveler profile enabled for station lounges, e-catering, and priority waitlist pool.'
  }
];

export const DEFAULT_SYNTHETIC_ACCOUNT = SYNTHETIC_ACCOUNTS[0];
