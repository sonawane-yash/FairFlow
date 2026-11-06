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
  }
];

export const DEFAULT_SYNTHETIC_ACCOUNT = SYNTHETIC_ACCOUNTS[0];

