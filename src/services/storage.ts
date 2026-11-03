import { UserApplication, BookingRecord, ScenarioType, InventoryEvent, PoolSummary } from '../types';

const STORAGE_KEY_APPLICATIONS = 'fairflow_applications_v1';
const STORAGE_KEY_BOOKINGS = 'fairflow_bookings_v1';
const STORAGE_KEY_EVENTS = 'fairflow_inventory_events_v1';
const STORAGE_KEY_ACTIVE_SCENARIO = 'fairflow_active_scenario_v1';

// Seed initial realistic application if empty
function getInitialApplications(): UserApplication[] {
  return [
    {
      id: 'APP-2026-90412',
      scenarioId: 'railway',
      submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      routeOrEventId: 'train-12001',
      routeOrEventLabel: 'Express 12001 (New Delhi → Varanasi Superfast)',
      date: '2026-09-15',
      tierOrClass: 'Executive Chair Car (EC)',
      quotaOrType: 'FairFlow Experimental Quota',
      passengers: [
        {
          name: 'Vikramaditya Sharma',
          age: 34,
          idType: 'Govt Synthetic ID',
          idNumberSynthetic: 'SYN-8823-9182',
          seatPreference: 'Window'
        },
        {
          name: 'Priyanka Sharma',
          age: 31,
          idType: 'Govt Synthetic ID',
          idNumberSynthetic: 'SYN-4412-0091',
          seatPreference: 'Aisle'
        }
      ],
      flexibleTiming: false,
      status: 'window_active',
      riskAssessment: {
        level: 'low',
        score: 12,
        verificationFlag: 'Device signature and pre-reg timestamp verified',
        explanation: 'Risk assessment is used only for eligibility/verification in this prototype.'
      },
      allocation: {
        poolId: 'pool-A',
        poolName: 'Pool Alpha (Window 10:00 - 10:03)',
        bookingWindowStart: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        bookingWindowEnd: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        windowDurationMinutes: 3,
        priorityOrder: 1,
        randomSeedUsed: '0x8F92A1B7'
      }
    },
    {
      id: 'APP-2026-88104',
      scenarioId: 'railway',
      submittedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      routeOrEventId: 'train-12952',
      routeOrEventLabel: 'Rajdhani 12952 (Mumbai Central → New Delhi Premium)',
      date: '2026-09-18',
      tierOrClass: 'AC 2 Tier (2A)',
      quotaOrType: 'FairFlow Experimental Quota',
      passengers: [
        {
          name: 'Aarav Patel',
          age: 28,
          idType: 'Synthetic Resident Pass',
          idNumberSynthetic: 'SYN-1029-7734',
          seatPreference: 'Lower'
        }
      ],
      flexibleTiming: true,
      status: 'booked',
      riskAssessment: {
        level: 'low',
        score: 8,
        verificationFlag: 'Clean pre-registration telemetry',
        explanation: 'Risk assessment is used only for eligibility/verification in this prototype.'
      },
      allocation: {
        poolId: 'pool-B',
        poolName: 'Pool Beta (Window 10:03 - 10:06)',
        bookingWindowStart: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        bookingWindowEnd: new Date(Date.now() - 87 * 60 * 1000).toISOString(),
        windowDurationMinutes: 3,
        priorityOrder: 2,
        randomSeedUsed: '0x8F92A1B7'
      },
      bookingId: 'FF-2026-48291'
    }
  ];
}

function getInitialBookings(): BookingRecord[] {
  return [
    {
      id: 'FF-2026-48291',
      applicationId: 'APP-2026-88104',
      scenarioId: 'railway',
      passengerCount: 1,
      primaryPassenger: 'Aarav Patel',
      itemDetails: 'Rajdhani 12952 • AC 2 Tier (2A)',
      poolId: 'pool-B',
      amountSynthetic: 2450,
      currency: '₹ (Simulated)',
      paymentStatus: 'captured',
      reservedAt: new Date(Date.now() - 88 * 60 * 1000).toISOString(),
      confirmedAt: new Date(Date.now() - 88 * 60 * 1000 + 42000).toISOString(),
      seatSyntheticRef: 'Coach A2 - Berth 23 (Lower)'
    }
  ];
}

