import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  Wrench,
  AlertTriangle,
  Train,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
  ShieldAlert,
  PhoneCall,
  Check,
  Send,
  Ticket,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  ThumbsUp,
  RefreshCw
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { saveComplaintToFirestore, saveMealOrderToFirestore } from '../../services/firebase';
import { RailMadadTracker } from './RailMadadTracker';

export type ServiceCategory = 'food' | 'cleaning' | 'repair' | 'complaint';

interface ServicesViewProps {
  initialCategory?: ServiceCategory;
}

interface FoodItem {
  id: string;
  name: string;
  hindiName: string;
  category: 'meal' | 'breakfast' | 'beverage' | 'snack';
  diet: 'veg' | 'non-veg' | 'jain';
  price: number;
  description: string;
  calories: string;
  vendor: string;
}

const FOOD_MENU: FoodItem[] = [
  {
    id: 'f1',
    name: 'IRCTC Deluxe North Indian Thali',
    hindiName: 'डीलक्स उत्तर भारतीय शाकाहारी थाली',
    category: 'meal',
    diet: 'veg',
    price: 150,
    description: 'Paneer butter masala, Dal makhani, Jeera rice, 3 Tawa rotis, Curd, Gulab jamun & Pickle.',
    calories: '680 kcal',
    vendor: 'IRCTC Base Kitchen'
  },
  {
    id: 'f2',
    name: 'Jain Sattvik Royal Meal Box',
    hindiName: 'जैन सात्विक थाली (बिना प्याज-लहसुन)',
    category: 'meal',
    diet: 'jain',
    price: 160,
    description: 'Strictly No Onion & Garlic. Shahi Paneer, Moong dal, Steamed Basmati rice, 3 Phulkas & Sweet.',
    calories: '610 kcal',
    vendor: 'Shree Jain Bhawan Pantry'
  },
  {
    id: 'f3',
    name: 'Hyderabadi Chicken Dum Biryani',
    hindiName: 'हैदराबादी चिकन दम बिरयानी',
    category: 'meal',
    diet: 'non-veg',
    price: 195,
    description: 'Aromatic basmati rice cooked with tender marinated chicken cuts, served with Mirchi Ka Salan & Raita.',
    calories: '740 kcal',
    vendor: 'Pantry Car Chef Special'
  },
  {
    id: 'f4',
    name: 'South Indian Combo (Idli-Vada-Sambar)',
    hindiName: 'इडली-वड़ा-सांभर नाश्ता',
    category: 'breakfast',
    diet: 'veg',
    price: 70,
    description: '2 Steamed rice idlis, 1 crispy medu vada, piping hot dal sambar and fresh coconut chutney.',
    calories: '380 kcal',
    vendor: 'Comsom E-Catering'
  },
  {
    id: 'f5',
    name: 'Vegetable Cutlet & Butter Toast',
    hindiName: 'वेज कटलेट एवं बटर टोस्ट',
    category: 'breakfast',
    diet: 'veg',
    price: 55,
    description: '2 Spiced potato vegetable patties with toasted bread slices, butter chiplet & tomato sauce.',
    calories: '320 kcal',
    vendor: 'IRCTC Pantry Car'
  },
  {
    id: 'f6',
    name: 'Rail Neer Packaged Drinking Water (1L)',
    hindiName: 'रेल नीर 1 लीटर मिनरल वाटर',
    category: 'beverage',
    diet: 'veg',
    price: 15,
    description: 'Official purified packaged drinking water with essential minerals (MRP ₹15 strictly enforced).',
    calories: '0 kcal',
    vendor: 'IRCTC Plant'
  },
  {
    id: 'f7',
    name: 'Special Masala Kulhad Chai (2 Cups)',
    hindiName: 'कुल्हड़ मसाला चाय (2 कप)',
    category: 'beverage',
    diet: 'veg',
    price: 30,
    description: 'Brewed with cardamom, ginger, and Assam tea leaves served in authentic eco-friendly terracotta cups.',
    calories: '90 kcal',
    vendor: 'Pantry Vendor'
  },
  {
    id: 'f8',
    name: 'Warm Gulab Jamun (2 Pieces)',
    hindiName: 'गर्म गुलाब जामुन (2 पीस)',
    category: 'snack',
    diet: 'veg',
    price: 45,
    description: 'Mawa dumplings soaked in saffron-rose cardamom syrup, served warm in sealed tin.',
    calories: '260 kcal',
    vendor: 'Haldiram Express'
  }
];

