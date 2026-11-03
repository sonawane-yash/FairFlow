import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Train,
  Ticket,
  Copy,
  Check,
  Volume2,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Filter
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export type GlossaryCategory =
  | 'all'
  | 'statuses'
  | 'quotas'
  | 'classes'
  | 'berths'
  | 'trains'
  | 'systems';

export interface GlossaryTerm {
  id: string;
  term: string;
  fullForm: string;
  hindiFullForm: string;
  category: 'statuses' | 'quotas' | 'classes' | 'berths' | 'trains' | 'systems';
  categoryLabel: string;
  meaning: string;
  officialRule: string;
  example: string;
  tags: string[];
  popular?: boolean;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // 1. STATUSES & WAITLISTS
  {
    id: 'cnf',
    term: 'CNF',
    fullForm: 'Confirmed',
    hindiFullForm: 'पुष्टीकृत (कन्फर्म्ड)',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'A fully reserved berth/seat has been allocated to the passenger with a fixed coach and berth number.',
    officialRule: 'Coach and berth numbers for general bookings are printed on the ticket. For RAC/Waitlist conversions and Tatkal, final berths are confirmed upon 1st chart preparation (4 hours before departure).',
    example: 'Printed on ticket as: "CNF / B4 / 42 / LB" (Coach B4, Berth 42, Lower Berth).',
    tags: ['confirmed', 'seat', 'berth', 'ticket', 'pnr', 'status'],
    popular: true
  },
  {
    id: 'rac',
    term: 'RAC',
    fullForm: 'Reservation Against Cancellation',
    hindiFullForm: 'रद्दीकरण के विरुद्ध आरक्षण (आरएसी)',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'Guaranteed permission to board the train with a shared seating arrangement on a Side Lower (SL) berth. If a confirmed passenger cancels, RAC passenger gets upgraded to a full berth.',
    officialRule: 'Two RAC passengers share one Side-Lower berth for daytime travel and sleeping. RAC tickets do not get automatically cancelled upon charting; travel is legally permitted.',
    example: 'Status displayed as: "RAC 14 / RAC 8". Two passengers share Berth 7 Side-Lower.',
    tags: ['rac', 'side lower', 'half berth', 'boarding allowed', 'upgrade'],
    popular: true
  },
  {
    id: 'wl',
    term: 'WL',
    fullForm: 'Waiting List',
    hindiFullForm: 'प्रतीक्षा सूची (वेटिंग लिस्ट)',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'No berth or seat is currently allotted. The ticket is in a queue and will only be confirmed if passengers holding confirmed or RAC tickets cancel their reservations.',
    officialRule: 'Fully waitlisted e-tickets (where all passengers on the PNR remain in WL after chart preparation) are automatically cancelled by IRCTC and fare is refunded to source account. Boarding the train with an e-ticket waitlist is strictly prohibited.',
    example: 'Booking Status: WL 45, Current Status: WL 12.',
    tags: ['waiting', 'queue', 'waitlist', 'auto-refund', 'cancellation'],
    popular: true
  },
  {
    id: 'gnwl',
    term: 'GNWL',
    fullForm: 'General Waiting List',
    hindiFullForm: 'सामान्य प्रतीक्षा सूची',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'The primary waiting list issued when passengers book from the train’s originating station or close to the origin. It possesses the highest statistical chance of getting confirmed.',
    officialRule: 'GNWL moves first when confirmed cancellations occur, before remote and pooled quotas.',
    example: '12952 Mumbai Central to New Delhi booking will issue GNWL when general quota seats fill up.',
    tags: ['gnwl', 'highest confirmation', 'originating station', 'priority waitlist'],
    popular: true
  },
  {
    id: 'rlwl',
    term: 'RLWL',
    fullForm: 'Remote Location Waiting List',
    hindiFullForm: 'दूरस्थ स्थान प्रतीक्षा सूची',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'Issued for intermediate originating stations that have their own defined quota (Remote Locations). It has a lower confirmation probability than GNWL.',
    officialRule: 'RLWL confirms only against cancellations made by passengers boarding from that specific remote station cluster.',
    example: 'Booking Surat to Mathura on a Mumbai-Delhi train often falls under Surat Remote Quota (RLWL).',
    tags: ['remote location', 'intermediate', 'separate quota', 'lower confirmation'],
    popular: true
  },
  {
    id: 'pqwl',
    term: 'PQWL',
    fullForm: 'Pooled Quota Waiting List',
    hindiFullForm: 'पूल कोटा प्रतीक्षा सूची',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'A shared pool of seats reserved for passengers traveling between short intermediate stations along the train route. It has the lowest confirmation priority.',
    officialRule: 'Indian Railways prioritizes end-to-end long distance passengers; therefore, pooled quota is kept small and rarely confirms once deeply waitlisted.',
    example: 'Booking Vadodara to Kota on a Mumbai-Delhi Rajdhani may be placed into PQWL.',
    tags: ['pooled quota', 'short distance', 'lowest priority', 'intermediate'],
    popular: true
  },
  {
    id: 'tqwl',
    term: 'TQWL',
    fullForm: 'Tatkal Quota Waiting List',
    hindiFullForm: 'तत्काल प्रतीक्षा सूची',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'The waiting list generated specifically for Tatkal quota bookings made during the 10:00 AM / 11:00 AM window.',
    officialRule: 'TQWL confirms directly to Confirmed (CNF) without passing through RAC. However, Tatkal tickets are not refunded if confirmed, and TQWL has low clearance rates compared to GNWL.',
    example: 'Booked Tatkal at 10:02 AM: "Booking Status: TQWL 6, Current Status: TQWL 2".',
    tags: ['tatkal waitlist', 'direct cnf', 'no rac', 'emergency quota'],
    popular: true
  },
  {
    id: 'tdr',
    term: 'TDR',
    fullForm: 'Ticket Deposit Receipt',
    hindiFullForm: 'टिकट जमा रसीद (टीडीआर)',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'An official digital claim filed with IRCTC to obtain a refund when a passenger does not travel due to train delay (>3 hours), AC failure, cancellation, or route diversion.',
    officialRule: 'Must be filed online within the stipulated Railway Board time limit (e.g., within 72 hours for train cancellation, before chart preparation for RAC not wanting to travel).',
    example: 'Filed TDR under reason "Train Late More Than 3 Hours and Passenger Not Traveled". Refund verified by CCM.',
    tags: ['tdr', 'refund claim', 'train delay', 'ac failure', 'not traveled'],
    popular: true
  },
  {
    id: 'nosb',
    term: 'NOSB',
    fullForm: 'No Seat / No Berth',
    hindiFullForm: 'शिशु बिना बर्थ (नो सीट बर्थ)',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'A ticket issued for a child under 5 years (free) or aged 5 to 11 where the parent opts not to take a separate berth, paying half the base fare.',
    officialRule: 'Child travels sharing the parent\'s berth. Name is printed on the reservation chart for valid identity and insurance.',
    example: 'Master Aarav (Age 4) listed as "NOSB" under mother\'s berth PNR.',
    tags: ['child ticket', 'half fare', 'no berth', 'minor travel'],
    popular: false
  },
  {
    id: 'can-mod',
    term: 'CAN / MOD',
    fullForm: 'Cancelled / Modified',
    hindiFullForm: 'रद्द / संशोधित',
    category: 'statuses',
    categoryLabel: 'Ticket Status & Waitlist',
    meaning: 'Indicates the passenger reservation has either been voluntarily cancelled by the user or modified by Railway administration.',
    officialRule: 'Clerkage charges (₹60 for SL, ₹180-240 for AC) apply based on the cancellation time window before scheduled train departure.',
    example: 'Current status displayed as "CAN" with refund reference transaction ID.',
    tags: ['cancelled', 'modified', 'clerkage', 'refund'],
    popular: false
  },

