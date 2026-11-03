// Indian Railways Station Geofencing & Track Safety Service

export interface StationLocation {
  code: string;
  name: string;
  hindiName: string;
  lat: number;
  lng: number;
  city: string;
}

export const MAJOR_STATIONS: StationLocation[] = [
  {
    code: 'NDLS',
    name: 'New Delhi Railway Station',
    hindiName: 'नई दिल्ली रेलवे स्टेशन',
    lat: 28.6430,
    lng: 77.2197,
    city: 'New Delhi'
  },
  {
    code: 'CSMT',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस',
    lat: 18.9401,
    lng: 72.8354,
    city: 'Mumbai'
  },
  {
    code: 'HWH',
    name: 'Howrah Junction',
    hindiName: 'हावड़ा जंक्शन',
    lat: 22.5839,
    lng: 88.3426,
    city: 'Kolkata'
  },
  {
    code: 'SBC',
    name: 'KSR Bengaluru City Junction',
    hindiName: 'क्रांतिवीर संगोली रायण्णा बेंगलुरु',
    lat: 12.9781,
    lng: 77.5694,
    city: 'Bengaluru'
  },
  {
    code: 'MAS',
    name: 'Puratchi Thalaivar Dr. M.G.R Chennai Central',
    hindiName: 'चेन्नई सेंट्रल',
    lat: 13.0827,
    lng: 80.2755,
    city: 'Chennai'
  },
  {
    code: 'PUNE',
    name: 'Pune Junction',
    hindiName: 'पुणे जंक्शन',
    lat: 18.5284,
    lng: 73.8744,
    city: 'Pune'
  }
];

export type GeofenceZoneType = 'OFF_STATION_SAFE' | 'STATION_CONCOURSE' | 'RESTRICTED_TRACK_ZONE';

export interface StationClearanceToken {
  id: string;
  stationCode: string;
  stationName: string;
  verifiedAt: string;
  expiresAt: string;
  verificationMethod: 'QR_SCAN' | 'STATION_MASTER_KIOSK';
  isSafetyCleared: boolean;
}

const TOKEN_STORAGE_KEY = 'fairflow_station_clearance_token';
const ZONE_SIMULATION_KEY = 'fairflow_zone_simulation';

// Haversine distance in meters
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Determine zone type based on distance from nearest track center
export function getZoneFromDistance(distanceMeters: number): GeofenceZoneType {
  if (distanceMeters <= 100) {
    return 'RESTRICTED_TRACK_ZONE';
  } else if (distanceMeters <= 300) {
    return 'STATION_CONCOURSE';
  }
  return 'OFF_STATION_SAFE';
}

export class GeofenceService {
  // Get active clearance token from localStorage
  static getActiveClearanceToken(): StationClearanceToken | null {
    try {
      const data = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!data) return null;
      const token: StationClearanceToken = JSON.parse(data);
      const now = new Date().getTime();
      const expires = new Date(token.expiresAt).getTime();
      if (now > expires) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  // Issue clearance token after scanning valid station QR
  static issueClearanceToken(station: StationLocation, method: 'QR_SCAN' | 'STATION_MASTER_KIOSK' = 'QR_SCAN'): StationClearanceToken {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes validity

    const token: StationClearanceToken = {
      id: `STN-CLR-${station.code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      stationCode: station.code,
      stationName: station.name,
      verifiedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      verificationMethod: method,
      isSafetyCleared: true
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
    return token;
  }

  // Clear token (for testing)
  static revokeClearanceToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  // Check if booking is allowed under current zone & token status
  static isBookingAllowed(currentZone: GeofenceZoneType, activeToken: StationClearanceToken | null): {
    allowed: boolean;
    reason?: string;
  } {
    if (currentZone === 'OFF_STATION_SAFE') {
      return { allowed: true };
    }

    if (currentZone === 'RESTRICTED_TRACK_ZONE') {
      if (activeToken && activeToken.isSafetyCleared) {
        return {
          allowed: true,
          reason: `Verified via Station QR Token (${activeToken.id})`
        };
      }
      return {
        allowed: false,
        reason: 'You are within the high-risk railway track perimeter (<100m). For passenger safety and anti-touting compliance, scan the official Station Master QR Code at the station concourse or kiosk to proceed.'
      };
    }

    // Station concourse
    return {
      allowed: true,
      reason: 'Located in station concourse. Verification recommended.'
    };
  }
}