interface ActiveServiceRecord {
  id: string;
  category: ServiceCategory;
  title: string;
  pnr: string;
  coachBerth: string;
  timestamp: string;
  status: 'Received' | 'Assigned' | 'In Progress' | 'Completed';
  statusDetails: string;
  badgeColor: string;
  otp?: string;
  eta?: string;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ initialCategory }) => {
  const { theme, t } = useAccessibility();
  const { currentUser, isLoggedIn, triggerLoginRequired } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(initialCategory || 'food');

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Journey Details State
  const [pnr, setPnr] = useState('2418-904128');
  const [trainName, setTrainName] = useState('12952 Mumbai Tejas Rajdhani Express');
  const [coach, setCoach] = useState('B4');
  const [berth, setBerth] = useState('42 (Lower Berth)');
  const passengerName = currentUser ? currentUser.fullName : 'Guest Passenger';
  const [selectedStation, setSelectedStation] = useState('Vadodara Jn (BRC) • 15:45');

  // Food Tab State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [foodPaymentMode, setFoodPaymentMode] = useState<'cod' | 'upi' | 'wallet'>('cod');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain'>('all');

  // Cleaning Tab State
  const [cleaningTarget, setCleaningTarget] = useState<string>('washroom');
  const [cleaningNote, setCleaningNote] = useState<string>('');

  // Repair Tab State
  const [repairCategory, setRepairCategory] = useState<string>('socket');
  const [repairUrgency, setRepairUrgency] = useState<'normal' | 'urgent' | 'critical'>('urgent');
  const [repairDescription, setRepairDescription] = useState<string>('');

  // Complaint Tab State
  const [complaintCategory, setComplaintCategory] = useState<string>('pantry');
  const [complaintLocation, setComplaintLocation] = useState<string>('Between Surat and Vadodara');
  const [complaintText, setComplaintText] = useState<string>('');
  const [complaintAnonymous, setComplaintAnonymous] = useState(false);

  // Active Requests History State
  const [activeRequests, setActiveRequests] = useState<ActiveServiceRecord[]>([
    {
      id: 'CM-2026-8812',
      category: 'cleaning',
      title: 'Coach Mitra: Washroom Sanitization & Odor Control',
      pnr: '2418-904128',
      coachBerth: 'Coach B4 • Berth 42',
      timestamp: 'Today, 11:20 AM',
      status: 'In Progress',
      statusDetails: 'OBHS Staff Rameshwar Kumar (Emp #4402) dispatched with chemical sanitizer kit.',
      badgeColor: 'text-amber-400 border-amber-400 bg-amber-400/10',
      otp: '6821',
      eta: '8 mins'
    },
    {
      id: 'ORD-IRCTC-4491',
      category: 'food',
      title: 'IRCTC Deluxe North Indian Thali x 1, Rail Neer x 1',
      pnr: '2418-904128',
      coachBerth: 'Coach B4 • Berth 42',
      timestamp: 'Today, 10:45 AM',
      status: 'Assigned',
      statusDetails: 'Order confirmed with Vadodara Jn IRCTC Base Kitchen. Will be delivered upon train arrival.',
      badgeColor: 'text-blue-400 border-blue-400 bg-blue-400/10',
      eta: 'At Vadodara (15:45)'
    }
  ]);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Cart operations
  const addToCart = (itemId: string) => {
    if (!isLoggedIn) {
      triggerLoginRequired('order food items & pantry meals');
      return;
    }
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const totalCartPrice: number = Object.entries(cart).reduce((sum: number, [id, rawQty]) => {
    const qty = Number(rawQty) || 0;
    const item = FOOD_MENU.find((f) => f.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const totalCartCount: number = (Object.values(cart) as number[]).reduce((sum: number, q: number) => sum + (Number(q) || 0), 0);

  // Submit Food Order
  const handlePlaceFoodOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      triggerLoginRequired('order food items & pantry meals');
      return;
    }
    if (totalCartCount === 0) return;

    const newId = `ORD-IRCTC-${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSummary = Object.entries(cart)
      .map(([id, qty]) => {
        const item = FOOD_MENU.find((f) => f.id === id);
        return `${item?.name || 'Meal'} x ${qty}`;
      })
      .join(', ');

    const newRecord: ActiveServiceRecord = {
      id: newId,
      category: 'food',
      title: itemsSummary,
      pnr,
      coachBerth: `Coach ${coach} • Berth ${berth}`,
      timestamp: 'Just now',
      status: 'Received',
      statusDetails: `Order sent to ${selectedStation.split('•')[0]}. Delivery to berth ${coach}/${berth}. Payment: ${foodPaymentMode.toUpperCase()}.`,
      badgeColor: 'text-cyan-400 border-cyan-400 bg-cyan-400/10',
      eta: 'Next Station Stop'
    };

    setActiveRequests([newRecord, ...activeRequests]);
    setCart({});
    showNotification(`Food order ${newId} placed successfully! Delivery at ${selectedStation}.`);

    // Sync to Firestore
    if (currentUser?.id) {
      saveMealOrderToFirestore(currentUser.id, {
        id: newId,
        pnr,
        items: itemsSummary,
        totalPrice: totalCartPrice,
        deliveryStation: selectedStation,
        coach,
        seat: berth,
        status: 'Preparing'
      });
    }
  };

  // Submit Cleaning Request
  const handleRequestCleaning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      triggerLoginRequired('book Coach Mitra cleaning service');
      return;
    }
    const newId = `CM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const targetLabels: Record<string, string> = {
      washroom: 'Washroom / Toilet Sanitization & Disinfection',
      berth: 'Berth & Floor Vacuum Sweeping',
      dustbin: 'Compartment Dustbin Emptying',
      linen: 'Bedroll / Clean Blanket Replacement',
      doorway: 'Doorway & Gangway Area Mopping'
    };

    const newRecord: ActiveServiceRecord = {
      id: newId,
      category: 'cleaning',
      title: `Coach Mitra: ${targetLabels[cleaningTarget] || 'General Cleaning'}`,
      pnr,
      coachBerth: `Coach ${coach} • Berth ${berth}`,
      timestamp: 'Just now',
      status: 'Assigned',
      statusDetails: `OBHS Team assigned to Coach ${coach}. Share OTP ${generatedOtp} with cleaning staff only after completion.`,
      badgeColor: 'text-emerald-400 border-emerald-400 bg-emerald-400/10',
      otp: generatedOtp,
      eta: '10-15 mins'
    };

    setActiveRequests([newRecord, ...activeRequests]);
    setCleaningNote('');
    showNotification(`Cleaning Request ${newId} assigned to On-Board Housekeeping staff (OBHS)! OTP: ${generatedOtp}`);
  };

  // Submit Repair Request
  const handleRequestRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      triggerLoginRequired('book train maintenance and repair service');
      return;
    }
    const newId = `REP-TXR-${Math.floor(10000 + Math.random() * 90000)}`;

    const issueLabels: Record<string, string> = {
      socket: 'Mobile / Laptop Charging Socket Not Working',
      ac: 'AC Temperature Adjustment (Overcooling / Insufficient Airflow)',
      light: 'Individual Reading Lamp / Mirror Light Defective',
      blind: 'Window Shutter / Roller Blind Jammed',
      latch: 'Upper Berth Ladder / Safety Latch / Berth Chain Loose',
      water: 'Washroom Tap / Flush Valve Water Supply Issue'
    };

    const newRecord: ActiveServiceRecord = {
      id: newId,
      category: 'repair',
      title: `TXR Maintenance: ${issueLabels[repairCategory] || 'Mechanical Repair'}`,
      pnr,
      coachBerth: `Coach ${coach} • Berth ${berth}`,
      timestamp: 'Just now',
      status: 'In Progress',
      statusDetails: `Escorting electrical technician alerted. Priority: ${repairUrgency.toUpperCase()}. Inspection team arriving at coach ${coach}.`,
      badgeColor: 'text-amber-400 border-amber-400 bg-amber-400/10',
      eta: 'Within 20 mins'
    };

    setActiveRequests([newRecord, ...activeRequests]);
    setRepairDescription('');
    showNotification(`Maintenance Ticket ${newId} dispatched to On-Board Carriage/Electrical Engineer.`);
  };

  // Submit Complaint
  const handleRegisterComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      triggerLoginRequired('lodge RailMadad complaints & grievances');
      return;
    }
    const newId = `MADAD-${Math.floor(100000 + Math.random() * 900000)}`;

    const catLabels: Record<string, string> = {
      security: 'Security / RPF Assistance',
      medical: 'Medical First-Aid & Doctor on Call',
      pantry: 'Catering Overcharging / Hygiene Grievance',
      luggage: 'Luggage / Theft Assistance',
      staff: 'Staff Conduct / TTE Behavior',
      noise: 'Passenger Noise Disturbance / Unauthorized Person'
    };

    const newRecord: ActiveServiceRecord = {
      id: newId,
      category: 'complaint',
      title: `RailMadad Grievance: ${catLabels[complaintCategory] || 'Passenger Complaint'}`,
      pnr,
      coachBerth: `Coach ${coach} • Berth ${berth}`,
      timestamp: 'Just now',
      status: 'In Progress',
      statusDetails: `Complaint registered in RailMadad central database. Assigned to Divisional Commercial Manager (DCM). 30-min escalation timer active.`,
      badgeColor: 'text-rose-400 border-rose-400 bg-rose-400/10',
      eta: 'Resolution within 30 min'
    };

    setActiveRequests([newRecord, ...activeRequests]);
    setComplaintText('');
    showNotification(`RailMadad Grievance ${newId} logged with official 30-minute escalation SLA.`);

    // Sync to Firestore
    if (currentUser?.id) {
      saveComplaintToFirestore(currentUser.id, {
        id: newId,
        pnr,
        category: complaintCategory,
        trainNumber: trainName.split(' ')[0] || '12952',
        coach,
        berth,
        description: complaintText || `Issue reported regarding ${catLabels[complaintCategory]}`,
        status: 'Registered'
      });
    }
  };

  const filteredFood = FOOD_MENU.filter((item) => {
    if (dietFilter === 'all') return true;
    return item.diet === dietFilter;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-ticket">
      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-[#0B2545] border-2 border-[#EA580C] text-white shadow-2xl animate-in slide-in-from-bottom flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-300 uppercase tracking-wide">Railway Service Update</div>
            <div className="text-slate-100 mt-0.5">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl border-t-4 border-t-[#EA580C] border border-slate-200 shadow-md relative overflow-hidden bg-[#0B2545] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFB703] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>IRCTC & RailMadad Integrated In-Transit Services</span>
              </span>
              <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-sans font-semibold hidden sm:inline">
                Live On-Train Assistance
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-ticket">
              Passenger On-Board Services / <span className="text-[#FFB703]">रेल यात्रा सेवाएँ</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl font-sans leading-relaxed">
              Official Indian Railways service hub for on-demand pantry meals, Coach Mitra housekeeping, mechanical/electrical maintenance, and RailMadad 24x7 security grievances.
            </p>
          </div>

          {/* Active Travel Info Card with PNR */}
          <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs min-w-[280px]">
            <div className="text-[10px] uppercase font-bold text-amber-300 font-ticket flex items-center justify-between">
              <span>Linked Active Journey</span>
              <span className="text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Running On-Time
              </span>
            </div>

            <div className="mt-2 text-xs font-bold text-white flex items-center gap-1.5">
              <Train className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">{trainName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-sans">
              <div>
                <span className="text-slate-300 block text-[9px] uppercase">PNR Number</span>
                <span className="text-amber-300 font-mono font-bold">{pnr}</span>
              </div>
              <div>
                <span className="text-slate-300 block text-[9px] uppercase">Berth & Coach</span>
                <span className="text-white font-bold">{coach} / {berth}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-200">
              <span>Passenger: <strong>{passengerName}</strong></span>
              <span className="text-amber-200">Next: Surat Jn</span>
            </div>
          </div>
        </div>

        {/* 139 Emergency Helpline Ribbon */}
        <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Emergency RailMadad Helpline: <strong className="text-white font-mono text-sm">139</strong> (Toll Free, 24x7, Multilingual)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-200">
            <span>• Security Helpline: <strong>182</strong></span>
            <span>• Medical Doctor On Call Available</span>
          </div>
        </div>
      </div>

      {/* 4 PRIMARY SERVICE OPTIONS: Food, Cleaning, Repair, Complaint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Option 1: Food */}
        <button
          onClick={() => setActiveCategory('food')}
          className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden group shadow-xs ${
            activeCategory === 'food'
              ? 'bg-orange-50/80 border-[#EA580C] shadow-sm scale-[1.01]'
              : 'bg-white border-slate-200 hover:border-[#EA580C] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                activeCategory === 'food'
                  ? 'bg-[#EA580C] text-white shadow-sm'
                  : 'bg-orange-50 text-[#EA580C] border border-orange-200'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            {totalCartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white font-mono font-bold text-xs">
                {totalCartCount} in cart
              </span>
            )}
          </div>
          <h3 className="text-base font-bold font-ticket text-slate-900">
            Food / खान-पान
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
            E-Catering meals, thalis, tea & snacks delivered directly to your berth.
          </p>
          <div className="mt-3 text-[10px] font-bold text-[#EA580C] flex items-center gap-1">
            <span>Order to Seat</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Option 2: Cleaning */}
        <button
          onClick={() => setActiveCategory('cleaning')}
          className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden group shadow-xs ${
            activeCategory === 'cleaning'
              ? 'bg-emerald-50/80 border-emerald-600 shadow-sm scale-[1.01]'
              : 'bg-white border-slate-200 hover:border-emerald-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                activeCategory === 'cleaning'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              OBHS Live
            </span>
          </div>
          <h3 className="text-base font-bold font-ticket text-slate-900">
            Cleaning / स्वच्छता
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
            Coach Mitra on-demand washroom sanitization, berth sweeping, and trash clearance.
          </p>
          <div className="mt-3 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
            <span>Call Attendant</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Option 3: Repair */}
        <button
          onClick={() => setActiveCategory('repair')}
          className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden group shadow-xs ${
            activeCategory === 'repair'
              ? 'bg-blue-50/80 border-[#1D4ED8] shadow-sm scale-[1.01]'
              : 'bg-white border-slate-200 hover:border-[#1D4ED8] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                activeCategory === 'repair'
                  ? 'bg-[#1D4ED8] text-white shadow-sm'
                  : 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
              TXR Crew
            </span>
          </div>
          <h3 className="text-base font-bold font-ticket text-slate-900">
            Repair / मरम्मत
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
            Fix faulty charging sockets, AC temperature, reading lights & berth fixtures.
          </p>
          <div className="mt-3 text-[10px] font-bold text-[#1D4ED8] flex items-center gap-1">
            <span>Maintenance</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Option 4: Complaint */}
        <button
          onClick={() => setActiveCategory('complaint')}
          className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden group shadow-xs ${
            activeCategory === 'complaint'
              ? 'bg-red-50/80 border-red-600 shadow-sm scale-[1.01]'
              : 'bg-white border-slate-200 hover:border-red-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                activeCategory === 'complaint'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-bold">
              RailMadad
            </span>
          </div>
          <h3 className="text-base font-bold font-ticket text-slate-900">
            Complaint / शिकायत
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
            Grievances, overcharging, security assistance, and medical emergencies.
          </p>
          <div className="mt-3 text-[10px] font-bold text-red-700 flex items-center gap-1">
            <span>Register Grievance</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* DETAILED INTERACTIVE VIEW BASED ON SELECTED CATEGORY */}

      {/* 1. FOOD / खान-पान (E-Catering & Pantry) */}
      {activeCategory === 'food' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items Section (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-[#0B2545] font-ticket flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#EA580C]" />
                  <span>IRCTC E-Catering & Pantry Menu / भोजन सूची</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select meals to be delivered right at your seat in Coach {coach}, Berth {berth}.
                </p>
              </div>

              {/* Diet Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDietFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    dietFilter === 'all'
                      ? 'bg-[#0B2545] text-white font-ticket'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setDietFilter('veg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    dietFilter === 'veg'
                      ? 'bg-emerald-600 text-white font-ticket'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietFilter('jain')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    dietFilter === 'jain'
                      ? 'bg-amber-600 text-white font-ticket'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Jain (No Onion)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietFilter('non-veg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    dietFilter === 'non-veg'
                      ? 'bg-rose-600 text-white font-ticket'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredFood.map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#EA580C] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center p-0.5 ${
                                item.diet === 'veg'
                                  ? 'border-emerald-600'
                                  : item.diet === 'jain'
                                  ? 'border-amber-600'
                                  : 'border-rose-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.diet === 'veg'
                                    ? 'bg-emerald-600'
                                    : item.diet === 'jain'
                                    ? 'bg-amber-600'
                                    : 'bg-rose-600'
                                }`}
                              />
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.vendor}</span>
                          </div>
                          <h4 className="text-sm font-bold font-ticket mt-1 text-slate-900">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-[#EA580C] font-semibold">{item.hindiName}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-[#EA580C] font-ticket">₹{item.price}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{item.calories}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 font-sans line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Quantity Selector / Add to Cart */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-sans">
                        {qty > 0 ? `Selected: ${qty}` : 'Freshly prepared'}
                      </span>

                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#EA580C] text-white rounded-lg px-2 py-1 font-bold">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-black/20 rounded"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs w-4 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item.id)}
                            className="p-1 hover:bg-black/20 rounded"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-[#EA580C] text-[#EA580C] hover:text-white font-ticket text-xs font-bold transition-colors flex items-center gap-1.5 border border-orange-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Checkout Sidebar (1 column) */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 shadow-sm bg-white text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold font-ticket text-[#0B2545]">
                  <ShoppingBag className="w-4 h-4 text-[#EA580C]" />
                  <span>Your Food Cart ({totalCartCount})</span>
                </div>
                {totalCartCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart({})}
                    className="text-[11px] text-red-600 hover:underline font-semibold"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart List */}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                {totalCartCount === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-sans">
                    <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <span>Your cart is empty. Click "+ Add to Order" on any meal item.</span>
                  </div>
                ) : (
                  Object.entries(cart).map(([id, rawQty]) => {
                    const item = FOOD_MENU.find((f) => f.id === id);
                    if (!item) return null;
                    const numQty = Number(rawQty) || 0;
                    return (
                      <div key={id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                        <div className="truncate max-w-[150px]">
                          <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-500">₹{item.price} x {numQty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#EA580C] font-mono">₹{item.price * numQty}</span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Delivery Details Form */}
              <form onSubmit={handlePlaceFoodOrder} className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 font-sans">Delivery Station</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#0B2545] font-sans"
                  >
                    <option value="Surat Jn (ST) • 14:15">Surat Jn (ST) • ETA 14:15</option>
                    <option value="Vadodara Jn (BRC) • 15:45">Vadodara Jn (BRC) • ETA 15:45 (Recommended)</option>
                    <option value="Ratlam Jn (RTM) • 18:20">Ratlam Jn (RTM) • ETA 18:20 (Dinner)</option>
                    <option value="Kota Jn (KOTA) • 21:30">Kota Jn (KOTA) • ETA 21:30</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Coach</label>
                    <input
                      type="text"
                      value={coach}
                      onChange={(e) => setCoach(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0B2545]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Berth / Seat</label>
                    <input
                      type="text"
                      value={berth}
                      onChange={(e) => setBerth(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0B2545]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 font-sans">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFoodPaymentMode('cod')}
                      className={`p-2 rounded-lg border text-center transition-colors font-semibold ${
                        foodPaymentMode === 'cod'
                          ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      Cash / COD
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodPaymentMode('upi')}
                      className={`p-2 rounded-lg border text-center transition-colors font-semibold ${
                        foodPaymentMode === 'upi'
                          ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      Prepaid UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodPaymentMode('wallet')}
                      className={`p-2 rounded-lg border text-center transition-colors font-semibold ${
                        foodPaymentMode === 'wallet'
                          ? 'border-[#EA580C] bg-orange-50 text-[#EA580C]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      IRCTC Wallet
                    </button>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalCartCount} items)</span>
                    <span className="font-mono font-semibold">₹{totalCartPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Station Delivery Surcharge</span>
                    <span className="text-emerald-700 font-mono font-semibold">₹0 (Free)</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-[#EA580C] font-mono">₹{totalCartPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={totalCartCount === 0}
                  className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase font-ticket shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Place Food Order / भोजन ऑर्डर करें</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLEANING / स्वच्छता (Coach Mitra OBHS) */}
      {activeCategory === 'cleaning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#0B2545] font-ticket flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Coach Mitra: On-Board Housekeeping Service (OBHS) / सफाई सेवा</span>
              </h2>
              <p className="text-xs text-slate-500">
                Request immediate on-train housekeeping attendant for berth, washroom, and coach sanitation. An attendant will arrive within 10–15 minutes.
              </p>
            </div>

            {/* Cleaning Targets Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'washroom',
                  title: 'Washroom Sanitization & Odor Treatment',
                  hindi: 'शौचालय की सफाई एवं दुर्गंध निवारण',
                  desc: 'High-pressure washroom cleaning, chemical floor disinfection, and automatic air freshener refill.'
                },
                {
                  id: 'berth',
                  title: 'Berth & Floor Vacuum Sweeping',
                  hindi: 'बर्थ एवं फर्श की वैक्यूम सफाई',
                  desc: 'Cleaning passenger berth, wiping window sill, sweeping dust and food crumbs from compartment floor.'
                },
                {
                  id: 'dustbin',
                  title: 'Compartment Dustbin Emptying',
                  hindi: 'कचरा डिब्बा खाली करवाना',
                  desc: 'Clear overflowing compartment waste bins and replace with fresh biodegradable garbage liners.'
                },
                {
                  id: 'linen',
                  title: 'Clean Linen / Bedroll Replacement',
                  hindi: 'साफ चादर / कंबल बदलना',
                  desc: 'Replace soiled bedsheets, clean pillow covers or wool blanket in AC compartments.'
                },
                {
                  id: 'doorway',
                  title: 'Doorway & Gangway Area Mopping',
                  hindi: 'गलियारे व दरवाजे की सफाई',
                  desc: 'Clear mud and water accumulated at coach doorways and vestibules for passenger safety.'
                }
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCleaningTarget(c.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    cleaningTarget === c.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-600 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-ticket text-slate-900">{c.title}</span>
                    <input
                      type="radio"
                      checked={cleaningTarget === c.id}
                      onChange={() => setCleaningTarget(c.id)}
                      className="accent-emerald-600 w-4 h-4"
                    />
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mb-1">{c.hindi}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Cleaning Request Form */}
            <form
              onSubmit={handleRequestCleaning}
              className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coach Number</label>
                  <input
                    type="text"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berth / Seat</label>
                  <input
                    type="text"
                    value={berth}
                    onChange={(e) => setBerth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passenger Mobile</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Remarks / Note (Optional)</label>
                <input
                  type="text"
                  value={cleaningNote}
                  onChange={(e) => setCleaningNote(e.target.value)}
                  placeholder="e.g. Water spilled on berth floor, please bring mop urgently"
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>A secure 4-digit verification OTP will be generated. Share it with the attendant only after the work is completed.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase font-ticket shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Dispatch Coach Mitra Attendant / सफाई कर्मचारी बुलाएँ</span>
              </button>
            </form>
          </div>

          {/* Cleaning Guidelines Sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-slate-900 shadow-xs">
              <h3 className="text-sm font-bold font-ticket text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Coach Mitra Service Guarantee</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>15-Minute Turnaround:</strong> Attendant reports to your coach within 15 minutes of request registration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Safe Disinfection:</strong> Uses eco-friendly chemical disinfectants approved by Indian Railways health guidelines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Zero Tip Policy:</strong> OBHS service is 100% free of cost. Do not pay any tips or extra charges.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. REPAIR / मरम्मत (Carriage & Electrical Maintenance) */}
      {activeCategory === 'repair' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#0B2545] font-ticket flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#1D4ED8]" />
                <span>Coach Electrical & Mechanical Repair / डिब्बा मरम्मत सेवा</span>
              </h2>
              <p className="text-xs text-slate-500">
                Lodge immediate on-train maintenance requests for electrical sockets, air conditioning, plumbing, and berth fixtures.
              </p>
            </div>

            {/* Repair Issues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'socket',
                  title: 'Mobile / Laptop Charging Socket Inoperative',
                  hindi: 'चार्जिंग सॉकेट में करंट नहीं आ रहा',
                  desc: '230V AC socket tripped or switch broken at your berth.'
                },
                {
                  id: 'ac',
                  title: 'AC Temperature / Airflow Adjustment',
                  hindi: 'एसी का तापमान बहुत कम अथवा कूलिंग कम है',
                  desc: 'Compartment overcooling or blower airflow obstructed.'
                },
                {
                  id: 'light',
                  title: 'Reading Lamp / Mirror Light Defective',
                  hindi: 'रीडिंग लाइट अथवा शीशे की बत्ती खराब',
                  desc: 'LED reading light flickering, bulb fused, or loose fitting.'
                },
                {
                  id: 'blind',
                  title: 'Window Shutter / Blind Damaged or Jammed',
                  hindi: 'खिड़की का रोलर पर्दा अटका हुआ है',
                  desc: 'Roller curtain cord severed or window glass rattling.'
                },
                {
                  id: 'latch',
                  title: 'Upper Berth Ladder / Safety Latch Loose',
                  hindi: 'ऊपरी बर्थ की सीढ़ी या सेफ्टी लैच ढीला',
                  desc: 'Mechanical hinge or chain required for safe climbing.'
                },
                {
                  id: 'water',
                  title: 'Washroom Tap / Flush Water Supply Issue',
                  hindi: 'शौचालय नल अथवा फ्लश में पानी की कमी',
                  desc: 'Coach water tank booster pump or faucet valve choked.'
                }
              ].map((r) => (
                <div
                  key={r.id}
                  onClick={() => setRepairCategory(r.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    repairCategory === r.id
                      ? 'border-[#1D4ED8] bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-[#1D4ED8] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-ticket text-slate-900">{r.title}</span>
                    <input
                      type="radio"
                      checked={repairCategory === r.id}
                      onChange={() => setRepairCategory(r.id)}
                      className="accent-[#1D4ED8] w-4 h-4"
                    />
                  </div>
                  <div className="text-[11px] text-[#1D4ED8] font-semibold mb-1">{r.hindi}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{r.desc}</p>
                </div>
              ))}
            </div>

            {/* Repair Form */}
            <form
              onSubmit={handleRequestRepair}
              className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coach Number</label>
                  <input
                    type="text"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#1D4ED8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berth / Location</label>
                  <input
                    type="text"
                    value={berth}
                    onChange={(e) => setBerth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#1D4ED8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Priority</label>
                  <select
                    value={repairUrgency}
                    onChange={(e) => setRepairUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#1D4ED8] font-sans"
                  >
                    <option value="normal">Normal (Next Maintenance Station)</option>
                    <option value="urgent">Urgent (Immediate On-Board TXR)</option>
                    <option value="critical">Critical (Safety Hazard / Water Choke)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Details / Remarks</label>
                <textarea
                  rows={2}
                  value={repairDescription}
                  onChange={(e) => setRepairDescription(e.target.value)}
                  placeholder="Describe the exact fault so the technician brings the correct spare fuses, tools, or wiring."
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase font-ticket shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Notify On-Board Electrical / Mechanical Engineer</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-slate-900 shadow-xs">
              <h3 className="text-sm font-bold font-ticket text-[#1D4ED8] flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>On-Train Electrical Escort Details</span>
              </h3>
              <p className="text-xs text-slate-600">
                All Rajdhani, Shatabdi, Mail & Express trains are escorted by dedicated Carriage & Wagon (C&W) TXR staff and Senior Section Engineers.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-sans space-y-1 text-slate-700">
                <div>Escorting Base: <strong>Western Railway Mumbai Division</strong></div>
                <div>Duty Supervisor: <strong>SSE (Electrical) A. K. Verma</strong></div>
                <div>Emergency Intercom: <strong>Coach B1 / Guard Van</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLAINT / शिकायत (RailMadad 139 Live Grievance Redressal & Status Tracker) */}
      {activeCategory === 'complaint' && (
        <RailMadadTracker />
      )}

      {/* ACTIVE SERVICE REQUESTS & PNR TRACKING SECTION */}
      <div className="p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 bg-white text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-ticket text-[#0B2545]">
                Active Service Requests & PNR Tracking / आपके अनुरोध
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold">
                {activeRequests.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live status of food delivery, housekeeping dispatches, and grievance reference IDs linked to PNR {pnr}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => showNotification('Live status refreshed from CRIS PRS Central Server.')}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-sans text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0B2545]" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {activeRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-[#0B2545] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0B2545] px-2 py-0.5 rounded bg-white border border-slate-200">
                    {req.id}
                  </span>
                  <span className="text-xs text-slate-500">• {req.timestamp}</span>
                  <span className="text-xs text-slate-500">• {req.coachBerth}</span>
                </div>

                <div className="flex items-center gap-2">
                  {req.otp && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                      OTP: {req.otp}
                    </span>
                  )}
                  {req.eta && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-bold">
                      ETA: {req.eta}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg border font-mono font-bold text-xs bg-slate-100 text-slate-800 border-slate-300">
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-bold text-slate-900 font-ticket">{req.title}</h4>
                <p className="text-xs text-slate-600 font-sans mt-1">{req.statusDetails}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