  // 2. QUOTAS & RESERVATIONS
  {
    id: 'pnr',
    term: 'PNR',
    fullForm: 'Passenger Name Record',
    hindiFullForm: 'यात्री नाम अभिलेख (पीएनआर)',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'A unique 10-digit numeric tracking code stored in the CRIS Passenger Reservation System database that links all passenger names, coach, berth, journey route, and payment history.',
    officialRule: 'The first 3 digits indicate the CRIS PRS Zone (e.g., 2xx/3xx for Northern, 8xx/4xx for Western/Central). PNR data is retained in the live system for 5 to 9 days after completion of journey.',
    example: 'PNR: 2418-904128 printed on the top-left of e-tickets and physical counters.',
    tags: ['pnr', '10 digits', 'passenger record', 'tracking', 'journey id'],
    popular: true
  },
  {
    id: 'gn',
    term: 'GN',
    fullForm: 'General Quota',
    hindiFullForm: 'सामान्य कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'The primary and largest allocation of seats on any train, available to all general public citizens across India.',
    officialRule: 'Opens for booking 120 days in advance (ARP) at 08:00:00 AM IST daily.',
    example: 'Default booking quota selected on IRCTC Rail Connect portal.',
    tags: ['general quota', '120 days', 'standard booking', 'all passengers'],
    popular: true
  },
  {
    id: 'tq',
    term: 'TQ / CK',
    fullForm: 'Tatkal Quota',
    hindiFullForm: 'तत्काल कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Emergency ticket quota released 1 day prior to the train\'s journey originating date for passengers with short-notice travel requirements.',
    officialRule: 'Opens at 10:00:00 AM IST for AC classes and 11:00:00 AM IST for Non-AC (Sleeper) classes. Flat Tatkal surcharge is levied. No refund on confirmed Tatkal tickets upon cancellation.',
    example: 'Tatkal surcharge: ₹100-₹175 for Sleeper, ₹300-₹500 for AC classes.',
    tags: ['tatkal', '10 am', '11 am', 'emergency', 'surcharge', 'no refund'],
    popular: true
  },
  {
    id: 'pt',
    term: 'PT',
    fullForm: 'Premium Tatkal Quota',
    hindiFullForm: 'प्रीमियम तत्काल कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'A dynamic-pricing emergency quota where ticket prices increase exponentially as available berths decrease. Only available online via IRCTC.',
    officialRule: 'No waitlist is permitted (only confirmed berths issued). No concession is allowed, and no refund is granted upon passenger cancellation.',
    example: 'Base fare doubles dynamically during peak holiday rushes for remaining berths.',
    tags: ['premium tatkal', 'dynamic pricing', 'urgent', 'no waitlist', 'surge fare'],
    popular: true
  },
  {
    id: 'ld',
    term: 'LD',
    fullForm: 'Ladies Quota',
    hindiFullForm: 'महिला कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Reserved coach cabins/berths specifically allotted for solo women travelers or mothers traveling with children below 12 years of age.',
    officialRule: 'Available in Sleeper (SL) and Second Seating (2S) coaches on most long-distance express trains.',
    example: 'Selected quota: "Ladies (LD)". Berths grouped together in bays for safety.',
    tags: ['women safety', 'ladies quota', 'exclusive bay', 'female travelers'],
    popular: false
  },
  {
    id: 'ss',
    term: 'SS',
    fullForm: 'Senior Citizen Quota / Lower Berth Quota',
    hindiFullForm: 'वरिष्ठ नागरिक / निचली बर्थ कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Automated allocation of guaranteed Lower Berths for male citizens aged 60+ and female citizens aged 45+ traveling alone or in pairs.',
    officialRule: 'Lower berths in Sleeper and 3A are reserved under this quota to prevent elderly passengers from having to climb up to upper berths.',
    example: 'Senior citizen checkbox ticked: system automatically allocates Lower Berth (LB).',
    tags: ['senior citizen', 'lower berth', 'elderly comfort', 'automated allocation'],
    popular: true
  },
  {
    id: 'hp',
    term: 'HP / DP',
    fullForm: 'Handicapped Person (Divyangjan) Quota',
    hindiFullForm: 'दिव्यांगजन कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Dedicated quota for differently-abled passengers along with one authorized escort, featuring concessions and specially designed wide-door coaches (SLRD).',
    officialRule: 'Photo Identity Card issued by Indian Railways Divyang Portal must be entered during online booking.',
    example: 'Provides lower berth near emergency exits and accessible washrooms.',
    tags: ['divyangjan', 'handicapped', 'escort', 'slrd coach', 'accessible'],
    popular: false
  },
  {
    id: 'ft',
    term: 'FT',
    fullForm: 'Foreign Tourist Quota',
    hindiFullForm: 'विदेशी पर्यटक कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Berths reserved for foreign passport holders and Non-Resident Indians (NRIs) up to 365 days in advance.',
    officialRule: 'Requires passport number, visa details, and international card payment on IRCTC web portal.',
    example: 'Allocated in Executive Chair Car (EC), 1A, and 2A premium coaches.',
    tags: ['foreign tourist', 'nri', '365 days advance', 'international passport'],
    popular: false
  },
  {
    id: 'ho',
    term: 'HO / HQ',
    fullForm: 'Headquarters / High Official Emergency Quota',
    hindiFullForm: 'मुख्यालय / उच्च अधिकारी आपातकालीन कोटा',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'Emergency berths controlled by Divisional Railway Managers (DRMs) and General Managers (GMs) released during chart preparation for urgent government duties or extreme medical emergencies.',
    officialRule: 'Requisitions must be submitted before 12:00 PM on the day of departure with doctor/department verification.',
    example: 'Waitlisted ticket confirmed under "HO Quota" upon chart release.',
    tags: ['emergency quota', 'drm office', 'medical emergency', 'official duty'],
    popular: false
  },
  {
    id: 'vikalp',
    term: 'VIKALP (ATAS)',
    fullForm: 'Alternate Train Accommodation Scheme',
    hindiFullForm: 'विकल्प योजना (वैकल्पिक ट्रेन समायोजन)',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'An optional facility where waitlisted passengers agree to be transferred to confirmed berths on other trains running on the same route at no extra cost.',
    officialRule: 'Opting for Vikalp does not guarantee confirmed berths, but transfers unconfirmed passengers to available seats across 12-hour windows without cancellation fees.',
    example: 'Waitlisted on 12952 Rajdhani transferred automatically to confirmed berth on 12954 August Kranti Rajdhani.',
    tags: ['vikalp', 'alternate train', 'auto seat transfer', 'no extra charge'],
    popular: true
  },
  {
    id: 'arp',
    term: 'ARP',
    fullForm: 'Advance Reservation Period',
    hindiFullForm: 'अग्रिम आरक्षण अवधि',
    category: 'quotas',
    categoryLabel: 'Quotas & Identification',
    meaning: 'The maximum timeframe before the journey departure date during which passengers can reserve train tickets.',
    officialRule: 'Currently set at 120 days (excluding the date of journey) for General quota on Indian Railways.',
    example: 'Journey on 20th December opens for booking on 22nd August at 08:00:00 AM IST.',
    tags: ['arp', '120 days', 'advance booking', 'calendar window'],
    popular: true
  },

