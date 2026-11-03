export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  roleTitle?: string;
  aadhaarStatus: string;
  berthPreference: string;
  foodChoice: 'Veg' | 'Non-Veg' | 'Jain';
  seniorCitizen: boolean;
  state: string;
  pincode: string;
  avatarInitials: string;
}

export interface SyntheticAccount extends UserProfile {
  password: string;
  description: string;
  categoryLabel: string;
}

export type LoginIdentifierType = 'phone' | 'email' | 'username';
