import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'motion/react';
import {
  Train,
  Gauge,
  MapPin,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

import {
  TrainDetail,
} from '../../data/trainData';

// ============================================================================
// 1. TypeScript Interfaces & Types
// ============================================================================

export type TrainArchetype =
  | 'NEXT_GEN_EMU'
  | 'FLAGSHIP_LHB'
  | 'STANDARD_EXPRESS'
  | 'DOUBLE_DECKER';

export type CoachClassType =
  | 'LOCO'
  | 'DTC'
  | 'EOG'
  | 'SLR'
  | 'PC'
  | '1A'
  | '2A'
  | '3A'
  | '3E'
  | 'CC'
  | 'EC'
  | 'EA'
  | 'SL'
  | 'GEN'
  | 'DD';

export interface CoachData {
  id: string;
  code: string; // e.g., 'DTC-1', 'C5', 'H1', 'B3', 'S7', 'D2', 'LOCO', 'PC', 'EOG'
  classType: CoachClassType;
  label: string; // e.g., 'Coach C5 - CC (Chair Car)'
  subText?: string;
  deckType?: 'single' | 'double';
  totalSeats: number;
  availableSeats: number;
  tatkalSeats: number;
  status: 'available' | 'filling_fast' | 'waitlist' | 'regret';
  racCount?: number;
  wlCount?: number;
  fare?: number;
  // Specific visual traits
  hasPantograph?: boolean;
  isEngine?: boolean;
}

export interface TrainRakeConfig {
  trainNumber: string;
  trainName: string;
  hindiName?: string;
  type: TrainArchetype;
  archetypeLabel: string;
  fromStation: { code: string; name: string };
  toStation: { code: string; name: string };
  departureTime: string;
  arrivalTime: string;
  totalDistanceKm: number;
  coaches: CoachData[];
}

export interface InteractiveRakeRailProps {
  currentTrain?: TrainRakeConfig;
  isFindTrainPage?: boolean;
  onSelectCoach?: (coach: CoachData) => void;
  onSelectTrain?: (train: TrainRakeConfig) => void;
  onBookClass?: (classCode: string) => void;
  className?: string;
}

// ============================================================================
// 2. Comprehensive Mock Data for 4 Authentic Archetype Trains
// ============================================================================

export const MOCK_TRAIN_ARCHETYPES: Record<TrainArchetype, TrainRakeConfig> = {
  // Category 1: Next-Gen EMU Reference (Vande Bharat 22436)
  NEXT_GEN_EMU: {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    hindiName: 'वंदे भारत एक्सप्रेस',
    type: 'NEXT_GEN_EMU',
    archetypeLabel: 'Next-Gen EMU / Train 18',
    fromStation: { code: 'NDLS', name: 'New Delhi' },
    toStation: { code: 'BSB', name: 'Varanasi Jn' },
    departureTime: '06:00',
    arrivalTime: '14:00',
    totalDistanceKm: 759,
    coaches: [
      {
        id: 'dtc-1',
        code: 'DTC-1',
        classType: 'DTC',
        label: 'DTC-1 (Lead Aerodynamic Cab)',
        subText: 'Driver Trailer Coach with Smart Glass Front & Dual Headlamps',
        totalSeats: 44,
        availableSeats: 12,
        tatkalSeats: 4,
        status: 'available',
        fare: 1750,
        isEngine: true,
      },
      {
        id: 'c1',
        code: 'C1',
        classType: 'CC',
        label: 'Coach C1 - CC (Chair Car)',
        subText: '180° Rotatable Plush Seats with Executive Trays',
        totalSeats: 78,
        availableSeats: 32,
        tatkalSeats: 8,
        status: 'available',
        fare: 1750,
      },
      {
        id: 'c2',
        code: 'C2',
        classType: 'CC',
        label: 'Coach C2 - CC (Chair Car)',
        subText: 'Regenerative Braking Coach with Mini Pantry Unit',
        totalSeats: 78,
        availableSeats: 18,
        tatkalSeats: 6,
        status: 'available',
        fare: 1750,
      },
      {
        id: 'c3',
        code: 'C3',
        classType: 'CC',
        label: 'Coach C3 - CC (Chair Car)',
        subText: 'Panoramic Anti-Glare Glazed Windows with Wi-Fi Infotainment',
        totalSeats: 78,
        availableSeats: 9,
        tatkalSeats: 2,
        status: 'filling_fast',
        racCount: 5,
        fare: 1750,
      },
      {
        id: 'c4',
        code: 'C4',
        classType: 'CC',
        label: 'Coach C4 - CC (Chair Car)',
        subText: 'Silent Air Spring Suspension Rake',
        totalSeats: 78,
        availableSeats: 15,
        tatkalSeats: 4,
        status: 'available',
        fare: 1750,
      },
      {
        id: 'c5',
        code: 'C5',
        classType: 'CC',
        label: 'Coach C5 - CC (Chair Car)',
        subText: 'Mid-Train Standard Chair Car with Vacuum Bio-Toilets',
        totalSeats: 78,
        availableSeats: 24,
        tatkalSeats: 5,
        status: 'available',
        fare: 1750,
      },
      {
        id: 'ec1',
        code: 'EC',
        classType: 'EC',
        label: 'Coach EC - Executive Class',
        subText: '2x2 Premium Leather Recliners with Direct Footrests',
        totalSeats: 52,
        availableSeats: 4,
        tatkalSeats: 1,
        status: 'filling_fast',
        fare: 3300,
        hasPantograph: true,
      },
      {
        id: 'c6',
        code: 'C6',
        classType: 'CC',
        label: 'Coach C6 - CC (Chair Car)',
        subText: 'Automatic Sliding Vestibule Doors',
        totalSeats: 78,
        availableSeats: 14,
        tatkalSeats: 3,
        status: 'available',
        fare: 1750,
      },
      {
        id: 'c7',
        code: 'C7',
        classType: 'CC',
        label: 'Coach C7 - CC (Chair Car)',
        subText: 'Catering Point Station with Hot Cases & Bottle Coolers',
        totalSeats: 78,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'waitlist',
        wlCount: 18,
        fare: 1750,
      },
      {
        id: 'dtc-2',
        code: 'DTC-2',
        classType: 'DTC',
        label: 'DTC-2 (Rear Driving Cab)',
        subText: 'Twin Red Tail Marker Lights & Active Pantograph',
        totalSeats: 44,
        availableSeats: 8,
        tatkalSeats: 2,
        status: 'available',
        fare: 1750,
        isEngine: true,
      },
    ],
  },

  // Category 2: Flagship Red-Silver LHB (Tejas Rajdhani 12951)
  FLAGSHIP_LHB: {
    trainNumber: '12951',
    trainName: 'Mumbai Tejas Rajdhani',
    hindiName: 'तेजस राजधानी एक्सप्रेस',
    type: 'FLAGSHIP_LHB',
    archetypeLabel: 'Flagship Red-Silver LHB',
    fromStation: { code: 'MMCT', name: 'Mumbai Central' },
    toStation: { code: 'NDLS', name: 'New Delhi' },
    departureTime: '17:00',
    arrivalTime: '08:32',
    totalDistanceKm: 1386,
    coaches: [
      {
        id: 'wap7-loco',
        code: 'WAP-7',
        classType: 'LOCO',
        label: 'Loco: WAP-7 6350 HP',
        subText: 'High-Speed 3-Phase AC Electric Locomotive in Crimson Livery',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
        isEngine: true,
        hasPantograph: true,
      },
      {
        id: 'eog-1',
        code: 'EOG-1',
        classType: 'EOG',
        label: 'EOG-1 (End-on Generation Van)',
        subText: 'Silent Hotel Load Converter & Guard Brake Compartment',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
      },
      {
        id: 'h1',
        code: 'H1',
        classType: '1A',
        label: 'Coach H1 - 1A (First AC)',
        subText: 'Lockable Private Coupes & 4-Berth Cabins with Attendant Call',
        totalSeats: 24,
        availableSeats: 2,
        tatkalSeats: 1,
        status: 'filling_fast',
        fare: 4850,
      },
      {
        id: 'a1',
        code: 'A1',
        classType: '2A',
        label: 'Coach A1 - AC 2-Tier',
        subText: 'Curtained Privacy Bays with Wide Panoramic Windows',
        totalSeats: 54,
        availableSeats: 6,
        tatkalSeats: 2,
        status: 'filling_fast',
        fare: 3120,
      },
      {
        id: 'a2',
        code: 'A2',
        classType: '2A',
        label: 'Coach A2 - AC 2-Tier',
        subText: 'Spacious Upper/Lower Berths with Reading Lamps',
        totalSeats: 54,
        availableSeats: 11,
        tatkalSeats: 3,
        status: 'available',
        fare: 3120,
      },
      {
        id: 'b1',
        code: 'B1',
        classType: '3A',
        label: 'Coach B1 - AC 3-Tier',
        subText: 'LHB Stainless Steel Microclimate Controlled Rake',
        totalSeats: 72,
        availableSeats: 28,
        tatkalSeats: 9,
        status: 'available',
        fare: 2280,
      },
      {
        id: 'b2',
        code: 'B2',
        classType: '3A',
        label: 'Coach B2 - AC 3-Tier',
        subText: 'Centralised Air Conditioned Coach with Individual AC Vents',
        totalSeats: 72,
        availableSeats: 19,
        tatkalSeats: 4,
        status: 'available',
        fare: 2280,
      },
      {
        id: 'b3',
        code: 'B3',
        classType: '3A',
        label: 'Coach B3 - AC 3-Tier',
        subText: 'German-Designed FIAT Bogie with Hydraulic Dampers',
        totalSeats: 72,
        availableSeats: 8,
        tatkalSeats: 2,
        status: 'filling_fast',
        racCount: 4,
        fare: 2280,
      },
      {
        id: 'pc',
        code: 'PC',
        classType: 'PC',
        label: 'Pantry Car (Hot Kitchen)',
        subText: 'Full Stainless Steel Induction Catering Galley with FSSAI Chefs',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
      },
      {
        id: 'b4',
        code: 'B4',
        classType: '3A',
        label: 'Coach B4 - AC 3-Tier',
        subText: 'Whisper-Quiet Sound Dampening Shell',
        totalSeats: 72,
        availableSeats: 21,
        tatkalSeats: 6,
        status: 'available',
        fare: 2280,
      },
      {
        id: 'b5',
        code: 'B5',
        classType: '3A',
        label: 'Coach B5 - AC 3-Tier',
        subText: 'LHB Anti-Telescopic Crashworthy Rake',
        totalSeats: 72,
        availableSeats: 14,
        tatkalSeats: 3,
        status: 'available',
        fare: 2280,
      },
      {
        id: 'eog-2',
        code: 'EOG-2',
        classType: 'EOG',
        label: 'EOG-2 (Rear Generator)',
        subText: 'Rear Red Warning Marker with Audio Horn',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
      },
    ],
  },

  // Category 3: Standard Superfast & Mail/Express (Punjab Mail 12137)
  STANDARD_EXPRESS: {
    trainNumber: '12137',
    trainName: 'Punjab Mail Superfast',
    hindiName: 'पंजाब मेल सुपरफास्ट',
    type: 'STANDARD_EXPRESS',
    archetypeLabel: 'Standard Superfast & Mail/Express',
    fromStation: { code: 'CSMT', name: 'Mumbai CSMT' },
    toStation: { code: 'FZR', name: 'Firozpur Cantt' },
    departureTime: '19:35',
    arrivalTime: '05:10',
    totalDistanceKm: 1930,
    coaches: [
      {
        id: 'loco-wap4',
        code: 'WAP-4',
        classType: 'LOCO',
        label: 'Loco: Classic Maroon WAP-4',
        subText: 'Heavy Haul Electric Loco with Distinctive Yellow Striping',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
        isEngine: true,
        hasPantograph: true,
      },
      {
        id: 'slr-1',
        code: 'SLR-1',
        classType: 'SLR',
        label: 'SLR-1 (Seating + Luggage)',
        subText: 'Divyangjan Friendly Toilet & Guard Compartment',
        totalSeats: 36,
        availableSeats: 14,
        tatkalSeats: 0,
        status: 'available',
        fare: 285,
      },
      {
        id: 'gen-1',
        code: 'GS-1',
        classType: 'GEN',
        label: 'General Unreserved (GS-1)',
        subText: 'Open Ticket Booking Available at UTS Counter',
        totalSeats: 100,
        availableSeats: 45,
        tatkalSeats: 0,
        status: 'available',
        fare: 285,
      },
      {
        id: 's1',
        code: 'S1',
        classType: 'SL',
        label: 'Coach S1 - SL (Sleeper Class)',
        subText: 'Classic Open-Breeze Sleeper Coach with Padded Berths',
        totalSeats: 80,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'waitlist',
        wlCount: 42,
        fare: 645,
      },
      {
        id: 's2',
        code: 'S2',
        classType: 'SL',
        label: 'Coach S2 - SL (Sleeper Class)',
        subText: '8-Berth Open Bay Configuration (LB, MB, UB, SL, SU)',
        totalSeats: 80,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'waitlist',
        wlCount: 28,
        fare: 645,
      },
      {
        id: 's7',
        code: 'S7',
        classType: 'SL',
        label: 'Coach S7 - SL (Sleeper Class)',
        subText: 'Mid-Sleeper Coach with Universal Charging Sockets',
        totalSeats: 80,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'filling_fast',
        racCount: 14,
        wlCount: 3,
        fare: 645,
      },
      {
        id: 'b1-std',
        code: 'B1',
        classType: '3A',
        label: 'Coach B1 - AC 3-Tier',
        subText: 'Indian Railways Blue Air-Conditioned Sleeper Car',
        totalSeats: 64,
        availableSeats: 12,
        tatkalSeats: 4,
        status: 'available',
        fare: 1720,
      },
      {
        id: 'b2-std',
        code: 'B2',
        classType: '3A',
        label: 'Coach B2 - AC 3-Tier',
        subText: 'Pillow, Linen & Blanket Provided on Journey',
        totalSeats: 64,
        availableSeats: 6,
        tatkalSeats: 2,
        status: 'filling_fast',
        fare: 1720,
      },
      {
        id: 'a1-std',
        code: 'A1',
        classType: '2A',
        label: 'Coach A1 - AC 2-Tier',
        subText: 'Wide Curtained Berths with Individual Reading Lights',
        totalSeats: 48,
        availableSeats: 3,
        tatkalSeats: 1,
        status: 'filling_fast',
        fare: 2480,
      },
      {
        id: 'slr-2',
        code: 'SLR-2',
        classType: 'SLR',
        label: 'SLR-2 (Rear Luggage Brake)',
        subText: 'Rear Red Tail Lamp with Reflective Safety Board',
        totalSeats: 36,
        availableSeats: 9,
        tatkalSeats: 0,
        status: 'available',
        fare: 285,
      },
    ],
  },

  // Category 4: High-Density & Double Decker (Specialized 12931)
  DOUBLE_DECKER: {
    trainNumber: '12931',
    trainName: 'Ahmedabad AC Double Decker',
    hindiName: 'अहमदाबाद डबल डेकर एक्सप्रेस',
    type: 'DOUBLE_DECKER',
    archetypeLabel: 'High-Density Double Decker',
    fromStation: { code: 'MMCT', name: 'Mumbai Central' },
    toStation: { code: 'ADI', name: 'Ahmedabad Jn' },
    departureTime: '14:20',
    arrivalTime: '21:40',
    totalDistanceKm: 493,
    coaches: [
      {
        id: 'wap5-yellow',
        code: 'WAP-5',
        classType: 'LOCO',
        label: 'Loco: High-Speed Yellow WAP-5',
        subText: '5450 HP Bo-Bo High Acceleration Aerodynamic Locomotive',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
        isEngine: true,
        hasPantograph: true,
      },
      {
        id: 'eog-dd-1',
        code: 'EOG-1',
        classType: 'EOG',
        label: 'EOG-1 Generator Car',
        subText: 'High-Output Auxiliary Power for Heavy Twin-Deck Chillers',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
      },
      {
        id: 'd1',
        code: 'D1',
        classType: 'DD',
        deckType: 'double',
        label: 'Coach D1 - DD (AC Double Decker)',
        subText: 'Split Mezzanine Level: Upper Vista Deck & Lower Deck',
        totalSeats: 120,
        availableSeats: 18,
        tatkalSeats: 6,
        status: 'available',
        fare: 680,
      },
      {
        id: 'd2',
        code: 'D2',
        classType: 'DD',
        deckType: 'double',
        label: 'Coach D2 - DD (AC Double Decker)',
        subText: 'High-Capacity 120-Seat Bi-Level Stainless Steel Car',
        totalSeats: 120,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'regret',
        wlCount: 45,
        fare: 680,
      },
      {
        id: 'd3',
        code: 'D3',
        classType: 'DD',
        deckType: 'double',
        label: 'Coach D3 - DD (AC Double Decker)',
        subText: 'Upper Deck Panoramic View Over Looking Western Ghats',
        totalSeats: 120,
        availableSeats: 34,
        tatkalSeats: 10,
        status: 'available',
        fare: 680,
      },
      {
        id: 'd4',
        code: 'D4',
        classType: 'DD',
        deckType: 'double',
        label: 'Coach D4 - DD (AC Double Decker)',
        subText: 'Lower Deck High-Stability Quiet Zone Seats',
        totalSeats: 120,
        availableSeats: 8,
        tatkalSeats: 2,
        status: 'filling_fast',
        racCount: 8,
        fare: 680,
      },
      {
        id: 'd5',
        code: 'D5',
        classType: 'DD',
        deckType: 'double',
        label: 'Coach D5 - DD (AC Double Decker)',
        subText: 'Reclining Ergonomic Velvet Upholstery with Snack Trays',
        totalSeats: 120,
        availableSeats: 29,
        tatkalSeats: 8,
        status: 'available',
        fare: 680,
      },
      {
        id: 'eog-dd-2',
        code: 'EOG-2',
        classType: 'EOG',
        label: 'EOG-2 Generator Car',
        subText: 'Rear Dual AC Chiller & Power Plant',
        totalSeats: 0,
        availableSeats: 0,
        tatkalSeats: 0,
        status: 'available',
      },
    ],
  },
};

// ============================================================================
// 3. Archetype Visual SVG Renderers (High Graphic Precision)
// ============================================================================

interface CoachRenderProps {
  coach: CoachData;
  archetype: TrainArchetype;
  height: number;
  width: number;
  isHovered: boolean;
  index: number;
  totalCount: number;
}

/**
 * 1. Category 1: Next-Gen EMU Reference (Aerodynamic Vande Bharat/Amrit Bharat)
 */
export const NextGenEmuCoachSVG: React.FC<CoachRenderProps> = ({
  coach,
  height,
  width,
  isHovered,
  index,
  totalCount,
}) => {
  const isLead = index === 0;
  const isRear = index === totalCount - 1;
  const isCab = isLead || isRear;
  const isEC = coach.classType === 'EC' || coach.classType === 'EA';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none drop-shadow-xs"
    >
      <defs>
        {/* Vande Bharat White/Silver Body Gradient */}
        <linearGradient id="vb-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="12%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="88%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Vande Bharat Blue Window Ribbon */}
        <linearGradient id="vb-blue-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="20%" stopColor="#1E3A8A" />
          <stop offset="80%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Executive Gold Accent Gradient */}
        <linearGradient id="vb-ec-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Streamlined Glass Nose Gradient */}
        <linearGradient id="vb-nose-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="70%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Bogie Wheels Underframe */}
      <rect x="2" y="3" width="3" height={height - 6} rx="1" fill="#1E293B" />
      <rect x={width - 5} y="3" width="3" height={height - 6} rx="1" fill="#1E293B" />

      {/* Coach Main Shell */}
      {isLead ? (
        // Aerodynamic Bullet Nose (Pointed Upwards)
        <path
          d={`M ${width / 2} 1
             C ${width - 2} 4, ${width - 2} 14, ${width - 2} ${height - 2}
             L 2 ${height - 2}
             C 2 14, 2 4, ${width / 2} 1 Z`}
          fill="url(#vb-body)"
          stroke={isHovered ? '#38BDF8' : '#0F172A'}
          strokeWidth={isHovered ? 1.5 : 0.8}
        />
      ) : isRear ? (
        // Rear Aerodynamic Nose (Pointed Downwards)
        <path
          d={`M 2 2
             L ${width - 2} 2
             C ${width - 2} ${height - 14}, ${width - 2} ${height - 4}, ${width / 2} ${height - 1}
             C 2 ${height - 4}, 2 ${height - 14}, 2 2 Z`}
          fill="url(#vb-body)"
          stroke={isHovered ? '#38BDF8' : '#0F172A'}
          strokeWidth={isHovered ? 1.5 : 0.8}
        />
      ) : (
        // Standard Streamlined Intermediate Coach
        <rect
          x="2"
          y="1"
          width={width - 4}
          height={height - 2}
          rx="3"
          fill="url(#vb-body)"
          stroke={isHovered ? '#38BDF8' : '#334155'}
          strokeWidth={isHovered ? 1.5 : 0.8}
        />
      )}

      {/* Signature Deep Blue Ribbon / Livery along the side */}
      <rect
        x="6"
        y={isLead ? 12 : 3}
        width={width - 12}
        height={height - (isCab ? 16 : 6)}
        rx="2"
        fill={isEC ? 'url(#vb-ec-gold)' : 'url(#vb-blue-ribbon)'}
      />

      {/* Panoramic Window Strip & Seat Silhouettes */}
      {height >= 26 && (
        <g opacity="0.9">
          {/* Row of panoramic window bays */}
          {Array.from({ length: Math.max(3, Math.min(6, Math.floor(height / 7))) }).map(
            (_, wIdx) => {
              const winY = (isLead ? 14 : 5) + wIdx * (height >= 34 ? 6 : 5);
              return (
                <rect
                  key={wIdx}
                  x="8"
                  y={winY}
                  width={width - 16}
                  height={height >= 34 ? 3.5 : 2.5}
                  rx="0.8"
                  fill="#E0F2FE"
                  opacity="0.85"
                />
              );
            }
          )}
        </g>
      )}

      {/* Windshield / Cab Glass for Engine units */}
      {isLead && (
        <path
          d={`M ${width / 2} 3
             C ${width - 6} 6, ${width - 6} 11, ${width / 2} 13
             C 6 11, 6 6, ${width / 2} 3 Z`}
          fill="url(#vb-nose-glass)"
        />
      )}

      {/* Headlights / Tail Markers */}
      {isLead && (
        <g>
          <circle cx="8" cy="8" r="1.5" fill="#FEF08A" className="animate-pulse" />
          <circle cx={width - 8} cy="8" r="1.5" fill="#FEF08A" className="animate-pulse" />
        </g>
      )}
      {isRear && (
        <g>
          <circle cx="8" cy={height - 7} r="1.5" fill="#EF4444" />
          <circle cx={width - 8} cy={height - 7} r="1.5" fill="#EF4444" />
        </g>
      )}

      {/* Roof Pantograph (if coach has one) */}
      {(coach.hasPantograph || (isRear && height >= 28)) && (
        <g stroke="#94A3B8" strokeWidth="0.8" opacity="0.75">
          <line x1={width / 2 - 4} y1={height / 2 - 3} x2={width / 2 + 4} y2={height / 2 - 3} />
          <line x1={width / 2} y1={height / 2 - 3} x2={width / 2} y2={height / 2 + 3} />
        </g>
      )}

      {/* Center Class Label Text */}
      <text
        x={width / 2}
        y={height / 2 + 2}
        textAnchor="middle"
        fontSize={height >= 30 ? 7 : 6}
        fontWeight="800"
        fontFamily="sans-serif"
        fill={isEC ? '#FEF3C7' : '#FFFFFF'}
        style={{ letterSpacing: '-0.5px' }}
      >
        {coach.code}
      </text>
    </svg>
  );
};