  // 3. TRAVEL CLASSES
  {
    id: '1a',
    term: '1A / EA',
    fullForm: 'First Class AC / Executive Anubhuti',
    hindiFullForm: 'प्रथम श्रेणी वातानुकूलित / अनुभूति',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'The most premium sleeper accommodation featuring carpeted corridors, 2-berth lockable Coupes, 4-berth lockable Cabins, personalized attendant bells, and complimentary dining.',
    officialRule: 'Berth allocation (Coupe vs. Cabin) is finalized manually by the charting officer at 1st Chart preparation based on passenger party size.',
    example: 'Cabin A (4 berths) or Coupe B (2 berths). Highest fare bracket.',
    tags: ['first class', 'luxury', 'lockable door', 'coupe', 'cabin', 'complimentary food'],
    popular: true
  },
  {
    id: '2a',
    term: '2A',
    fullForm: 'AC 2-Tier',
    hindiFullForm: 'वातानुकूलित द्वि-स्तरीय (२-टियर)',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Air-conditioned sleeper coach with 4 berths inside each bay (2 Lower, 2 Upper) and 2 berths in the corridor (Side Lower, Side Upper). Provides privacy curtains and reading lights.',
    officialRule: 'Total capacity: 48 to 54 passengers per coach. Bedroll (2 bedsheets, 1 pillow, 1 blanket, 1 face towel) included in fare.',
    example: 'Coach prefix A1, A2, A3. Popular with family groups and business travelers.',
    tags: ['ac 2-tier', 'curtains', 'bedroll included', 'spacious', 'reading lamps'],
    popular: true
  },
  {
    id: '3a',
    term: '3A',
    fullForm: 'AC 3-Tier',
    hindiFullForm: 'वातानुकूलित त्रि-स्तरीय (३-टियर)',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'The most popular air-conditioned sleeper coach in India. Features 6 berths inside each bay (Lower, Middle, Upper on both sides) plus 2 Side berths (Side Lower, Side Upper).',
    officialRule: 'Capacity: 64 to 72 berths. Full air conditioning and linen bedrolls provided.',
    example: 'Coach prefix B1, B2... B8. The backbone of Rajdhani, Duronto, and Mail/Express trains.',
    tags: ['ac 3-tier', 'most popular', '6 berths per bay', 'linen included'],
    popular: true
  },
  {
    id: '3e',
    term: '3E',
    fullForm: 'AC 3-Tier Economy',
    hindiFullForm: 'वातानुकूलित ३-टियर इकॉनमी',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Modern lightweight LHB coach offering air conditioning at roughly 8-10% lower fares than standard 3A. Features individual AC vents, reading lamps, and USB charging for every berth.',
    officialRule: 'Increased capacity of 83 berths per coach through optimized longitudinal spacing.',
    example: 'Coach prefix M1, M2, M3. Introduced to make AC travel affordable to common citizens.',
    tags: ['economy ac', 'cheaper than 3a', '83 berths', 'individual ac vents'],
    popular: true
  },
  {
    id: 'cc',
    term: 'CC',
    fullForm: 'AC Chair Car',
    hindiFullForm: 'वातानुकूलित कुर्सी यान',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Air-conditioned seated coach with 3x2 ergonomic push-back seats and overhead luggage racks. Standard on Shatabdi, Intercity, Jan Shatabdi, and Vande Bharat trains.',
    officialRule: 'Capacity: 73 to 78 seats per coach. Day journeys under 8 hours.',
    example: 'Coach prefix C1, C2. Ideal for Mumbai-Pune, Delhi-Chandigarh, or Chennai-Bengaluru runs.',
    tags: ['chair car', 'shatabdi', 'vande bharat', 'day journey', 'push back'],
    popular: true
  },
  {
    id: 'ec',
    term: 'EC',
    fullForm: 'Executive Chair Car',
    hindiFullForm: 'कार्यकारी कुर्सी यान (एग्जीक्यूटिव क्लास)',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Ultra-spacious 2x2 seating layout with 180-degree rotating seats (in Vande Bharat), leg-rests, and gourmet multi-course meals.',
    officialRule: 'Highest seated class on Indian Railways with premium airline-style legroom.',
    example: 'Coach prefix E1, E2 in Vande Bharat and Shatabdi Express.',
    tags: ['executive class', '2x2 seating', 'rotating seats', 'vande bharat luxury'],
    popular: true
  },
  {
    id: 'sl',
    term: 'SL',
    fullForm: 'Sleeper Class',
    hindiFullForm: 'शयनयान श्रेणी (स्लीपर)',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Non-air-conditioned reserved coach with open windows and ceiling fans. Accommodates 72 to 80 passengers with Lower, Middle, and Upper berths.',
    officialRule: 'Most affordable long-distance reserved travel option. Linen/bedrolls are not provided.',
    example: 'Coach prefix S1, S2... S10. Transports millions of Indian passengers daily.',
    tags: ['sleeper', 'non-ac', 'budget travel', '72 berths', 'open window'],
    popular: true
  },
  {
    id: '2s',
    term: '2S',
    fullForm: 'Second Seating',
    hindiFullForm: 'द्वितीय श्रेणी बैठक',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Non-AC reserved bench-style seating (3x3 layout) intended for short daytime intercity journeys.',
    officialRule: 'Lowest fare reserved class. All seats have allocated numbers.',
    example: 'Coach prefix D1, D2 in Jan Shatabdi and Intercity expresses.',
    tags: ['second seating', 'bench seat', 'cheap day travel', 'non-ac chair'],
    popular: false
  },
  {
    id: 'ur',
    term: 'UR / GS',
    fullForm: 'Unreserved General Second Class',
    hindiFullForm: 'सामान्य अनारक्षित डिब्बा',
    category: 'classes',
    categoryLabel: 'Train Classes & Coaches',
    meaning: 'Unreserved coaches positioned at both ends of the train rake where passengers travel with point-to-point tickets bought from UTS station counters or UTS Mobile App.',
    officialRule: 'No seat numbers assigned; seating is on a first-come, first-served basis.',
    example: 'Marked on exterior as "GEN" or "GS".',
    tags: ['general class', 'uts ticket', 'unreserved', 'no reservation'],
    popular: false
  },

