export interface StationHalt {
  stopNo: number;
  stationCode: string;
  stationName: string;
  arrival: string;
  departure: string;
  haltMins: number;
  distanceKm: number;
  day: number;
  platform: string;
}

export interface TrainClassInfo {
  code: string;
  name: string;
  baseFare: number;
  available: boolean;
  seatType: string;
  quotaStatus: string;
}

export interface TrainDetail {
  number: string;
  returnNumber: string;
  name: string;
  hindiName: string;
  type: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Tejas' | 'Duronto' | 'Gatimaan' | 'Superfast Mail' | 'Double Decker';
  zone: string; // e.g., 'NR', 'WR', 'ER', 'SR', 'NCR'
  fromStation: {
    code: string;
    name: string;
    city: string;
    state: string;
    depTime: string;
    platform: string;
  };
  toStation: {
    code: string;
    name: string;
    city: string;
    state: string;
    arrTime: string;
    platform: string;
  };
  duration: string;
  distanceKm: number;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
  runningDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  classes: TrainClassInfo[];
  catering: string;
  wifi: boolean;
  bioToilet: boolean;
  punctualityScore: number; // percentage
  cleanlinessRating: number; // out of 5
  rakeType: string; // e.g. 'Train18 Self-Propelled', 'LHB Stainless Steel', 'Tejas Smart Rake'
  coachesCount: number;
  isPopular: boolean;
  highlightTag?: string;
  halts: StationHalt[];
  liveStatusSimulation: {
    currentLocation: string;
    nextStation: string;
    status: 'On Time' | 'Delayed' | 'Departed Early';
    delayMinutes: number;
    currentSpeedKmH: number;
    completedDistanceKm: number;
  };
}

export interface RailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
}