/**
 * 2. Category 2: Flagship Red-Silver LHB (Tejas / Rajdhani / Shatabdi WAP-7 Loco-Hauled)
 */
export const FlagshipLhbCoachSVG: React.FC<CoachRenderProps> = ({
  coach,
  height,
  width,
  isHovered,
  index,
}) => {
  const isLoco = coach.classType === 'LOCO';
  const isEOG = coach.classType === 'EOG';
  const isPantry = coach.classType === 'PC';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none drop-shadow-xs"
    >
      <defs>
        {/* Crimson Red LHB Body Gradient */}
        <linearGradient id="lhb-red" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="15%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="85%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>

        {/* Silver/Grey Fluted Stainless Steel Band */}
        <linearGradient id="lhb-silver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="25%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* WAP-7 Locomotive Livery */}
        <linearGradient id="wap7-loco-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="30%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>

      {/* Bogies / Underframe */}
      <rect x="2" y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />
      <rect x={width - 4.5} y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />

      {isLoco ? (
        // WAP-7 High-Horsepower Electric Locomotive
        <g>
          {/* Main Locomotive Body with Cab Bevel */}
          <path
            d={`M 4 2
               L ${width - 4} 2
               L ${width - 2} 7
               L ${width - 2} ${height - 7}
               L ${width - 4} ${height - 2}
               L 4 ${height - 2}
               L 2 ${height - 7}
               L 2 7 Z`}
            fill="url(#wap7-loco-grad)"
            stroke={isHovered ? '#F59E0B' : '#0F172A'}
            strokeWidth={isHovered ? 1.5 : 1}
          />

          {/* Roof Machinery & Diamond Pantograph */}
          <rect x={width / 2 - 3} y="6" width="6" height={height - 12} rx="1" fill="#334155" opacity="0.6" />
          <line
            x1={width / 2 - 5}
            y1={height / 2}
            x2={width / 2 + 5}
            y2={height / 2}
            stroke="#EF4444"
            strokeWidth="1.2"
          />
          <circle cx={width / 2} cy={height / 2} r="2" fill="#F59E0B" />

          {/* Dual Front LED Projectors */}
          <circle cx={width / 2 - 4} cy="4" r="1.5" fill="#FEF08A" />
          <circle cx={width / 2 + 4} cy="4" r="1.5" fill="#FEF08A" />
        </g>
      ) : (
        // LHB Stainless Steel Coach with Red-Silver Livery
        <g>
          {/* Outer Crimson Coach Box */}
          <rect
            x="2"
            y="1"
            width={width - 4}
            height={height - 2}
            rx="2.5"
            fill="url(#lhb-red)"
            stroke={isHovered ? '#FACC15' : '#1E293B'}
            strokeWidth={isHovered ? 1.5 : 0.8}
          />

          {/* Center Silver Fluted Waistband */}
          <rect
            x="6"
            y="3"
            width={width - 12}
            height={height - 6}
            rx="1.5"
            fill="url(#lhb-silver)"
          />

          {/* Tinted Windows */}
          {height >= 26 && (
            <g>
              {Array.from({ length: Math.max(3, Math.min(5, Math.floor(height / 7))) }).map(
                (_, wIdx) => {
                  const winY = 5 + wIdx * (height >= 34 ? 6 : 5);
                  return (
                    <rect
                      key={wIdx}
                      x="8"
                      y={winY}
                      width={width - 16}
                      height={height >= 34 ? 3.5 : 2.5}
                      rx="0.5"
                      fill="#0F172A"
                      opacity="0.8"
                    />
                  );
                }
              )}
            </g>
          )}

          {/* Yellow/Black Chevron Hazard Stripes at Vestibule Ends */}
          <g opacity="0.9">
            <rect x="3" y="2" width="2" height="4" fill="#FACC15" />
            <rect x="3" y={height - 6} width="2" height="4" fill="#FACC15" />
            <rect x={width - 5} y="2" width="2" height="4" fill="#FACC15" />
            <rect x={width - 5} y={height - 6} width="2" height="4" fill="#FACC15" />
          </g>
        </g>
      )}

      {/* Coach Code Text */}
      <text
        x={width / 2}
        y={height / 2 + 2}
        textAnchor="middle"
        fontSize={height >= 30 ? 7 : 6}
        fontWeight="800"
        fontFamily="sans-serif"
        fill={isLoco ? '#0F172A' : '#7F1D1D'}
        style={{ letterSpacing: '-0.3px' }}
      >
        {coach.code}
      </text>
    </svg>
  );
};