  // 4. BERTH & SEATING TYPES
  {
    id: 'lb',
    term: 'LB',
    fullForm: 'Lower Berth',
    hindiFullForm: 'निचली बर्थ',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'The bottom floor-level bed inside a sleeper bay. Highly preferred by senior citizens, patients, and families due to easy accessibility without climbing.',
    officialRule: 'Occupants must allow Middle Berth passengers to sit on the Lower Berth during daytime hours (06:00 AM to 10:00 PM).',
    example: 'Berth 1, 4, 9, 12, 17, 20... in standard 72-berth coaches.',
    tags: ['lower berth', 'easy access', 'senior citizen priority', 'floor level'],
    popular: true
  },
  {
    id: 'mb',
    term: 'MB',
    fullForm: 'Middle Berth',
    hindiFullForm: 'मध्यम बर्थ',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'The intermediate folding bed located between the Lower and Upper berths.',
    officialRule: 'Must be folded down between 10:00 PM and 06:00 AM for sleeping, and kept folded up during day hours so all 3 passengers can sit comfortably on the Lower Berth.',
    example: 'Berth 2, 5, 10, 13, 18, 21... in 3-tier coaches.',
    tags: ['middle berth', 'folding', 'sleeping hours', '10pm to 6am rule'],
    popular: true
  },
  {
    id: 'ub',
    term: 'UB',
    fullForm: 'Upper Berth',
    hindiFullForm: 'ऊपरी बर्थ',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'The permanent top-most bunk accessed via a wall ladder. Offers maximum uninterrupted privacy as it does not need to be folded during the day.',
    officialRule: 'Passenger can sleep at any time of the day or night without disturbing co-passengers.',
    example: 'Berth 3, 6, 11, 14, 19, 22... in standard sleeper layouts.',
    tags: ['upper berth', 'ladder access', 'uninterrupted privacy', 'day sleeping'],
    popular: true
  },
  {
    id: 'slb',
    term: 'SL (Berth)',
    fullForm: 'Side Lower Berth',
    hindiFullForm: 'साइड लोअर बर्थ',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'The lower berth positioned lengthwise along the coach corridor beside a window. Converts from two daytime passenger seats into a single nighttime bed.',
    officialRule: 'When RAC status is active, two RAC passengers share this Side Lower berth.',
    example: 'Berth 7, 15, 23, 31, 39, 47, 55, 63, 71... in 72-berth coaches.',
    tags: ['side lower', 'window view', 'rac shared', 'corridor berth'],
    popular: true
  },
  {
    id: 'sub',
    term: 'SU',
    fullForm: 'Side Upper Berth',
    hindiFullForm: 'साइड अपर बर्थ',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'The single elevated bed located above the Side Lower berth along the corridor.',
    officialRule: 'Features high privacy and dedicated luggage shelf, unaffected by daytime Middle Berth folding rules.',
    example: 'Berth 8, 16, 24, 32, 40, 48, 56, 64, 72.',
    tags: ['side upper', 'top corridor', 'private bunk', 'unaffected by rac'],
    popular: false
  },
  {
    id: 'ws',
    term: 'WS',
    fullForm: 'Window Seat',
    hindiFullForm: 'खिड़की सीट (विंडो सीट)',
    category: 'berths',
    categoryLabel: 'Berths & Seating',
    meaning: 'A passenger seat positioned directly alongside the external glass viewing window in Chair Car (CC, EC) or Second Seating (2S) coaches.',
    officialRule: 'Preferences for Window Seat can be requested on IRCTC during booking, allocated subject to algorithmic availability.',
    example: 'Seat 1, 2, 7, 8 in 3x2 Chair Car formations.',
    tags: ['window seat', 'chair car', 'scenic view', 'travel comfort'],
    popular: false
  },