function getInitialEvents(): InventoryEvent[] {
  const now = Date.now();
  return [
    {
      id: 'EVT-1',
      timestamp: new Date(now - 12 * 60 * 1000).toLocaleTimeString(),
      poolName: 'System Engine',
      type: 'provision',
      units: 1000,
      description: '1,000 total seats initialized for High-Speed Railway Tatkal'
    },
    {
      id: 'EVT-2',
      timestamp: new Date(now - 10 * 60 * 1000).toLocaleTimeString(),
      poolName: 'Pool Alpha',
      type: 'provision',
      units: 120,
      description: 'Provisional allocation of 120 berths assigned to Pool Alpha'
    },
    {
      id: 'EVT-3',
      timestamp: new Date(now - 7 * 60 * 1000).toLocaleTimeString(),
      poolName: 'Pool Alpha',
      type: 'booking',
      units: 86,
      description: '86 bookings successfully confirmed within 3-minute window'
    },
    {
      id: 'EVT-4',
      timestamp: new Date(now - 6 * 60 * 1000).toLocaleTimeString(),
      poolName: 'Pool Alpha',
      type: 'recycle',
      units: 34,
      description: '34 unbooked units recycled from Pool Alpha back to dynamic reserve'
    },
    {
      id: 'EVT-5',
      timestamp: new Date(now - 5 * 60 * 1000).toLocaleTimeString(),
      poolName: 'Pool Beta',
      type: 'provision',
      units: 140,
      description: 'Pool Beta received 106 standard + 34 recycled units (Total 140)'
    }
  ];
}

export const StorageService = {
  getApplications(): UserApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      if (!data) {
        const initial = getInitialApplications();
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialApplications();
    }
  },

  getApplicationById(id: string): UserApplication | undefined {
    return this.getApplications().find((a) => a.id === id);
  },

  saveApplication(app: UserApplication): void {
    const list = this.getApplications();
    const existingIndex = list.findIndex((a) => a.id === app.id);
    if (existingIndex >= 0) {
      list[existingIndex] = app;
    } else {
      list.unshift(app);
    }
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fairflow_storage_updated'));
  },

  getBookings(): BookingRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (!data) {
        const initial = getInitialBookings();
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialBookings();
    }
  },

  saveBooking(booking: BookingRecord): void {
    const list = this.getBookings();
    list.unshift(booking);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fairflow_storage_updated'));
  },

  updateBooking(booking: BookingRecord): void {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id === booking.id);
    if (idx >= 0) {
      list[idx] = booking;
    } else {
      list.unshift(booking);
    }
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fairflow_storage_updated'));
  },

  updateBookingCalendarEvent(bookingId: string, calendarEvent?: BookingRecord['googleCalendarEvent']): void {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id === bookingId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        googleCalendarEvent: calendarEvent
      };
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('fairflow_storage_updated'));
    }
  },

  getEvents(): InventoryEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (!data) {
        const initial = getInitialEvents();
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialEvents();
    }
  },

  addEvent(event: Omit<InventoryEvent, 'id'>): void {
    const events = this.getEvents();
    const newEvent: InventoryEvent = {
      ...event,
      id: 'EVT-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    };
    events.unshift(newEvent);
    if (events.length > 50) events.pop();
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('fairflow_events_updated'));
  },

  getActiveScenario(): ScenarioType {
    try {
      const s = localStorage.getItem(STORAGE_KEY_ACTIVE_SCENARIO) as ScenarioType;
      return s || 'railway';
    } catch {
      return 'railway';
    }
  },

  setActiveScenario(scenario: ScenarioType): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SCENARIO, scenario);
    window.dispatchEvent(new CustomEvent('fairflow_scenario_changed', { detail: scenario }));
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(getInitialApplications()));
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(getInitialBookings()));
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(getInitialEvents()));
    window.dispatchEvent(new CustomEvent('fairflow_storage_updated'));
  }
};