/**
 * 3. Category 3: Standard Superfast & Mail/Express (Classic IR Blue/Maroon ICF/LHB)
 */
export const StandardExpressCoachSVG: React.FC<CoachRenderProps> = ({
  coach,
  height,
  width,
  isHovered,
}) => {
  const isLoco = coach.classType === 'LOCO';
  const isSleeper = coach.classType === 'SL';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none drop-shadow-xs"
    >
      <defs>
        {/* Classic Indian Railways Deep Blue */}
        <linearGradient id="std-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="15%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="85%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Classic Maroon WAP-4 Locomotive */}
        <linearGradient id="maroon-loco" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#581C87" />
          <stop offset="30%" stopColor="#831843" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#831843" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
      </defs>

      {/* Underframe */}
      <rect x="2" y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />
      <rect x={width - 4.5} y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />

      {isLoco ? (
        // Maroon / Red-Stripe Classic Locomotive
        <g>
          <rect
            x="2"
            y="2"
            width={width - 4}
            height={height - 4}
            rx="3"
            fill="url(#maroon-loco)"
            stroke={isHovered ? '#FBBF24' : '#0F172A'}
            strokeWidth={isHovered ? 1.5 : 1}
          />
          {/* Yellow Warning Chevron V-stripe */}
          <polygon
            points={`${width / 2},2 ${width - 5},8 ${width / 2},12 5,8`}
            fill="#FACC15"
            opacity="0.9"
          />
          <circle cx={width / 2} cy="4" r="1.6" fill="#FEF08A" />
        </g>
      ) : (
        // Classic Utkrisht / Standard Deep Blue Coach
        <g>
          <rect
            x="2"
            y="1"
            width={width - 4}
            height={height - 2}
            rx="2.5"
            fill="url(#std-blue)"
            stroke={isHovered ? '#60A5FA' : '#0F172A'}
            strokeWidth={isHovered ? 1.5 : 0.8}
          />

          {/* Signature Twin White/Cream Longitudinal Stripes */}
          <line x1="4" y1="4" x2={width - 4} y2="4" stroke="#FEF08A" strokeWidth="0.8" opacity="0.8" />
          <line
            x1="4"
            y1={height - 4}
            x2={width - 4}
            y2={height - 4}
            stroke="#FEF08A"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* Sleeper Window Bars or Glass */}
          {height >= 26 && (
            <g>
              {Array.from({ length: Math.max(3, Math.min(5, Math.floor(height / 7))) }).map(
                (_, wIdx) => {
                  const winY = 6 + wIdx * (height >= 34 ? 6 : 5);
                  return (
                    <rect
                      key={wIdx}
                      x="7"
                      y={winY}
                      width={width - 14}
                      height={height >= 34 ? 3.5 : 2.5}
                      rx="0.5"
                      fill="#93C5FD"
                      opacity="0.75"
                    />
                  );
                }
              )}
            </g>
          )}
        </g>
      )}

      {/* Code Badge Text */}
      <text
        x={width / 2}
        y={height / 2 + 2}
        textAnchor="middle"
        fontSize={height >= 30 ? 7 : 6}
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#FFFFFF"
      >
        {coach.code}
      </text>
    </svg>
  );
};