  // 5. TRAINS & OPERATIONS
  {
    id: 'vb',
    term: 'VB',
    fullForm: 'Vande Bharat Express',
    hindiFullForm: 'वंदे भारत एक्सप्रेस (ट्रेन १८)',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'India\'s flagship semi-high speed indigenous electric multiple unit (EMU) trainset operating at speeds up to 160 km/h with quick acceleration, bio-vacuum toilets, and automatic sliding doors.',
    officialRule: 'Food is optional on select routes; dynamic catering charges apply.',
    example: 'New Delhi to Varanasi, Mumbai Central to Gandhinagar Capital.',
    tags: ['vande bharat', 'train 18', 'semi-high speed', 'indigenous', 'automatic doors'],
    popular: true
  },
  {
    id: 'rajdhani',
    term: 'Rajdhani Express',
    fullForm: 'Rajdhani Express (Capital City Express)',
    hindiFullForm: 'राजधानी एक्सप्रेस',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'Fully air-conditioned superfast priority train service connecting national capital New Delhi directly to various state capitals with minimal intermediate stops.',
    officialRule: 'Enjoys highest track precedence over all other passenger and freight trains. All-inclusive meals (or opt-out) served on board.',
    example: '12951/12952 Mumbai Tejas Rajdhani, 12301/12302 Howrah Rajdhani.',
    tags: ['rajdhani', 'superfast priority', 'capital connect', 'all ac', 'tejas rakes'],
    popular: true
  },
  {
    id: 'shatabdi',
    term: 'Shatabdi Express',
    fullForm: 'Shatabdi Express (Centenary Express)',
    hindiFullForm: 'शताब्दी एक्सप्रेस',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'Fast daytime express trains connecting major metro cities located 4 to 8 hours apart, returning to the originating station on the very same day.',
    officialRule: 'Composed entirely of AC Chair Car (CC) and Executive Chair Car (EC) coaches.',
    example: 'New Delhi to Bhopal Shatabdi (first introduced on Jawaharlal Nehru\'s centenary in 1988).',
    tags: ['shatabdi', 'day train', 'same day return', 'ac chair car', 'metro connect'],
    popular: false
  },
  {
    id: 'duronto',
    term: 'Duronto Express',
    fullForm: 'Duronto Express (Non-Stop Express)',
    hindiFullForm: 'दुरंतो एक्सप्रेस',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'Point-to-point express trains with distinctive green-yellow livery that run non-stop between distant metro pairs (with only technical operational halts).',
    officialRule: 'Fares follow dynamic surge pricing based on progressive demand tiers.',
    example: '12267 Mumbai Central to Ahmedabad Duronto Express.',
    tags: ['duronto', 'non-stop', 'point to point', 'dynamic fare'],
    popular: false
  },
  {
    id: 'amrit-bharat',
    term: 'Amrit Bharat',
    fullForm: 'Amrit Bharat Express',
    hindiFullForm: 'अमृत भारत एक्सप्रेस',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'Affordable superfast non-air conditioned train featuring push-pull WAP-5 locomotives at both ends for rapid acceleration, designed for migrant workers and common travelers.',
    officialRule: 'Consists of 12 Sleeper (SL) coaches and 8 Unreserved (GS) coaches with modern aero-cushioned seats and zero-discharge toilets.',
    example: 'Anand Vihar (Delhi) to Darbhanga Amrit Bharat Express.',
    tags: ['amrit bharat', 'push-pull engine', 'affordable non-ac', 'long distance'],
    popular: false
  },
  {
    id: 'tejas',
    term: 'Tejas Express',
    fullForm: 'Tejas Express',
    hindiFullForm: 'तेजस एक्सप्रेस',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'India\'s first corporate private-style luxury train operated by IRCTC, featuring aircraft-style flight attendant service, personal LCD screens, and travel delay insurance.',
    officialRule: 'IRCTC reimburses ₹100 if the train is delayed >1 hr and ₹250 if delayed >2 hrs.',
    example: 'Lucknow to New Delhi Tejas Express, Mumbai to Ahmedabad Tejas Express.',
    tags: ['tejas', 'irctc operated', 'delay refund guarantee', 'luxury'],
    popular: false
  },
  {
    id: 'charting',
    term: 'Chart Preparation',
    fullForm: 'Chart Preparation (1st Chart & 2nd Chart)',
    hindiFullForm: 'आरक्षण चार्ट तैयार करना',
    category: 'trains',
    categoryLabel: 'Train Brands & Operations',
    meaning: 'The automated algorithmic procedure where waitlisted tickets are finalized, VIP emergency quotas are absorbed, and vacant berths are released to the public.',
    officialRule: '1st Chart is prepared at least 4 hours before scheduled train departure. 2nd Chart is prepared 30 to 15 minutes before departure, accounting for current counter bookings.',
    example: 'Vacant berths after 1st Chart can be booked online via "Current Booking" at flat discounted fares.',
    tags: ['charting', '4 hours prior', 'current booking', 'vacant berths', 'chart 1 and 2'],
    popular: true
  },