export const MAJOR_STATIONS: RailwayStation[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati (Bhopal)', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'GNC', name: 'Gandhinagar Capital', city: 'Gandhinagar', state: 'Gujarat' },
  { code: 'BKN', name: 'Bikaner Junction', city: 'Bikaner', state: 'Rajasthan' },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', city: 'Jhansi', state: 'Uttar Pradesh' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
  { code: 'NJP', name: 'New Jalpaiguri', city: 'Siliguri', state: 'West Bengal' },
  { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka' }
];

export const INDIAN_RAILWAYS_TRAINS: TrainDetail[] = [
  {
    number: '22436',
    returnNumber: '22435',
    name: 'New Delhi - Varanasi Vande Bharat Express',
    hindiName: 'नई दिल्ली - वाराणसी वंदे भारत एक्सप्रेस',
    type: 'Vande Bharat',
    zone: 'NR (Northern Railway)',
    fromStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      depTime: '06:00',
      platform: '16'
    },
    toStation: {
      code: 'BSB',
      name: 'Varanasi Junction',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      arrTime: '14:00',
      platform: '1'
    },
    duration: '8h 00m',
    distanceKm: 759,
    avgSpeedKmH: 95,
    maxSpeedKmH: 160,
    runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    catering: 'Gourmet Indian Onboard Meals & High Tea Included',
    wifi: true,
    bioToilet: true,
    punctualityScore: 97,
    cleanlinessRating: 4.9,
    rakeType: 'Train 18 Aerodynamic Self-Propelled EMU',
    coachesCount: 16,
    isPopular: true,
    highlightTag: 'India’s 1st Semi-High Speed Train',
    classes: [
      { code: 'EC', name: 'Executive Chair Car', baseFare: 3350, available: true, seatType: '180° Rotating Seats', quotaStatus: 'AVAILABLE 18' },
      { code: 'CC', name: 'AC Chair Car', baseFare: 1750, available: true, seatType: 'Ergonomic Recliner', quotaStatus: 'AVAILABLE 84' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'NDLS', stationName: 'New Delhi', arrival: 'Source', departure: '06:00', haltMins: 0, distanceKm: 0, day: 1, platform: '16' },
      { stopNo: 2, stationCode: 'CNB', stationName: 'Kanpur Central', arrival: '10:08', departure: '10:10', haltMins: 2, distanceKm: 440, day: 1, platform: '5' },
      { stopNo: 3, stationCode: 'PRYJ', stationName: 'Prayagraj Junction', arrival: '12:08', departure: '12:10', haltMins: 2, distanceKm: 635, day: 1, platform: '6' },
      { stopNo: 4, stationCode: 'BSB', stationName: 'Varanasi Junction', arrival: '14:00', departure: 'Destination', haltMins: 0, distanceKm: 759, day: 1, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Between Kanpur Central & Prayagraj Jn (Passing Fatehpur)',
      nextStation: 'Prayagraj Jn (PRYJ)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 130,
      completedDistanceKm: 520
    }
  },
  {
    number: '12951',
    returnNumber: '12952',
    name: 'Mumbai Central - New Delhi Tejas Rajdhani Express',
    hindiName: 'मुंबई सेंट्रल - नई दिल्ली तेजस राजधानी एक्सप्रेस',
    type: 'Rajdhani',
    zone: 'WR (Western Railway)',
    fromStation: {
      code: 'MMCT',
      name: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      depTime: '17:00',
      platform: '1'
    },
    toStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      arrTime: '08:32',
      platform: '2'
    },
    duration: '15h 32m',
    distanceKm: 1386,
    avgSpeedKmH: 89,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    catering: 'Signature Multi-Course Railway Dining & Bedrolls',
    wifi: true,
    bioToilet: true,
    punctualityScore: 98,
    cleanlinessRating: 4.8,
    rakeType: 'Smart Tejas LHB Sleeper Rake with Automatic Plug Doors',
    coachesCount: 20,
    isPopular: true,
    highlightTag: 'Premier King of Western Railway',
    classes: [
      { code: '1A', name: 'AC First Class', baseFare: 4890, available: true, seatType: 'Lockable Coupe / Cabin', quotaStatus: 'AVAILABLE 6' },
      { code: '2A', name: 'AC 2-Tier', baseFare: 3040, available: true, seatType: 'Curtained 4-Berth Bay', quotaStatus: 'AVAILABLE 24' },
      { code: '3A', name: 'AC 3-Tier', baseFare: 2190, available: true, seatType: '6-Berth Bay + 2 Side', quotaStatus: 'AVAILABLE 112' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'MMCT', stationName: 'Mumbai Central', arrival: 'Source', departure: '17:00', haltMins: 0, distanceKm: 0, day: 1, platform: '1' },
      { stopNo: 2, stationCode: 'BVI', stationName: 'Borivali', arrival: '17:22', departure: '17:24', haltMins: 2, distanceKm: 30, day: 1, platform: '6' },
      { stopNo: 3, stationCode: 'ST', stationName: 'Surat', arrival: '19:43', departure: '19:48', haltMins: 5, distanceKm: 263, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'BRC', stationName: 'Vadodara Junction', arrival: '21:06', departure: '21:16', haltMins: 10, distanceKm: 393, day: 1, platform: '2' },
      { stopNo: 5, stationCode: 'RTM', stationName: 'Ratlam Junction', arrival: '00:25', departure: '00:28', haltMins: 3, distanceKm: 653, day: 2, platform: '5' },
      { stopNo: 6, stationCode: 'KOTA', stationName: 'Kota Junction', arrival: '03:15', departure: '03:20', haltMins: 5, distanceKm: 920, day: 2, platform: '1' },
      { stopNo: 7, stationCode: 'NDLS', stationName: 'New Delhi', arrival: '08:32', departure: 'Destination', haltMins: 0, distanceKm: 1386, day: 2, platform: '2' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Passing Gangapur City',
      nextStation: 'Mathura Junction',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 128,
      completedDistanceKm: 1190
    }
  },
  {
    number: '12002',
    returnNumber: '12001',
    name: 'New Delhi - Rani Kamlapati (Bhopal) Shatabdi Express',
    hindiName: 'नई दिल्ली - रानी कमलापति (भोपाल) शताब्दी एक्सप्रेस',
    type: 'Shatabdi',
    zone: 'NR (Northern Railway)',
    fromStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      depTime: '06:00',
      platform: '1'
    },
    toStation: {
      code: 'RKMP',
      name: 'Rani Kamlapati (Bhopal)',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      arrTime: '14:40',
      platform: '1'
    },
    duration: '8h 40m',
    distanceKm: 708,
    avgSpeedKmH: 82,
    maxSpeedKmH: 150,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    catering: 'Breakfast, Juice, Tea & Full Lunch Served At Seat',
    wifi: false,
    bioToilet: true,
    punctualityScore: 96,
    cleanlinessRating: 4.7,
    rakeType: 'LHB German Linke Hofmann Busch Coach Rake',
    coachesCount: 18,
    isPopular: true,
    highlightTag: 'India’s Fastest Shatabdi on Agra Trunk',
    classes: [
      { code: 'EC', name: 'Executive Chair Car', baseFare: 2620, available: true, seatType: 'Spacious 2x2 Seating', quotaStatus: 'AVAILABLE 12' },
      { code: 'CC', name: 'AC Chair Car', baseFare: 1495, available: true, seatType: 'Comfortable 3x2 Recliner', quotaStatus: 'AVAILABLE 140' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'NDLS', stationName: 'New Delhi', arrival: 'Source', departure: '06:00', haltMins: 0, distanceKm: 0, day: 1, platform: '1' },
      { stopNo: 2, stationCode: 'MTJ', stationName: 'Mathura Junction', arrival: '07:19', departure: '07:20', haltMins: 1, distanceKm: 141, day: 1, platform: '1' },
      { stopNo: 3, stationCode: 'AGC', stationName: 'Agra Cantt', arrival: '07:50', departure: '07:55', haltMins: 5, distanceKm: 195, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'GWL', stationName: 'Gwalior Junction', arrival: '09:23', departure: '09:28', haltMins: 5, distanceKm: 313, day: 1, platform: '1' },
      { stopNo: 5, stationCode: 'VGLJ', stationName: 'Virangana Lakshmibai Jhansi', arrival: '10:45', departure: '10:50', haltMins: 5, distanceKm: 410, day: 1, platform: '1' },
      { stopNo: 6, stationCode: 'BPL', stationName: 'Bhopal Junction', arrival: '14:12', departure: '14:15', haltMins: 3, distanceKm: 702, day: 1, platform: '1' },
      { stopNo: 7, stationCode: 'RKMP', stationName: 'Rani Kamlapati', arrival: '14:40', departure: 'Destination', haltMins: 0, distanceKm: 708, day: 1, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Approaching Gwalior Cantt',
      nextStation: 'Gwalior Junction (GWL)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 135,
      completedDistanceKm: 295
    }
  },
  {
    number: '12301',
    returnNumber: '12302',
    name: 'Howrah - New Delhi Rajdhani Express (Via Gaya)',
    hindiName: 'हावड़ा - नई दिल्ली राजधानी एक्सप्रेस (गया होकर)',
    type: 'Rajdhani',
    zone: 'ER (Eastern Railway)',
    fromStation: {
      code: 'HWH',
      name: 'Howrah Junction',
      city: 'Kolkata',
      state: 'West Bengal',
      depTime: '16:50',
      platform: '9'
    },
    toStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      arrTime: '10:05',
      platform: '1'
    },
    duration: '17h 15m',
    distanceKm: 1451,
    avgSpeedKmH: 84,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    catering: 'All Meals, Soup, Evening Snacks & Fresh Bedding Included',
    wifi: true,
    bioToilet: true,
    punctualityScore: 95,
    cleanlinessRating: 4.8,
    rakeType: 'LHB Stainless Steel Rajdhani Rake',
    coachesCount: 21,
    isPopular: true,
    highlightTag: 'India’s Very First Rajdhani Express (1969)',
    classes: [
      { code: '1A', name: 'AC First Class', baseFare: 5040, available: true, seatType: 'Private Cabin / Coupe', quotaStatus: 'AVAILABLE 4' },
      { code: '2A', name: 'AC 2-Tier', baseFare: 3120, available: true, seatType: 'Comfortable Two Tier', quotaStatus: 'AVAILABLE 18' },
      { code: '3A', name: 'AC 3-Tier', baseFare: 2260, available: true, seatType: 'Three Tier Berths', quotaStatus: 'AVAILABLE 65' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'HWH', stationName: 'Howrah Junction', arrival: 'Source', departure: '16:50', haltMins: 0, distanceKm: 0, day: 1, platform: '9' },
      { stopNo: 2, stationCode: 'ASN', stationName: 'Asansol Junction', arrival: '18:57', departure: '19:00', haltMins: 3, distanceKm: 200, day: 1, platform: '4' },
      { stopNo: 3, stationCode: 'DHN', stationName: 'Dhanbad Junction', arrival: '19:55', departure: '20:00', haltMins: 5, distanceKm: 259, day: 1, platform: '3' },
      { stopNo: 4, stationCode: 'GAYA', stationName: 'Gaya Junction', arrival: '22:31', departure: '22:34', haltMins: 3, distanceKm: 458, day: 1, platform: '1' },
      { stopNo: 5, stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya Jn', arrival: '00:45', departure: '00:55', haltMins: 10, distanceKm: 663, day: 2, platform: '4' },
      { stopNo: 6, stationCode: 'PRYJ', stationName: 'Prayagraj Junction', arrival: '02:43', departure: '02:45', haltMins: 2, distanceKm: 816, day: 2, platform: '1' },
      { stopNo: 7, stationCode: 'CNB', stationName: 'Kanpur Central', arrival: '04:40', departure: '04:45', haltMins: 5, distanceKm: 1010, day: 2, platform: '1' },
      { stopNo: 8, stationCode: 'NDLS', stationName: 'New Delhi', arrival: '10:05', departure: 'Destination', haltMins: 0, distanceKm: 1451, day: 2, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Past Pt. Deen Dayal Upadhyaya Jn (Mughalsarai)',
      nextStation: 'Prayagraj Junction (PRYJ)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 120,
      completedDistanceKm: 740
    }
  },
  {
    number: '20901',
    returnNumber: '20902',
    name: 'Mumbai Central - Gandhinagar Capital Vande Bharat Express',
    hindiName: 'मुंबई सेंट्रल - गांधीनगर कैपिटल वंदे भारत एक्सप्रेस',
    type: 'Vande Bharat',
    zone: 'WR (Western Railway)',
    fromStation: {
      code: 'MMCT',
      name: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      depTime: '06:10',
      platform: '5'
    },
    toStation: {
      code: 'GNC',
      name: 'Gandhinagar Capital',
      city: 'Gandhinagar',
      state: 'Gujarat',
      arrTime: '12:25',
      platform: '1'
    },
    duration: '6h 15m',
    distanceKm: 522,
    avgSpeedKmH: 84,
    maxSpeedKmH: 160,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    catering: 'Gujarati & Continental Breakfast + Fresh Filter Coffee',
    wifi: true,
    bioToilet: true,
    punctualityScore: 99,
    cleanlinessRating: 4.9,
    rakeType: 'Vande Bharat 2.0 with Kavach Anti-Collision & KAVACH Shield',
    coachesCount: 16,
    isPopular: true,
    highlightTag: 'Fastest Link Between Financial Capital & Gujarat',
    classes: [
      { code: 'EC', name: 'Executive Chair Car', baseFare: 2505, available: true, seatType: '180° Swivel Luxury Recliner', quotaStatus: 'AVAILABLE 14' },
      { code: 'CC', name: 'AC Chair Car', baseFare: 1385, available: true, seatType: '2x3 Ergonomic Seating', quotaStatus: 'AVAILABLE 92' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'MMCT', stationName: 'Mumbai Central', arrival: 'Source', departure: '06:10', haltMins: 0, distanceKm: 0, day: 1, platform: '5' },
      { stopNo: 2, stationCode: 'BVI', stationName: 'Borivali', arrival: '06:32', departure: '06:35', haltMins: 3, distanceKm: 30, day: 1, platform: '6' },
      { stopNo: 3, stationCode: 'VAPI', stationName: 'Vapi', arrival: '08:00', departure: '08:02', haltMins: 2, distanceKm: 170, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'ST', stationName: 'Surat', arrival: '08:53', departure: '08:58', haltMins: 5, distanceKm: 263, day: 1, platform: '1' },
      { stopNo: 5, stationCode: 'BRC', stationName: 'Vadodara Junction', arrival: '10:13', departure: '10:18', haltMins: 5, distanceKm: 393, day: 1, platform: '2' },
      { stopNo: 6, stationCode: 'ADI', stationName: 'Ahmedabad Junction', arrival: '11:25', departure: '11:30', haltMins: 5, distanceKm: 493, day: 1, platform: '1' },
      { stopNo: 7, stationCode: 'GNC', stationName: 'Gandhinagar Capital', arrival: '12:25', departure: 'Destination', haltMins: 0, distanceKm: 522, day: 1, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Approaching Vadodara Junction',
      nextStation: 'Vadodara Junction (BRC)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 130,
      completedDistanceKm: 360
    }
  },
  {
    number: '12049',
    returnNumber: '12050',
    name: 'Gatimaan Express (Hazrat Nizamuddin - Jhansi)',
    hindiName: 'गतिमान एक्सप्रेस (हज़रत निज़ामुद्दीन - वीरांगना लक्ष्मीबाई झाँसी)',
    type: 'Gatimaan',
    zone: 'NCR (North Central Railway)',
    fromStation: {
      code: 'NZM',
      name: 'Hazrat Nizamuddin',
      city: 'Delhi',
      state: 'Delhi',
      depTime: '08:10',
      platform: '5'
    },
    toStation: {
      code: 'VGLJ',
      name: 'Virangana Lakshmibai Jhansi',
      city: 'Jhansi',
      state: 'Uttar Pradesh',
      arrTime: '12:35',
      platform: '1'
    },
    duration: '4h 25m',
    distanceKm: 403,
    avgSpeedKmH: 91,
    maxSpeedKmH: 160,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
    catering: 'Hostess Service, Gourmet Breakfast & Welcome Drink',
    wifi: true,
    bioToilet: true,
    punctualityScore: 98,
    cleanlinessRating: 4.8,
    rakeType: 'Special LHB High-Speed Coaches with Automatic Slide Doors',
    coachesCount: 12,
    isPopular: true,
    highlightTag: '160 km/h WAP-5 High Speed Legend',
    classes: [
      { code: 'EC', name: 'Executive Chair Car', baseFare: 1980, available: true, seatType: 'Executive 2x2 Recliner', quotaStatus: 'AVAILABLE 8' },
      { code: 'CC', name: 'AC Chair Car', baseFare: 995, available: true, seatType: 'AC 3x2 Chair', quotaStatus: 'AVAILABLE 48' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'NZM', stationName: 'Hazrat Nizamuddin', arrival: 'Source', departure: '08:10', haltMins: 0, distanceKm: 0, day: 1, platform: '5' },
      { stopNo: 2, stationCode: 'AGC', stationName: 'Agra Cantt', arrival: '09:50', departure: '09:55', haltMins: 5, distanceKm: 188, day: 1, platform: '1' },
      { stopNo: 3, stationCode: 'GWL', stationName: 'Gwalior Junction', arrival: '11:13', departure: '11:15', haltMins: 2, distanceKm: 306, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'VGLJ', stationName: 'Virangana Lakshmibai Jhansi', arrival: '12:35', departure: 'Destination', haltMins: 0, distanceKm: 403, day: 1, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Cruising at Agra-Jhansi High Speed Section',
      nextStation: 'Virangana Lakshmibai Jhansi (VGLJ)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 155,
      completedDistanceKm: 340
    }
  },
  {
    number: '12259',
    returnNumber: '12260',
    name: 'Sealdah - Bikaner AC Duronto Express',
    hindiName: 'सियालदह - बीकानेर एसी दुरंतो एक्सप्रेस',
    type: 'Duronto',
    zone: 'ER (Eastern Railway)',
    fromStation: {
      code: 'SDAH',
      name: 'Sealdah',
      city: 'Kolkata',
      state: 'West Bengal',
      depTime: '17:00',
      platform: '12'
    },
    toStation: {
      code: 'BKN',
      name: 'Bikaner Junction',
      city: 'Bikaner',
      state: 'Rajasthan',
      arrTime: '18:20',
      platform: '1'
    },
    duration: '25h 20m',
    distanceKm: 1916,
    avgSpeedKmH: 76,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Wed', 'Thu', 'Sun'],
    catering: 'All-inclusive Non-Stop Point-to-Point Dining',
    wifi: false,
    bioToilet: true,
    punctualityScore: 92,
    cleanlinessRating: 4.6,
    rakeType: 'Colorful LHB Duronto Livery Rake',
    coachesCount: 18,
    isPopular: true,
    highlightTag: 'Fastest Non-Stop Trans-India AC Corridor',
    classes: [
      { code: '1A', name: 'AC First Class', baseFare: 5410, available: true, seatType: '1st AC Coupe', quotaStatus: 'AVAILABLE 2' },
      { code: '2A', name: 'AC 2-Tier', baseFare: 3340, available: true, seatType: 'AC 2 Tier', quotaStatus: 'AVAILABLE 22' },
      { code: '3A', name: 'AC 3-Tier', baseFare: 2420, available: true, seatType: 'AC 3 Tier', quotaStatus: 'AVAILABLE 76' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'SDAH', stationName: 'Sealdah', arrival: 'Source', departure: '17:00', haltMins: 0, distanceKm: 0, day: 1, platform: '12' },
      { stopNo: 2, stationCode: 'DHN', stationName: 'Dhanbad Junction', arrival: '20:30', departure: '20:35', haltMins: 5, distanceKm: 266, day: 1, platform: '2' },
      { stopNo: 3, stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya Jn', arrival: '01:25', departure: '01:35', haltMins: 10, distanceKm: 671, day: 2, platform: '6' },
      { stopNo: 4, stationCode: 'CNB', stationName: 'Kanpur Central', arrival: '05:30', departure: '05:35', haltMins: 5, distanceKm: 1018, day: 2, platform: '1' },
      { stopNo: 5, stationCode: 'NDLS', stationName: 'New Delhi', arrival: '11:00', departure: '11:15', haltMins: 15, distanceKm: 1459, day: 2, platform: '11' },
      { stopNo: 6, stationCode: 'BKN', stationName: 'Bikaner Junction', arrival: '18:20', departure: 'Destination', haltMins: 0, distanceKm: 1916, day: 2, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Between Kanpur Central and New Delhi',
      nextStation: 'New Delhi (NDLS)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 110,
      completedDistanceKm: 1280
    }
  },
  {
    number: '12137',
    returnNumber: '12138',
    name: 'Punjab Mail (CSMT Mumbai - Firozpur Cantt)',
    hindiName: 'पंजाब मेल (सीएसएमटी मुंबई - फिरोजपुर कैंट)',
    type: 'Superfast Mail',
    zone: 'CR (Central Railway)',
    fromStation: {
      code: 'CSMT',
      name: 'Chhatrapati Shivaji Maharaj Terminus',
      city: 'Mumbai',
      state: 'Maharashtra',
      depTime: '19:35',
      platform: '18'
    },
    toStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      arrTime: '21:30',
      platform: '3'
    },
    duration: '25h 55m',
    distanceKm: 1543,
    avgSpeedKmH: 60,
    maxSpeedKmH: 120,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    catering: 'Pantry Car Attached • E-Catering & Tea/Snacks Available',
    wifi: false,
    bioToilet: true,
    punctualityScore: 91,
    cleanlinessRating: 4.4,
    rakeType: '24-Coach Broad Gauge LHB Train',
    coachesCount: 24,
    isPopular: true,
    highlightTag: 'Historic 112-Year-Old Pioneer of Indian Railways',
    classes: [
      { code: '1A', name: 'AC First Class', baseFare: 4210, available: true, seatType: '1st AC Coupe', quotaStatus: 'AVAILABLE 2' },
      { code: '2A', name: 'AC 2-Tier', baseFare: 2490, available: true, seatType: '2 Tier Berths', quotaStatus: 'AVAILABLE 15' },
      { code: '3A', name: 'AC 3-Tier', baseFare: 1720, available: true, seatType: '3 Tier Berths', quotaStatus: 'AVAILABLE 54' },
      { code: 'SL', name: 'Sleeper Class', baseFare: 645, available: true, seatType: 'Standard Sleeper', quotaStatus: 'AVAILABLE 120' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'CSMT', stationName: 'CSMT Mumbai', arrival: 'Source', departure: '19:35', haltMins: 0, distanceKm: 0, day: 1, platform: '18' },
      { stopNo: 2, stationCode: 'DR', stationName: 'Dadar Central', arrival: '19:47', departure: '19:50', haltMins: 3, distanceKm: 9, day: 1, platform: '10' },
      { stopNo: 3, stationCode: 'KYN', stationName: 'Kalyan Junction', arrival: '20:32', departure: '20:35', haltMins: 3, distanceKm: 51, day: 1, platform: '4' },
      { stopNo: 4, stationCode: 'NK', stationName: 'Nashik Road', arrival: '23:10', departure: '23:15', haltMins: 5, distanceKm: 184, day: 1, platform: '2' },
      { stopNo: 5, stationCode: 'BSL', stationName: 'Bhusaval Junction', arrival: '02:05', departure: '02:10', haltMins: 5, distanceKm: 441, day: 2, platform: '5' },
      { stopNo: 6, stationCode: 'BPL', stationName: 'Bhopal Junction', arrival: '09:25', departure: '09:30', haltMins: 5, distanceKm: 837, day: 2, platform: '2' },
      { stopNo: 7, stationCode: 'GWL', stationName: 'Gwalior Junction', arrival: '13:50', departure: '13:55', haltMins: 5, distanceKm: 1229, day: 2, platform: '1' },
      { stopNo: 8, stationCode: 'NDLS', stationName: 'New Delhi', arrival: '21:30', departure: 'Destination', haltMins: 0, distanceKm: 1543, day: 2, platform: '3' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Departed Bhusaval Junction',
      nextStation: 'Khandwa Junction',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 105,
      completedDistanceKm: 490
    }
  },
  {
    number: '12625',
    returnNumber: '12626',
    name: 'Kerala Superfast Express (New Delhi - Trivandrum)',
    hindiName: 'केरल सुपरफास्ट एक्सप्रेस (नई दिल्ली - त्रिवेंद्रम)',
    type: 'Superfast Mail',
    zone: 'SR (Southern Railway)',
    fromStation: {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'Delhi',
      state: 'Delhi',
      depTime: '20:10',
      platform: '2'
    },
    toStation: {
      code: 'TVC',
      name: 'Thiruvananthapuram Central',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      arrTime: '18:45',
      platform: '1'
    },
    duration: '46h 35m',
    distanceKm: 3031,
    avgSpeedKmH: 65,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    catering: 'South Indian & North Indian Pantry Meals • E-Catering',
    wifi: false,
    bioToilet: true,
    punctualityScore: 90,
    cleanlinessRating: 4.5,
    rakeType: 'High Capacity 24-Coach LHB Rake',
    coachesCount: 24,
    isPopular: true,
    highlightTag: 'Grand Lifeline of North-South Trans-National Travel',
    classes: [
      { code: '2A', name: 'AC 2-Tier', baseFare: 3620, available: true, seatType: 'AC 2 Tier', quotaStatus: 'AVAILABLE 8' },
      { code: '3A', name: 'AC 3-Tier', baseFare: 2490, available: true, seatType: 'AC 3 Tier', quotaStatus: 'AVAILABLE 42' },
      { code: 'SL', name: 'Sleeper Class', baseFare: 980, available: true, seatType: 'Sleeper Berths', quotaStatus: 'AVAILABLE 88' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'NDLS', stationName: 'New Delhi', arrival: 'Source', departure: '20:10', haltMins: 0, distanceKm: 0, day: 1, platform: '2' },
      { stopNo: 2, stationCode: 'MTJ', stationName: 'Mathura Junction', arrival: '22:00', departure: '22:05', haltMins: 5, distanceKm: 141, day: 1, platform: '1' },
      { stopNo: 3, stationCode: 'AGC', stationName: 'Agra Cantt', arrival: '22:50', departure: '22:55', haltMins: 5, distanceKm: 195, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'GWL', stationName: 'Gwalior Junction', arrival: '00:30', departure: '00:35', haltMins: 5, distanceKm: 313, day: 2, platform: '1' },
      { stopNo: 5, stationCode: 'BPL', stationName: 'Bhopal Junction', arrival: '05:40', departure: '05:50', haltMins: 10, distanceKm: 702, day: 2, platform: '1' },
      { stopNo: 6, stationCode: 'NGP', stationName: 'Nagpur Junction', arrival: '11:45', departure: '11:55', haltMins: 10, distanceKm: 1092, day: 2, platform: '2' },
      { stopNo: 7, stationCode: 'BZA', stationName: 'Vijayawada Junction', arrival: '21:10', departure: '21:20', haltMins: 10, distanceKm: 1756, day: 2, platform: '1' },
      { stopNo: 8, stationCode: 'TVC', stationName: 'Thiruvananthapuram', arrival: '18:45', departure: 'Destination', haltMins: 0, distanceKm: 3031, day: 3, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Crossing Balharshah-Warangal Section',
      nextStation: 'Warangal (WL)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 110,
      completedDistanceKm: 1420
    }
  },
  {
    number: '20607',
    returnNumber: '20608',
    name: 'MGR Chennai Central - Mysuru Vande Bharat Express',
    hindiName: 'एमजीआर चेन्नई सेंट्रल - मैसूरु वंदे भारत एक्सप्रेस',
    type: 'Vande Bharat',
    zone: 'SR (Southern Railway)',
    fromStation: {
      code: 'MAS',
      name: 'MGR Chennai Central',
      city: 'Chennai',
      state: 'Tamil Nadu',
      depTime: '05:50',
      platform: '2A'
    },
    toStation: {
      code: 'MYS',
      name: 'Mysuru Junction',
      city: 'Mysuru',
      state: 'Karnataka',
      arrTime: '12:20',
      platform: '1'
    },
    duration: '6h 30m',
    distanceKm: 497,
    avgSpeedKmH: 76,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    catering: 'Authentic South Indian Breakfast (Idli, Vada, Upma) & Filter Coffee',
    wifi: true,
    bioToilet: true,
    punctualityScore: 98,
    cleanlinessRating: 4.9,
    rakeType: 'Vande Bharat Aerodynamic EMU Rake',
    coachesCount: 16,
    isPopular: true,
    highlightTag: 'South India’s First Flagship Vande Bharat',
    classes: [
      { code: 'EC', name: 'Executive Chair Car', baseFare: 2380, available: true, seatType: 'Executive Recliner', quotaStatus: 'AVAILABLE 16' },
      { code: 'CC', name: 'AC Chair Car', baseFare: 1280, available: true, seatType: 'Comfortable 2x3 AC', quotaStatus: 'AVAILABLE 72' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'MAS', stationName: 'MGR Chennai Central', arrival: 'Source', departure: '05:50', haltMins: 0, distanceKm: 0, day: 1, platform: '2A' },
      { stopNo: 2, stationCode: 'KPD', stationName: 'Katpadi Junction', arrival: '07:13', departure: '07:15', haltMins: 2, distanceKm: 130, day: 1, platform: '1' },
      { stopNo: 3, stationCode: 'SBC', stationName: 'KSR Bengaluru City', arrival: '10:15', departure: '10:20', haltMins: 5, distanceKm: 359, day: 1, platform: '7' },
      { stopNo: 4, stationCode: 'MYS', stationName: 'Mysuru Junction', arrival: '12:20', departure: 'Destination', haltMins: 0, distanceKm: 497, day: 1, platform: '1' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Between Katpadi and Jolarpettai',
      nextStation: 'KSR Bengaluru City (SBC)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 125,
      completedDistanceKm: 210
    }
  },
  {
    number: '12931',
    returnNumber: '12932',
    name: 'Mumbai Central - Ahmedabad AC Double Decker Express',
    hindiName: 'मुंबई सेंट्रल - अहमदाबाद एसी डबल डेकर एक्सप्रेस',
    type: 'Double Decker',
    zone: 'WR',
    fromStation: {
      code: 'MMCT',
      name: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      depTime: '14:20',
      platform: '1'
    },
    toStation: {
      code: 'ADI',
      name: 'Ahmedabad Junction',
      city: 'Ahmedabad',
      state: 'Gujarat',
      arrTime: '21:40',
      platform: '5'
    },
    duration: '7h 20m',
    distanceKm: 493,
    avgSpeedKmH: 67,
    maxSpeedKmH: 130,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    catering: 'E-Catering Available, Evening Tea, Snacks & Beverages on Demand',
    wifi: true,
    bioToilet: true,
    punctualityScore: 97,
    cleanlinessRating: 4.8,
    rakeType: 'AC Double Decker Bi-Level Stainless Steel Rake',
    coachesCount: 10,
    isPopular: true,
    highlightTag: 'High-Density Bi-Level AC Double Decker Corridor',
    classes: [
      { code: 'CC', name: 'AC Chair Car (Double Decker)', baseFare: 680, available: true, seatType: 'Upper & Lower Deck Recliner', quotaStatus: 'AVAILABLE 120' }
    ],
    halts: [
      { stopNo: 1, stationCode: 'MMCT', stationName: 'Mumbai Central', arrival: 'Source', departure: '14:20', haltMins: 0, distanceKm: 0, day: 1, platform: '1' },
      { stopNo: 2, stationCode: 'BVI', stationName: 'Borivali', arrival: '14:52', departure: '14:55', haltMins: 3, distanceKm: 30, day: 1, platform: '6' },
      { stopNo: 3, stationCode: 'ST', stationName: 'Surat', arrival: '17:52', departure: '17:57', haltMins: 5, distanceKm: 263, day: 1, platform: '1' },
      { stopNo: 4, stationCode: 'BRC', stationName: 'Vadodara Junction', arrival: '19:28', departure: '19:33', haltMins: 5, distanceKm: 393, day: 1, platform: '2' },
      { stopNo: 5, stationCode: 'ADI', stationName: 'Ahmedabad Junction', arrival: '21:40', departure: 'Destination', haltMins: 0, distanceKm: 493, day: 1, platform: '5' }
    ],
    liveStatusSimulation: {
      currentLocation: 'Departed Surat Junction (ST)',
      nextStation: 'Vadodara Junction (BRC)',
      status: 'On Time',
      delayMinutes: 0,
      currentSpeedKmH: 120,
      completedDistanceKm: 285
    }
  }
];