/**
 * 4. Category 4: High-Density & Double Decker (Bi-Level Yellow/Orange)
 */
export const DoubleDeckerCoachSVG: React.FC<CoachRenderProps> = ({
  coach,
  height,
  width,
  isHovered,
}) => {
  const isLoco = coach.classType === 'LOCO';
  const isBiLevel = coach.deckType === 'double' || coach.classType === 'DD';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none drop-shadow-xs"
    >
      <defs>
        {/* Double Decker High-Visibility Yellow/Orange Gradient */}
        <linearGradient id="dd-yellow-orange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="15%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="85%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="dd-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>

      {/* Underframe Wheels */}
      <rect x="2" y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />
      <rect x={width - 4.5} y="2" width="2.5" height={height - 4} rx="1" fill="#0F172A" />

      {isLoco ? (
        // Bright Yellow & Orange WAP-5 High-Speed Loco
        <g>
          <rect
            x="2"
            y="2"
            width={width - 4}
            height={height - 4}
            rx="3"
            fill="url(#dd-yellow-orange)"
            stroke={isHovered ? '#FFFFFF' : '#0F172A'}
            strokeWidth={isHovered ? 1.5 : 1}
          />
          <polygon
            points={`${width / 2},2 ${width - 4},7 ${width / 2},12 4,7`}
            fill="#EA580C"
          />
          <circle cx={width / 2} cy="4" r="1.6" fill="#FEF08A" />
        </g>
      ) : (
        // Bi-Level Double Decker Coach with Dual Tier Window Strips
        <g>
          {/* Taller, wider profile coach silhouette */}
          <rect
            x="1.5"
            y="1"
            width={width - 3}
            height={height - 2}
            rx="2.5"
            fill="url(#dd-yellow-orange)"
            stroke={isHovered ? '#FFFFFF' : '#78350F'}
            strokeWidth={isHovered ? 1.5 : 0.8}
          />

          {/* Middle Red/Orange Waistband divider between upper and lower decks */}
          <rect
            x="3"
            y={height / 2 - 2}
            width={width - 6}
            height="4"
            fill="url(#dd-stripe)"
            rx="1"
          />

          {/* DUAL-TIER WINDOWS (UPPER DECK + LOWER DECK) */}
          {height >= 26 && isBiLevel ? (
            <g>
              {/* Upper Deck Window Strip (Left side) */}
              <rect
                x="5"
                y="4"
                width={width / 2 - 6}
                height={height / 2 - 7}
                rx="1"
                fill="#0F172A"
                opacity="0.85"
              />
              {/* Upper Deck Window Strip (Right side) */}
              <rect
                x={width / 2 + 1}
                y="4"
                width={width / 2 - 6}
                height={height / 2 - 7}
                rx="1"
                fill="#0F172A"
                opacity="0.85"
              />

              {/* Lower Deck Window Strip (Left side) */}
              <rect
                x="5"
                y={height / 2 + 3}
                width={width / 2 - 6}
                height={height / 2 - 7}
                rx="1"
                fill="#0F172A"
                opacity="0.85"
              />
              {/* Lower Deck Window Strip (Right side) */}
              <rect
                x={width / 2 + 1}
                y={height / 2 + 3}
                width={width / 2 - 6}
                height={height / 2 - 7}
                rx="1"
                fill="#0F172A"
                opacity="0.85"
              />
            </g>
          ) : (
            // Standard single tier if height is condensed
            <rect
              x="5"
              y="4"
              width={width - 10}
              height={height - 8}
              rx="1"
              fill="#0F172A"
              opacity="0.8"
            />
          )}
        </g>
      )}

      {/* Code Text Badge */}
      <text
        x={width / 2}
        y={height / 2 + 2}
        textAnchor="middle"
        fontSize={height >= 30 ? 7 : 6}
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#FFFFFF"
      >
        {coach.code}
      </text>
    </svg>
  );
};