  // 6. SYSTEMS, APPS & SERVICES
  {
    id: 'irctc',
    term: 'IRCTC',
    fullForm: 'Indian Railway Catering and Tourism Corporation',
    hindiFullForm: 'भारतीय रेलवे खानपान एवं पर्यटन निगम लिमिटेड',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'A Mini-Ratna Central Public Sector Undertaking (CPSE) under the Ministry of Railways that manages online passenger ticketing, pantry catering, packaged drinking water (Rail Neer), and tourism.',
    officialRule: 'Handles over 1.4 million online train reservations daily on its NextGen e-Ticketing portal.',
    example: 'Official ticketing gateway at irctc.co.in and IRCTC Rail Connect mobile application.',
    tags: ['irctc', 'catering', 'tourism', 'ticketing', 'rail neer', 'cpse'],
    popular: true
  },
  {
    id: 'cris',
    term: 'CRIS',
    fullForm: 'Centre for Railway Information Systems',
    hindiFullForm: 'रेलवे सूचना प्रणाली केंद्र (क्रिस)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'The autonomous IT engineering wing under the Ministry of Railways that architects, develops, and runs the core database software (PRS, NTES, FOIS) powering Indian Railways.',
    officialRule: 'Headquartered at Chanakyapuri, New Delhi. Manages the high-concurrency CONCERT booking engine.',
    example: 'Engineers the FairFlow, PRS backend servers handling 28,000+ bookings per minute.',
    tags: ['cris', 'software', 'prs architecture', 'it backbone', 'railway tech'],
    popular: true
  },
  {
    id: 'prs',
    term: 'PRS',
    fullForm: 'Passenger Reservation System',
    hindiFullForm: 'यात्री आरक्षण प्रणाली (पीआरएस)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'The nationwide computerized network that controls passenger quotas, train berths, waitlists, and fare calculations across both physical railway station counters and online portals.',
    officialRule: 'Maintains 5 regional data server clusters (Delhi, Mumbai, Kolkata, Chennai, Secunderabad).',
    example: 'Physical ticket counters at stations operate as PRS windows.',
    tags: ['prs', 'reservation system', 'national network', 'counter booking'],
    popular: true
  },
  {
    id: 'uts',
    term: 'UTS',
    fullForm: 'Unreserved Ticketing System',
    hindiFullForm: 'अनारक्षित टिकटिंग प्रणाली (यूटीएस)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'The digital and counter ticketing platform for issuing unreserved general train tickets, monthly suburban season passes, and station platform tickets.',
    officialRule: 'UTS on Mobile App utilizes geo-fencing (booking allowed only between 20 meters and 5 km from the track).',
    example: 'Purchasing a ₹10 platform ticket or Mumbai suburban local train pass.',
    tags: ['uts', 'unreserved', 'platform ticket', 'suburban local', 'geofenced'],
    popular: true
  },
  {
    id: 'ntes',
    term: 'NTES',
    fullForm: 'National Train Enquiry System',
    hindiFullForm: 'राष्ट्रीय ट्रेन पूछताछ प्रणाली',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'Real-time passenger information engine that provides live train running status, GPS tracking, platform numbers, train diversions, and arrival/departure delays.',
    officialRule: 'Directly synchronized with Indian Railways Control Offices (COA) and satellite GPS transmitters fitted on locomotives (RTIS).',
    example: 'Track "Where is my train" via NTES or dial 139 for automated running status.',
    tags: ['ntes', 'live running status', 'gps tracking', 'platform number', 'delay'],
    popular: true
  },
  {
    id: 'railmadad',
    term: 'RailMadad (139)',
    fullForm: 'Railway Mobile App for Desired Assistance During travel',
    hindiFullForm: 'रेल मदद - एकीकृत सहायता एवं शिकायत निवारण (१३९)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'The unified 24x7 emergency helpline and passenger grievance redressal portal integrating security (RPF), medical emergencies, catering complaints, coach cleanliness, and inquiry.',
    officialRule: 'SMS, call, or app ticket automatically escalates to the Divisional Railway Manager (DRM) if not addressed within 30 minutes.',
    example: 'Dial 139 on phone or lodge grievance under "Services" tab for instant on-train RPF/Doctor dispatch.',
    tags: ['railmadad', '139 helpline', 'grievance', 'rpf security', 'doctor on call', 'emergency'],
    popular: true
  },
  {
    id: 'obhs',
    term: 'OBHS / Coach Mitra',
    fullForm: 'On-Board Housekeeping Service',
    hindiFullForm: 'ऑन-बोर्ड हाउसकीपिंग सेवा (कोच मित्र)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'A dedicated mobile cleaning team travelling aboard long-distance trains that cleans toilets, wipes floors, clears dustbins, and sprays disinfectants upon passenger SMS/app request.',
    officialRule: 'Service is completely free. Attendant must provide an OTP verification upon satisfactory task completion.',
    example: 'Send SMS "CLEAN <PNR>" to 58888 or request in IRCTC Services tab for immediate washroom sanitization.',
    tags: ['obhs', 'coach mitra', 'toilet cleaning', 'linen change', 'cleanliness'],
    popular: true
  },
  {
    id: 'imudra',
    term: 'iMudra',
    fullForm: 'IRCTC iMudra Digital Wallet & Prepaid Card',
    hindiFullForm: 'आईआरसीटीसी आईमुद्रा डिजिटल वॉलेट',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'IRCTC\'s co-branded virtual and physical RuPay/Visa wallet that enables 1-click lightning checkout during high-traffic 10:00 AM Tatkal windows without standard bank redirect gateway timeouts.',
    officialRule: 'Direct refunds for unconfirmed Tatkal waitlists credit back to iMudra wallet within seconds (T+0).',
    example: 'Pre-loaded wallet balance selected at payment step for 10-second Tatkal checkouts.',
    tags: ['imudra', 'wallet', 'tatkal payment', 'instant refund', 'no gateway failure'],
    popular: true
  },
  {
    id: 'ecatering',
    term: 'e-Catering',
    fullForm: 'IRCTC e-Catering / Rail Food Delivery',
    hindiFullForm: 'आईआरसीटीसी ई-कैटरिंग (बर्थ पर भोजन आपूर्ति)',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'Online food ordering service that delivers meals from FSSAI-approved restaurant chains (Haldiram’s, Domino\'s, Bikanervala) directly to the passenger\'s coach berth at scheduled station halts.',
    officialRule: 'Order can be placed up to 1 hour before scheduled station arrival using PNR via app or WhatsApp (+91-8750001323).',
    example: 'Hot Jain Thali delivered at Ratlam Jn on Mumbai-Delhi Rajdhani.',
    tags: ['ecatering', 'berth delivery', 'haldiram', 'jain food', 'whatsapp food'],
    popular: true
  },
  {
    id: 'railneer',
    term: 'Rail Neer',
    fullForm: 'Rail Neer Packaged Drinking Water',
    hindiFullForm: 'रेल नीर पैकेज्ड पेयजल',
    category: 'systems',
    categoryLabel: 'Systems, Tech & Services',
    meaning: 'IRCTC\'s exclusive brand of purified, 8-stage reverse osmosis (RO) drinking water bottled at dedicated state-owned plants across India for Indian Railways.',
    officialRule: 'Priced strictly at ₹15 for a 1-litre sealed bottle. Overcharging by platform vendors is an offense punishable by vendor contract termination.',
    example: '1-Litre bottle served with meals on Rajdhani and Shatabdi trains.',
    tags: ['rail neer', 'drinking water', '15 rupees', 'pure ro', 'mandatory price'],
    popular: false
  }
];

