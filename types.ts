
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  state: string;
  joinedDate: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; rainChance: number }[];
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  area: number; // in acres
  expectedHarvestDate: string;
  status: 'Healthy' | 'Needs Attention' | 'Harvest Ready';
}

export interface DiseaseAnalysis {
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Healthy' | 'Unknown';
  description: string;
  treatment: string[];
  organicAlternatives: string[];
  prevention: string[];
  nextSteps: string;
}

export interface ScanRecord {
  id: string;
  date: string;
  image: string; // Base64
  crop: string;
  analysis: DiseaseAnalysis;
  location: string;
}

export interface NearbyMarket {
  name: string;
  distance: string;
  priceDiff: number; // difference from average
}

export interface MarketPrice {
  crop: string;
  mandi: string;
  price: number; // per quintal
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  distance?: string; // Distance from user
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DISEASE_DETECTION = 'DISEASE_DETECTION',
  ADVISORY = 'ADVISORY',
  MARKET = 'MARKET',
  FARM_MANAGEMENT = 'FARM_MANAGEMENT',
  HISTORY = 'HISTORY',
  WEATHER = 'WEATHER',
  SETTINGS = 'SETTINGS'
}

export type Language = 'en' | 'hi' | 'ur';

export const SUPPORTED_CROPS = [
  "Rice (Paddy)", "Wheat", "Maize", "Cotton", "Sugarcane", 
  "Potato", "Tomato", "Onion", "Soybean", "Mustard", 
  "Groundnut", "Chili", "Banana", "Mango", "Other"
];