// ============================================================================
// 4. Coach High-Density HUD Tooltip Component (Matching Reference Graphic)
// ============================================================================

interface CoachHudTooltipProps {
  coach: CoachData;
  archetype: TrainArchetype;
  train: TrainRakeConfig;
  onBookClass?: (classCode: string) => void;
  onClose?: () => void;
}

export const CoachHudTooltip: React.FC<CoachHudTooltipProps> = ({
  coach,
  archetype,
  train,
  onBookClass,
}) => {
  // Determine status color styling
  const statusInfo = useMemo(() => {
    switch (coach.status) {
      case 'available':
        return {
          badge: 'Available',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
          text: `Available: ${coach.availableSeats} (Tatkal: ${coach.tatkalSeats})`,
          buttonText: 'View Seats & Book',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        };
      case 'filling_fast':
        return {
          badge: 'Filling Fast',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dotClass: 'bg-amber-400',
          text: coach.racCount
            ? `RAC: ${coach.racCount} / Available: ${coach.availableSeats}`
            : `Filling Fast: ${coach.availableSeats} left`,
          buttonText: 'Reserve Available Berth',
          buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      case 'waitlist':
        return {
          badge: 'Waitlist / RAC',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dotClass: 'bg-rose-400',
          text: `WL ${coach.wlCount || 12} / RAC: ${coach.racCount || 4}`,
          buttonText: 'Join FairFlow Pool',
          buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
        };
      case 'regret':
      default:
        return {
          badge: 'REGRET / Closed',
          badgeClass: 'bg-red-950 text-red-400 border-red-800',
          dotClass: 'bg-red-500',
          text: `WL ${coach.wlCount || 45} (Tatkal Closed)`,
          buttonText: 'Check Alternate Train',
          buttonClass: 'bg-slate-700 hover:bg-slate-600 text-white',
        };
    }
  }, [coach]);

  // Mini Seat Layout Simulator based on Coach Class
  const renderSeatMapGraphic = () => {
    // 1. Double Decker Layout
    if (coach.deckType === 'double' || coach.classType === 'DD') {
      return (
        <div className="space-y-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1 flex items-center justify-between">
              <span>Upper Deck</span>
              <span className="text-slate-400">60 Seats</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`u-${i}`}
                  className={`h-2.5 rounded-xs ${
                    i % 4 === 0 ? 'bg-rose-500/80' : i % 3 === 0 ? 'bg-amber-400/80' : 'bg-emerald-400/80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-1.5">
            <div className="text-[10px] font-mono uppercase text-blue-400 font-bold mb-1 flex items-center justify-between">
              <span>Lower Deck</span>
              <span className="text-slate-400">60 Seats</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`l-${i}`}
                  className={`h-2.5 rounded-xs ${
                    i % 2 === 0 ? 'bg-emerald-400/80' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 2. First AC (1A) Coupe Layout
    if (coach.classType === '1A') {
      return (
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono text-purple-300 font-bold uppercase flex justify-between">
            <span>Private Coupe & Cabin Map</span>
            <span>24 Berths</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg border border-purple-800/50 bg-purple-950/30 text-center">
              <div className="text-[9px] text-slate-400">Coupe A</div>
              <div className="text-[11px] font-bold text-emerald-300">Lower Berth 1</div>
              <div className="text-[11px] font-bold text-emerald-300">Upper Berth 2</div>
            </div>
            <div className="p-2 rounded-lg border border-purple-800/50 bg-purple-950/30 text-center">
              <div className="text-[9px] text-slate-400">Cabin B</div>
              <div className="text-[11px] font-bold text-slate-400">Lower Berth 3 (Booked)</div>
              <div className="text-[11px] font-bold text-emerald-300">Upper Berth 4</div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Sleeper Class (SL) 8-Berth Open Bay with occupancy gauge
    if (coach.classType === 'SL') {
      const fillPercent = coach.status === 'available' ? 30 : coach.status === 'filling_fast' ? 75 : 98;
      return (
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-1 text-[11px]">
            <div className="text-[10px] font-mono text-amber-300 font-bold uppercase">
              Sleeper Bay Configuration
            </div>
            <div className="text-slate-300">
              • Lower, Middle & Upper: <span className="text-emerald-400 font-semibold">Available</span>
            </div>
            <div className="text-slate-300">
              • Side Lower (RAC): <span className="text-amber-400 font-semibold">14 Allocated</span>
            </div>
          </div>
          {/* Occupancy circular gauge */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#334155"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke={coach.status === 'available' ? '#10B981' : coach.status === 'filling_fast' ? '#F59E0B' : '#EF4444'}
                strokeWidth="4"
                fill="none"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * fillPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white">
              {fillPercent}%
            </div>
          </div>
        </div>
      );
    }

    // 4. Default: Standard Chair Car (CC / 2S / 3A) Grid Layout
    return (
      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
        <div className="text-[10px] font-mono text-sky-300 font-bold uppercase flex justify-between">
          <span>Seating Grid Layout (2x3 Matrix)</span>
          <span>{coach.totalSeats} Seats</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-xs flex items-center justify-center text-[7px] font-mono ${
                i === 7 || i === 12
                  ? 'bg-rose-500/80 text-white'
                  : i % 4 === 0
                  ? 'bg-amber-400/80 text-slate-950'
                  : 'bg-emerald-400/80 text-slate-950'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-400" /> Avail
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-400" /> Tatkal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500" /> Booked
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-72 sm:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-4 text-white space-y-3 font-sans"
    >
      {/* HUD Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono">
              {coach.code}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {train.trainNumber} • {train.trainName}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1 leading-snug">
            {coach.label}
          </h4>
          {coach.subText && (
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
              {coach.subText}
            </p>
          )}
        </div>

        {coach.fare && (
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase font-mono text-slate-400">Base Fare</div>
            <div className="text-base font-bold text-amber-400 font-mono">₹{coach.fare}</div>
          </div>
        )}
      </div>

      {/* Occupancy Status Badge & Quota Breakdown */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotClass} animate-pulse`} />
          <span className="font-semibold text-white">{statusInfo.text}</span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase font-mono ${statusInfo.badgeClass}`}
        >
          {statusInfo.badge}
        </span>
      </div>

      {/* Interactive Miniature Seating Graphic */}
      {renderSeatMapGraphic()}

      {/* Quota Breakdown Table */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">General Quota:</span>
          <span className="font-mono font-bold text-emerald-400">
            {coach.availableSeats > 0 ? `${coach.availableSeats} Berths` : 'WL / RAC'}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400">Tatkal Quota:</span>
          <span className="font-mono font-bold text-amber-400">
            {coach.tatkalSeats > 0 ? `${coach.tatkalSeats} Berths` : 'Closed'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {coach.classType !== 'LOCO' && coach.classType !== 'EOG' && (
        <button
          onClick={() => onBookClass?.(coach.classType)}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${statusInfo.buttonClass}`}
        >
          <span>{statusInfo.buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

// ============================================================================
// 5. Dynamic Rake Config Generator from Real Train Data
// ============================================================================

export function createRakeConfigFromTrainDetail(train: TrainDetail): TrainRakeConfig {
  let arch: TrainArchetype = 'STANDARD_EXPRESS';
  const nameLower = (train.name || '').toLowerCase();

  if (train.type === 'Vande Bharat') {
    arch = 'NEXT_GEN_EMU';
  } else if (nameLower.includes('double decker')) {
    arch = 'DOUBLE_DECKER';
  } else if (
    ['Rajdhani', 'Tejas', 'Shatabdi', 'Duronto', 'Gatimaan'].includes(train.type)
  ) {
    arch = 'FLAGSHIP_LHB';
  } else {
    arch = 'STANDARD_EXPRESS';
  }

  // Parse real class availability from train.classes
  const getClassAvailability = (classCode: string) => {
    const found = train.classes?.find((c) => c.code === classCode);
    if (!found) {
      return {
        available: 12,
        tatkal: 4,
        fare: 650,
        status: 'available' as const,
        wl: 0,
        rac: 0,
      };
    }
    const quotaText = found.quotaStatus || '';
    const numMatch = quotaText.match(/\d+/);
    const count = numMatch ? parseInt(numMatch[0], 10) : 18;
    const isWl = quotaText.toUpperCase().includes('WL');
    const isRac = quotaText.toUpperCase().includes('RAC');

    let status: 'available' | 'filling_fast' | 'waitlist' | 'regret' = 'available';
    if (isWl) {
      status = count > 30 ? 'regret' : 'waitlist';
    } else if (isRac) {
      status = 'filling_fast';
    } else if (count < 10) {
      status = 'filling_fast';
    }

    return {
      available: isWl ? 0 : count,
      tatkal: Math.max(0, Math.floor(count * 0.25)),
      fare: found.baseFare || 650,
      status,
      wl: isWl ? count : 0,
      rac: isRac ? count : 0,
    };
  };

  const coaches: CoachData[] = [];

  if (arch === 'NEXT_GEN_EMU') {
    const ccAvail = getClassAvailability('CC');
    const ecAvail = getClassAvailability('EC');

    // DTC-1
    coaches.push({
      id: `${train.number}-dtc1`,
      code: 'DTC',
      classType: 'LOCO',
      label: 'Driver Trailer Cab (DTC-1)',
      subText: 'Aerodynamic Aerofoil Nose, 160 km/h Automatic Traction Unit',
      totalSeats: 44,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // C1 - C5
    for (let i = 1; i <= 5; i++) {
      const isFilling = i % 2 === 0;
      coaches.push({
        id: `${train.number}-c${i}`,
        code: `C${i}`,
        classType: 'CC',
        label: `Coach C${i} - CC (AC Chair Car)`,
        subText: '3x2 Reclining Ergonomic Seats, Individual USB & Reading Light',
        totalSeats: 78,
        availableSeats: isFilling ? Math.max(2, ccAvail.available - (i * 3)) : ccAvail.available,
        tatkalSeats: ccAvail.tatkal,
        status: isFilling && ccAvail.available < 20 ? 'filling_fast' : ccAvail.status,
        wlCount: ccAvail.wl,
        racCount: ccAvail.rac,
        fare: ccAvail.fare,
      });
    }

    // EC1 Executive Car
    coaches.push({
      id: `${train.number}-ec1`,
      code: 'E1',
      classType: 'EC',
      label: 'Coach E1 - EC (Executive Class)',
      subText: '2x2 180° Rotating Seats, Foldable Snack Tables, Panoramic Vista Windows',
      totalSeats: 52,
      availableSeats: ecAvail.available,
      tatkalSeats: ecAvail.tatkal,
      status: ecAvail.status,
      wlCount: ecAvail.wl,
      fare: ecAvail.fare,
    });

    // C6 - C8
    for (let i = 6; i <= 8; i++) {
      coaches.push({
        id: `${train.number}-c${i}`,
        code: `C${i}`,
        classType: 'CC',
        label: `Coach C${i} - CC (AC Chair Car)`,
        subText: 'Aerodynamic Sealed Vestibule Gangway with Digital Infotainment',
        totalSeats: 78,
        availableSeats: Math.max(1, ccAvail.available - 5),
        tatkalSeats: Math.max(1, ccAvail.tatkal - 1),
        status: ccAvail.status,
        fare: ccAvail.fare,
      });
    }

    // DTC-2
    coaches.push({
      id: `${train.number}-dtc2`,
      code: 'DTC',
      classType: 'LOCO',
      label: 'Driver Trailer Cab (DTC-2)',
      subText: 'Tail End Braking Unit & Guard Intercom Panel',
      totalSeats: 44,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });
  } else if (arch === 'FLAGSHIP_LHB') {
    const a1Avail = getClassAvailability('1A');
    const a2Avail = getClassAvailability('2A');
    const a3Avail = getClassAvailability('3A');

    // Loco WAP-7
    coaches.push({
      id: `${train.number}-loco`,
      code: 'WAP7',
      classType: 'LOCO',
      label: 'Electric Locomotive WAP-7',
      subText: '6350 HP 3-Phase AC Traction with Regenerative Braking',
      totalSeats: 2,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // EOG-1
    coaches.push({
      id: `${train.number}-eog1`,
      code: 'EOG',
      classType: 'EOG',
      label: 'End-on-Generation Power Car (EOG-1)',
      subText: '750kVA Silent Diesel Generator for Full Train Hotel Load',
      totalSeats: 0,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // H1 (First AC)
    coaches.push({
      id: `${train.number}-h1`,
      code: 'H1',
      classType: '1A',
      label: 'Coach H1 - 1A (AC First Class)',
      subText: 'Private Lockable 2-Berth Coupes & 4-Berth Cabins with Plush Bedding',
      totalSeats: 24,
      availableSeats: a1Avail.available,
      tatkalSeats: a1Avail.tatkal,
      status: a1Avail.status,
      wlCount: a1Avail.wl,
      fare: a1Avail.fare,
    });

    // A1, A2 (AC 2-Tier)
    for (let i = 1; i <= 2; i++) {
      coaches.push({
        id: `${train.number}-a${i}`,
        code: `A${i}`,
        classType: '2A',
        label: `Coach A${i} - 2A (AC 2-Tier)`,
        subText: '2-Tier Bunks with Individual Privacy Curtains and Reading Lights',
        totalSeats: 54,
        availableSeats: Math.max(3, a2Avail.available - (i * 2)),
        tatkalSeats: a2Avail.tatkal,
        status: a2Avail.status,
        wlCount: a2Avail.wl,
        fare: a2Avail.fare,
      });
    }

    // B1 - B4 (AC 3-Tier)
    for (let i = 1; i <= 4; i++) {
      coaches.push({
        id: `${train.number}-b${i}`,
        code: `B${i}`,
        classType: '3A',
        label: `Coach B${i} - 3A (AC 3-Tier)`,
        subText: '3-Tier Transverse Berths with High-Efficiency Roof Mounted AC',
        totalSeats: 72,
        availableSeats: Math.max(0, a3Avail.available - (i * 4)),
        tatkalSeats: a3Avail.tatkal,
        status: a3Avail.status,
        wlCount: a3Avail.wl,
        fare: a3Avail.fare,
      });
    }

    // PC (Pantry Car)
    coaches.push({
      id: `${train.number}-pc`,
      code: 'PC',
      classType: 'PC',
      label: 'Hot Buffet Pantry Car (PC)',
      subText: 'Flameless Electric Steam Tables, Deep Freezers & Hot Cases',
      totalSeats: 0,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // B5, B6 (AC 3-Tier)
    for (let i = 5; i <= 6; i++) {
      coaches.push({
        id: `${train.number}-b${i}`,
        code: `B${i}`,
        classType: '3A',
        label: `Coach B${i} - 3A (AC 3-Tier)`,
        subText: 'LHB Stainless Steel Anti-Telescopic CBC Couplers',
        totalSeats: 72,
        availableSeats: Math.max(1, a3Avail.available),
        tatkalSeats: Math.max(0, a3Avail.tatkal),
        status: a3Avail.status,
        fare: a3Avail.fare,
      });
    }

    // EOG-2
    coaches.push({
      id: `${train.number}-eog2`,
      code: 'EOG',
      classType: 'EOG',
      label: 'Rear Power Car & Guard Cabin (EOG-2)',
      subText: 'Auxiliary Guard Intercom and Emergency Braking System',
      totalSeats: 0,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });
  } else if (arch === 'DOUBLE_DECKER') {
    const ddAvail = getClassAvailability('CC');

    // WAP-5
    coaches.push({
      id: `${train.number}-wap5`,
      code: 'WAP5',
      classType: 'LOCO',
      label: 'Electric Locomotive WAP-5',
      subText: '5450 HP High-Speed Bo-Bo Wheel Arrangement for 160 km/h Operations',
      totalSeats: 2,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // EOG-1
    coaches.push({
      id: `${train.number}-eog1`,
      code: 'EOG',
      classType: 'EOG',
      label: 'Front Power Car (EOG-1)',
      subText: 'High-Capacity Generator for Bi-Level Climate Conditioning',
      totalSeats: 0,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // D1 - D8 (Double Decker)
    for (let i = 1; i <= 8; i++) {
      const isEven = i % 2 === 0;
      coaches.push({
        id: `${train.number}-d${i}`,
        code: `D${i}`,
        classType: 'DD',
        deckType: 'double',
        label: `Coach D${i} - DD (AC Double Decker)`,
        subText: isEven
          ? 'Lower Deck Low-Center-of-Gravity High Stability Seats'
          : 'Upper Deck Panoramic High-Elevation Scenic Windows',
        totalSeats: 120,
        availableSeats: Math.max(4, ddAvail.available - (i * 3)),
        tatkalSeats: Math.max(1, ddAvail.tatkal),
        status: ddAvail.status,
        fare: ddAvail.fare,
      });
    }

    // EOG-2
    coaches.push({
      id: `${train.number}-eog2`,
      code: 'EOG',
      classType: 'EOG',
      label: 'Rear Power Car & Luggage (EOG-2)',
      subText: 'Luggage Storage & Rear Guard Brake Compartment',
      totalSeats: 0,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });
  } else {
    // STANDARD_EXPRESS
    const slAvail = getClassAvailability('SL');
    const a3Avail = getClassAvailability('3A');
    const a2Avail = getClassAvailability('2A');

    // Loco WAP-4
    coaches.push({
      id: `${train.number}-wap4`,
      code: 'WAP4',
      classType: 'LOCO',
      label: 'Electric Locomotive WAP-4',
      subText: '5000 HP Heavy Hauler Classic Indian Railways Workhorse',
      totalSeats: 2,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'available',
      fare: 0,
    });

    // SLR-1
    coaches.push({
      id: `${train.number}-slr1`,
      code: 'SLR',
      classType: 'SLR',
      label: 'Seating cum Luggage Rake (SLR-1)',
      subText: 'Divyangjan Dedicated Berths & Parcel Freight Compartment',
      totalSeats: 36,
      availableSeats: 14,
      tatkalSeats: 0,
      status: 'available',
      fare: 180,
    });

    // GS-1
    coaches.push({
      id: `${train.number}-gs1`,
      code: 'GS',
      classType: 'GEN',
      label: 'General Second Class (GS-1)',
      subText: 'Unreserved Day & Night Travel Coach (OTS Ticket Valid)',
      totalSeats: 100,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'regret',
      fare: 140,
    });

    // S1 - S6 (Sleeper)
    for (let i = 1; i <= 6; i++) {
      coaches.push({
        id: `${train.number}-s${i}`,
        code: `S${i}`,
        classType: 'SL',
        label: `Coach S${i} - SL (Sleeper Class)`,
        subText: 'Classic 8-Berth Transverse & Longitudinal Bays with Openable Windows',
        totalSeats: 80,
        availableSeats: Math.max(0, slAvail.available - (i * 5)),
        tatkalSeats: slAvail.tatkal,
        status: slAvail.status,
        wlCount: slAvail.wl,
        racCount: slAvail.rac,
        fare: slAvail.fare,
      });
    }

    // B1 - B3 (3A)
    for (let i = 1; i <= 3; i++) {
      coaches.push({
        id: `${train.number}-b${i}`,
        code: `B${i}`,
        classType: '3A',
        label: `Coach B${i} - 3A (AC 3-Tier)`,
        subText: 'Air Conditioned 3-Tier Sleeper with Linen & Bedroll Included',
        totalSeats: 72,
        availableSeats: Math.max(0, a3Avail.available - (i * 3)),
        tatkalSeats: a3Avail.tatkal,
        status: a3Avail.status,
        wlCount: a3Avail.wl,
        fare: a3Avail.fare,
      });
    }

    // A1 (2A)
    coaches.push({
      id: `${train.number}-a1`,
      code: 'A1',
      classType: '2A',
      label: 'Coach A1 - 2A (AC 2-Tier)',
      subText: 'Spacious 2-Tier Bunks with Individual Curtains & Clean Linen',
      totalSeats: 54,
      availableSeats: a2Avail.available,
      tatkalSeats: a2Avail.tatkal,
      status: a2Avail.status,
      wlCount: a2Avail.wl,
      fare: a2Avail.fare,
    });

    // GS-2
    coaches.push({
      id: `${train.number}-gs2`,
      code: 'GS',
      classType: 'GEN',
      label: 'General Second Class (GS-2)',
      subText: 'Unreserved Coach with Emergency Braking Pull Chain',
      totalSeats: 100,
      availableSeats: 0,
      tatkalSeats: 0,
      status: 'regret',
      fare: 140,
    });

    // SLR-2
    coaches.push({
      id: `${train.number}-slr2`,
      code: 'SLR',
      classType: 'SLR',
      label: 'Rear Brake Van & Guard Cabin (SLR-2)',
      subText: 'Train Manager Intercom, Detonator Box & Guard Equipment',
      totalSeats: 36,
      availableSeats: 8,
      tatkalSeats: 0,
      status: 'available',
      fare: 180,
    });
  }

  return {
    trainNumber: train.number,
    trainName: train.name,
    hindiName: train.hindiName,
    type: arch,
    archetypeLabel:
      arch === 'NEXT_GEN_EMU'
        ? 'Vande Bharat / Amrit Bharat EMU'
        : arch === 'FLAGSHIP_LHB'
        ? 'Rajdhani / Shatabdi LHB Rake'
        : arch === 'DOUBLE_DECKER'
        ? 'AC Double Decker Bi-Level Rake'
        : 'Superfast Mail / Express ICF Rake',
    fromStation: {
      code: train.fromStation.code,
      name: train.fromStation.name,
    },
    toStation: {
      code: train.toStation.code,
      name: train.toStation.name,
    },
    departureTime: train.fromStation.depTime || '06:00',
    arrivalTime: train.toStation.arrTime || '14:00',
    totalDistanceKm: train.distanceKm,
    coaches,
  };
}

// Broadcast helpers
export function broadcastTrainRakeArchetype(archetype: TrainArchetype) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fairflow:select-train-rake', {
        detail: { archetype },
      })
    );
  }
}

export function selectTrainForRake(train: TrainDetail | TrainRakeConfig) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fairflow:select-train-rake', {
        detail: { train },
      })
    );
  }
}

// ============================================================================
// 6. Main Component: InteractiveRakeRail
// ============================================================================

export const InteractiveRakeRail: React.FC<InteractiveRakeRailProps> = ({
  currentTrain,
  isFindTrainPage = false,
  onSelectCoach,
  onSelectTrain,
  onBookClass,
  className = '',
}) => {
  // Selected Train Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<TrainArchetype>(
    currentTrain?.type || 'NEXT_GEN_EMU'
  );
  const [activeCustomTrain, setActiveCustomTrain] = useState<TrainRakeConfig | null>(null);

  // Sync with prop if changed
  useEffect(() => {
    if (currentTrain?.type) {
      setSelectedArchetype(currentTrain.type);
    }
  }, [currentTrain]);

  // Sync with custom event (only applied if on Find My Train page)
  useEffect(() => {
    const handleCustomTrainSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{
        archetype?: TrainArchetype;
        train?: TrainDetail | TrainRakeConfig;
      }>;

      if (customEvent.detail?.train) {
        const rawTrain = customEvent.detail.train;
        if ('classes' in rawTrain) {
          const generated = createRakeConfigFromTrainDetail(rawTrain as TrainDetail);
          setActiveCustomTrain(generated);
          setSelectedArchetype(generated.type);
        } else {
          setActiveCustomTrain(rawTrain as TrainRakeConfig);
          setSelectedArchetype((rawTrain as TrainRakeConfig).type);
        }
      } else if (customEvent.detail?.archetype) {
        setSelectedArchetype(customEvent.detail.archetype);
        setActiveCustomTrain(null);
      }
    };

    window.addEventListener('fairflow:select-train-rake', handleCustomTrainSelect);
    return () => window.removeEventListener('fairflow:select-train-rake', handleCustomTrainSelect);
  }, []);

  // Strict Rule: On other pages, ALWAYS use Vande Bharat Express
  // On Find My Train page, use the selected train architecture
  const activeTrain: TrainRakeConfig = isFindTrainPage
    ? activeCustomTrain || currentTrain || MOCK_TRAIN_ARCHETYPES[selectedArchetype]
    : MOCK_TRAIN_ARCHETYPES['NEXT_GEN_EMU'];

  // Hover state for individual coach inspection (strictly enabled only on Find My Train page)
  const [hoveredCoach, setHoveredCoach] = useState<CoachData | null>(null);
  const [hoveredCoachRect, setHoveredCoachRect] = useState<{ top: number; height: number } | null>(
    null
  );
  const [isRailHovered, setIsRailHovered] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Reset hover state when leaving Find My Train page
  useEffect(() => {
    if (!isFindTrainPage) {
      setHoveredCoach(null);
      setHoveredCoachRect(null);
    }
  }, [isFindTrainPage]);

  // Viewport Height for dynamic rake scaling
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Framer Motion Scroll Tracking
  const { scrollYProgress } = useScroll();
  const [numericProgress, setNumericProgress] = useState<number>(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setNumericProgress(latest);
    });
  }, [scrollYProgress]);

  // Layout & Scaling Math for dynamic coach sizing
  const TOP_OFFSET = 70;
  const BOTTOM_OFFSET = 55;
  const usableHeight = Math.max(300, viewportHeight - TOP_OFFSET - BOTTOM_OFFSET);

  const coachCount = activeTrain.coaches.length;

  // Compute coach height so rakes fit comfortably on viewport height
  const { coachHeight, couplerHeight, totalRakeHeight, travelDistance } = useMemo(() => {
    const cHeight = Math.max(2, Math.min(4, Math.floor(usableHeight / (coachCount * 8))));
    const maxCoachH = 44;
    const minCoachH = 18;
    const computedH = Math.floor((usableHeight - coachCount * cHeight) / coachCount);
    const finalCoachHeight = Math.max(minCoachH, Math.min(maxCoachH, computedH));

    const totalHeight = coachCount * finalCoachHeight + (coachCount - 1) * cHeight;
    const distance = Math.max(0, usableHeight - totalHeight);

    return {
      coachHeight: finalCoachHeight,
      couplerHeight: cHeight,
      totalRakeHeight: totalHeight,
      travelDistance: distance,
    };
  }, [usableHeight, coachCount]);

  // Scroll Transform: moves train along the track
  const trainTranslateY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, travelDistance]
  );

  // Quick navigation on track click
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const effectiveHeight = rect.height - TOP_OFFSET - BOTTOM_OFFSET;
    const relativeY = Math.max(0, Math.min(effectiveHeight, clickY - TOP_OFFSET));
    const percent = relativeY / effectiveHeight;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: Math.round(percent * docHeight),
      behavior: 'smooth',
    });
  };

  // Helper to render coach based on archetype
  const renderCoachVisual = (coach: CoachData, idx: number) => {
    const isHovered = isFindTrainPage && hoveredCoach?.id === coach.id;
    const props: CoachRenderProps = {
      coach,
      archetype: activeTrain.type,
      height: coachHeight,
      width: 32,
      isHovered,
      index: idx,
      totalCount: coachCount,
    };

    switch (activeTrain.type) {
      case 'NEXT_GEN_EMU':
        return <NextGenEmuCoachSVG {...props} />;
      case 'FLAGSHIP_LHB':
        return <FlagshipLhbCoachSVG {...props} />;
      case 'STANDARD_EXPRESS':
        return <StandardExpressCoachSVG {...props} />;
      case 'DOUBLE_DECKER':
        return <DoubleDeckerCoachSVG {...props} />;
      default:
        return <NextGenEmuCoachSVG {...props} />;
    }
  };

  const progressPercent = Math.round(numericProgress * 100);

  return (
    <aside
      aria-label="Live Train and Rake Composition Rail"
      onMouseEnter={() => setIsRailHovered(true)}
      onMouseLeave={() => {
        setIsRailHovered(false);
        if (isFindTrainPage) {
          setHoveredCoach(null);
        }
      }}
      className={`fixed right-0 top-0 bottom-0 z-40 hidden lg:flex select-none transition-all duration-300 ${
        isCollapsed ? 'translate-x-[calc(100%-28px)]' : 'translate-x-0'
      } ${className}`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-7 top-24 z-50 p-1.5 rounded-l-xl bg-slate-900/90 text-amber-300 border-l border-y border-slate-700 shadow-lg hover:text-white transition-colors"
        title={isCollapsed ? 'Expand Train Rail' : 'Collapse Train Rail'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Note: Manual Archetype Selector Pill has been completely removed per user request */}

      {/* Active Coach Floating HUD Tooltip (ONLY visible on Find My Train page) */}
      <AnimatePresence>
        {isFindTrainPage && hoveredCoach && (
          <div
            className="fixed z-50 pointer-events-auto transition-transform"
            style={{
              right: '54px',
              top: `${Math.max(
                20,
                Math.min(
                  viewportHeight - 420,
                  (hoveredCoachRect?.top || 100) - 100
                )
              )}px`,
            }}
          >
            <CoachHudTooltip
              coach={hoveredCoach}
              archetype={activeTrain.type}
              train={activeTrain}
              onBookClass={(cls) => {
                onSelectCoach?.(hoveredCoach);
                onBookClass?.(cls);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Vertical Railway Track Container */}
      <div
        onClick={handleTrackClick}
        className="relative w-12 sm:w-13 h-full bg-slate-950 border-l border-slate-800 flex flex-col items-center select-none cursor-pointer shadow-2xl"
        title="Scroll or Drag along the Railway Track"
      >
        {/* Ballast Gravel Background Texture */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#64748B 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />

        {/* Concrete Sleepers / Cross-Ties (Repeated vertically) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 10px,
              #475569 10px,
              #475569 13px
            )`,
          }}
        />

        {/* Dual Steel Rails (Left & Right polished metal lines) */}
        <div className="absolute top-0 bottom-0 left-2.5 w-[2px] bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400 shadow-sm pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-2.5 w-[2px] bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400 shadow-sm pointer-events-none" />

        {/* Top Terminal Buffer (Origin Station) */}
        <div className="absolute top-2 left-1 right-1 z-20 flex flex-col items-center">
          <div className="px-1 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[8px] font-mono text-amber-300 font-bold">
            {activeTrain.fromStation.code}
          </div>
          <div className="w-8 h-1 bg-amber-500 rounded-full mt-0.5" />
        </div>

        {/* Scroll Progress Label Pill */}
        <div className="absolute top-11 z-20 pointer-events-none">
          <span className="px-1 py-0.5 rounded-full bg-slate-900/90 border border-blue-500/40 text-[8px] font-mono font-bold text-sky-300">
            {progressPercent}%
          </span>
        </div>

        {/* DYNAMIC MOVING RAKE (Scaled, sequenced, scroll-linked) */}
        <motion.div
          style={{
            y: trainTranslateY,
            top: `${TOP_OFFSET}px`,
          }}
          className="relative z-30 flex flex-col items-center w-full"
        >
          {activeTrain.coaches.map((coach, idx) => {
            const isHovered = isFindTrainPage && hoveredCoach?.id === coach.id;

            return (
              <React.Fragment key={coach.id}>
                {/* Individual Coach Element */}
                <div
                  onMouseEnter={
                    isFindTrainPage
                      ? (e) => {
                          setHoveredCoach(coach);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCoachRect({ top: rect.top, height: rect.height });
                        }
                      : undefined
                  }
                  onClick={
                    isFindTrainPage
                      ? (e) => {
                          e.stopPropagation();
                          onSelectCoach?.(coach);
                          if (coach.classType !== 'LOCO' && coach.classType !== 'EOG') {
                            onBookClass?.(coach.classType);
                          }
                        }
                      : undefined
                  }
                  className={`relative flex items-center justify-center transition-transform ${
                    isFindTrainPage
                      ? isHovered
                        ? 'scale-110 z-40 cursor-pointer'
                        : 'hover:scale-105 z-10 cursor-pointer'
                      : 'cursor-default'
                  }`}
                  style={{
                    height: `${coachHeight}px`,
                    width: '32px',
                  }}
                  title={isFindTrainPage ? `${coach.label} - Click to Inspect` : undefined}
                >
                  {/* Coach SVG Graphic */}
                  {renderCoachVisual(coach, idx)}

                  {/* Active Coach Glow Ring on Hover (Find My Train page only) */}
                  {isFindTrainPage && isHovered && (
                    <motion.div
                      layoutId="activeCoachGlow"
                      className="absolute -inset-1 rounded-lg border-2 border-amber-400 bg-amber-400/10 shadow-lg pointer-events-none"
                    />
                  )}

                  {/* Coach Code Side Pill indicator (Find My Train page only) */}
                  {isFindTrainPage && (
                    <div
                      className={`absolute -left-6 px-1 py-0.5 rounded text-[8px] font-mono font-bold transition-opacity ${
                        isHovered
                          ? 'opacity-100 bg-amber-400 text-slate-950 shadow-md'
                          : 'opacity-60 bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      {coach.code}
                    </div>
                  )}
                </div>

                {/* Flexible Vestibule Gangway Coupler between coaches */}
                {idx < coachCount - 1 && (
                  <div
                    className="w-2.5 bg-slate-800 border-x border-slate-700 shadow-inner my-0"
                    style={{ height: `${couplerHeight}px` }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </motion.div>

        {/* Bottom Terminal Buffer (Destination Station) */}
        <div className="absolute bottom-2 left-1 right-1 z-20 flex flex-col items-center">
          <div className="w-8 h-1 bg-red-500 rounded-full mb-0.5" />
          <div className="px-1 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[8px] font-mono text-red-300 font-bold">
            {activeTrain.toStation.code}
          </div>
          <div className="text-[7px] font-mono text-slate-500 mt-0.5">
            {activeTrain.totalDistanceKm} km
          </div>
        </div>
      </div>
    </aside>
  );
};