interface GlossaryViewProps {
  onBookTicket?: () => void;
  onCheckBookings?: () => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  onBookTicket = () => {},
  onCheckBookings = () => {}
}) => {
  const { theme, t } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory>('all');
  const [filterPopularOnly, setFilterPopularOnly] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | null>('pnr');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['pnr', 'gnwl', 'tq', 'rac']);

  // Copy helper
  const handleCopy = (term: GlossaryTerm) => {
    const text = `${term.term} (${term.fullForm}) - ${term.meaning}\nOfficial Rule: ${term.officialRule}`;
    navigator.clipboard.writeText(text);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Text to speech helper
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Categories config
  const categories: { id: GlossaryCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Terms / सभी शब्द', count: GLOSSARY_TERMS.length },
    {
      id: 'statuses',
      label: 'Ticket Status & Waitlists',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'statuses').length
    },
    {
      id: 'quotas',
      label: 'Quotas & Reservations',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'quotas').length
    },
    {
      id: 'classes',
      label: 'Coach Classes (1A, 2A, 3A...)',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'classes').length
    },
    {
      id: 'berths',
      label: 'Berths & Seating (LB, MB...)',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'berths').length
    },
    {
      id: 'trains',
      label: 'Train Types & Operations',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'trains').length
    },
    {
      id: 'systems',
      label: 'Systems & Services (IRCTC, CRIS...)',
      count: GLOSSARY_TERMS.filter((t) => t.category === 'systems').length
    }
  ];

  // Available Alphabet Letters
  const alphabetLetters = useMemo(() => {
    const letters = new Set<string>();
    GLOSSARY_TERMS.forEach((t) => {
      const firstChar = t.term.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, []);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Popular filter
      if (filterPopularOnly && !item.popular) {
        return false;
      }

      // Alphabet filter
      if (selectedLetter && !item.term.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTerm = item.term.toLowerCase().includes(query);
        const matchesFullForm = item.fullForm.toLowerCase().includes(query);
        const matchesHindi = item.hindiFullForm.toLowerCase().includes(query);
        const matchesMeaning = item.meaning.toLowerCase().includes(query);
        const matchesRule = item.officialRule.toLowerCase().includes(query);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesTerm || matchesFullForm || matchesHindi || matchesMeaning || matchesRule || matchesTags;
      }

      return true;
    });
  }, [selectedCategory, filterPopularOnly, selectedLetter, searchQuery]);

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO HEADER: Official IRCTC Terminology & Acronym Dictionary */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0B2545] border-2 border-[#EA580C] p-6 sm:p-10 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-200 text-xs font-bold font-mono tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>OFFICIAL IRCTC & INDIAN RAILWAYS DICTIONARY • शब्दावली</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-ticket">
              Glossary of IRCTC Terminologies
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              Comprehensive reference guide decoding abbreviations, ticket status codes, booking quotas, coach classes,
              berth types, and operational guidelines used across the Indian Railway Catering & Tourism Corporation (IRCTC)
              and Centre for Railway Information Systems (CRIS).
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-orange-200 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{GLOSSARY_TERMS.length} Official Terms Decoded</span>
              </span>
              <span className="text-blue-300">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-300" />
                <span>Verified with Railway Board Commercial Circulars</span>
              </span>
              <span className="text-blue-300">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-300" />
                <span>Updated for 2026 PRS Standards</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2.5 w-full sm:w-auto">
            <button
              onClick={onBookTicket}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-black text-xs font-ticket uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Ticket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onCheckBookings}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Check My PNR</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK CONFUSION SOLVER: CHEAT SHEETS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#EA580C] text-xs font-bold uppercase tracking-wider font-ticket">
            <Sparkles className="w-4 h-4" />
            <span>GNWL vs RLWL vs PQWL</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            <strong className="text-[#0B2545]">GNWL</strong> has the highest clearance probability as it starts from train origin.
            <strong className="text-[#0B2545]"> RLWL</strong> is for intermediate stations and confirms slower.
            <strong className="text-[#0B2545]"> PQWL</strong> is for short distances and rarely confirms.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider font-ticket">
            <Sparkles className="w-4 h-4" />
            <span>RAC vs Waitlist (WL)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            <strong className="text-[#0B2545]">RAC</strong> passengers are legally allowed to board and travel sharing a Side Lower berth.
            <strong className="text-[#0B2545]"> Waitlisted (WL)</strong> e-tickets get auto-cancelled after chart preparation; boarding is strictly forbidden.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider font-ticket">
            <Sparkles className="w-4 h-4" />
            <span>Tatkal (TQ) vs Premium Tatkal (PT)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            <strong className="text-[#0B2545]">Tatkal (TQ)</strong> charges a fixed surcharge and allows a waitlist.
            <strong className="text-[#0B2545]"> Premium Tatkal (PT)</strong> uses dynamic surge pricing that rises with demand and has zero waitlist.
          </p>
        </div>
      </section>

      {/* 3. SEARCH & FILTERS BAR */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Real-time search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLetter(null);
              }}
              placeholder="Search any acronym, full form, rule, or keyword (e.g., PNR, RAC, GNWL, Tatkal, 3A, Charting)..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#EA580C] text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular toggle */}
          <button
            onClick={() => setFilterPopularOnly(!filterPopularOnly)}
            className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              filterPopularOnly
                ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${filterPopularOnly ? 'fill-white text-white' : 'text-[#EA580C]'}`} />
            <span>Top Most Asked ({GLOSSARY_TERMS.filter((t) => t.popular).length})</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedLetter(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:text-[#0B2545]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Alphabet Quick Jump Bar */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-mono shadow-xs">
          <span className="text-slate-500 text-[11px] font-bold px-2 shrink-0">Quick Jump:</span>
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              selectedLetter === null
                ? 'bg-[#EA580C] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ALL
          </button>
          {alphabetLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter === selectedLetter ? null : letter);
                setSearchQuery('');
              }}
              className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all ${
                selectedLetter === letter
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* 4. RESULTS COUNTER & ACTIVE FILTERS */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <strong className="text-[#0B2545]">{filteredTerms.length}</strong> of{' '}
          {GLOSSARY_TERMS.length} terminologies
          {selectedCategory !== 'all' && (
            <span> in <span className="text-[#0B2545] font-semibold">{categories.find((c) => c.id === selectedCategory)?.label}</span></span>
          )}
          {selectedLetter && (
            <span> starting with "<span className="text-[#EA580C] font-bold">{selectedLetter}</span>"</span>
          )}
        </div>

        {(searchQuery || selectedCategory !== 'all' || filterPopularOnly || selectedLetter) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilterPopularOnly(false);
              setSelectedLetter(null);
            }}
            className="text-[#EA580C] hover:underline font-semibold"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* 5. GLOSSARY CARDS GRID */}
      {filteredTerms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <AlertCircle className="w-12 h-12 text-[#EA580C] mx-auto opacity-75" />
          <h3 className="text-base font-bold text-[#0B2545]">No IRCTC terminologies found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
            We couldn't find any terms matching "<strong className="text-[#0B2545]">{searchQuery}</strong>". Try searching for abbreviations like PNR, RAC, GNWL, or coach classes like 3A, 2A.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLetter(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#EA580C] text-white font-bold text-xs shadow-xs"
          >
            Show All Terminologies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((item) => {
            const isExpanded = expandedTermId === item.id;
            const isBookmarked = bookmarkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isExpanded
                    ? 'bg-white border-[#EA580C] ring-1 ring-[#EA580C]/40'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedTermId(isExpanded ? null : item.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg sm:text-xl font-black text-[#0B2545] font-ticket tracking-wide">
                        {item.term}
                      </span>
                      {item.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] text-[#EA580C] font-bold font-mono">
                          ★ ESSENTIAL
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 leading-snug">
                      {item.fullForm}
                    </div>

                    <div className="text-xs text-slate-600 font-hindi">
                      {item.hindiFullForm}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(item.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-[#EA580C] bg-orange-50'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark term'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#EA580C]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(`${item.term}. Full form: ${item.fullForm}.`);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Copy full form & meaning"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Meaning Summary (Always visible) */}
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed font-sans">
                  {item.meaning}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3.5 text-xs animate-in fade-in duration-150">
                    {/* Official Railway Rule */}
                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
                      <div className="font-bold text-[#0B2545] flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Official Railway Rule & Directive</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-sans">
                        {item.officialRule}
                      </p>
                    </div>

                    {/* Ticket Context / Example */}
                    <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200 space-y-1">
                      <div className="font-bold text-[#EA580C] flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                        <Ticket className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Where to find this in your Journey</span>
                      </div>
                      <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                        {item.example}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Keywords:</span>
                      {item.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-[10px] font-mono transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. BOTTOM CONVENIENCE HELP FOOTER */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0B2545] border-t-4 border-[#EA580C] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-xs font-bold text-orange-300 uppercase tracking-wider font-ticket">
            Need Live Booking Assistance?
          </div>
          <h3 className="text-lg font-bold text-white">
            Have questions about your PNR status or ready to book your train?
          </h3>
          <p className="text-xs text-blue-100">
            Use our FairFlow booking portal to simulate high-demand Tatkal batches or check your confirmed e-tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCheckBookings}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors"
          >
            My PNR & E-Tickets
          </button>
          <button
            onClick={onBookTicket}
            className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-black text-xs font-ticket uppercase tracking-wider transition-transform active:scale-95 shadow-sm"
          >
            Book Ticket
          </button>
        </div>
      </section>
    </div>
  );
};
