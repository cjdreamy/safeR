import { AlertTriangle, Home, Map as MapIcon, Shield, Info, Radio, Settings, Navigation2, Search, Bell, AlertOctagon, Heart, Zap, Waves, Flame, Ghost } from "lucide-react";

export const HAZARD_TYPES = {
  FLOOD: { id: "flood", label: "Flood", icon: Waves, color: "#3b82f6" },
  FIRE: { id: "fire", label: "Wildfire", icon: Flame, color: "#ef4444" },
  RIOT: { id: "riot", label: "Civil Unrest", icon: AlertTriangle, color: "#f59e0b" },
  STORM: { id: "storm", label: "Severe Storm", icon: Zap, color: "#8b5cf6" },
  STRUCTURE: { id: "structure", label: "Structural Damage", icon: Ghost, color: "#6b7280" },
};

export interface HazardZone {
  id: string;
  type: keyof typeof HAZARD_TYPES;
  severity: "low" | "medium" | "high" | "critical";
  radius: number; // in meters
  center: [number, number];
  description: string;
  timestamp: string;
}

export interface Shelter {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  coordinates: [number, number];
  address: string;
  features: string[];
}

export const MOCK_HAZARDS: HazardZone[] = [
  {
    id: "h1",
    type: "FLOOD",
    severity: "critical",
    radius: 1200,
    center: [-1.286389, 36.817223],
    description: "Severe flooding reported near Nairobi River. Water levels rising rapidly after heavy rains.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "h2",
    type: "FIRE",
    severity: "high",
    radius: 800,
    center: [-1.3214, 36.7516],
    description: "Brush fire detected near Ngong Forest. Emergency services are battling the blaze.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "h3",
    type: "RIOT",
    severity: "medium",
    radius: 500,
    center: [-1.2841, 36.8249],
    description: "Demonstrations reported near City Hall Way. Traffic diverted from the CBD.",
    timestamp: new Date().toISOString(),
  },
];

export const MOCK_SHELTERS: Shelter[] = [
  {
    id: "s1",
    name: "Kenyatta National Shelter",
    capacity: 1500,
    occupancy: 942,
    coordinates: [-1.3011, 36.8012],
    address: "Hospital Rd, Nairobi, Kenya",
    features: ["Medical Support", "Food", "Water", "Specialized Care"],
  },
  {
    id: "s2",
    name: "Nyayo Stadium Relief Hub",
    capacity: 3000,
    occupancy: 1200,
    coordinates: [-1.3028, 36.8222],
    address: "Aerodrome Rd, Nairobi, Kenya",
    features: ["Medical Support", "Charging Stations", "WiFi", "Large Capacity"],
  },
  {
    id: "s3",
    name: "Kasarani Community Safe Zone",
    capacity: 2000,
    occupancy: 850,
    coordinates: [-1.2227, 36.8932],
    address: "Thika Rd, Nairobi, Kenya",
    features: ["Family Units", "Food", "Water", "Secure Parking"],
  },
];