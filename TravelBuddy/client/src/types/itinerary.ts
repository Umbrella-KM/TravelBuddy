import { Preferences, BudgetAllocation } from "@shared/schema";

export interface Meal {
  type: string;
  name: string;
  description: string;
  cost: number;
  googleMapsUrl?: string;
  yelpUrl?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
}

export interface Activity {
  name: string;
  description: string;
  cost: number;
  duration: string;
  imageUrl?: string;
  googleMapsUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  tags?: string[];
}

export interface Accommodation {
  name: string;
  description: string;
  costPerNight: number;
  rating: number;
  imageUrl: string;
  googleMapsUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Transportation {
  type: string;
  description: string;
  cost: number;
  googleMapsUrl?: string;
}

export interface ItineraryDay {
  day: number;
  date: string | null;
  title: string;
  accommodation: Accommodation;
  meals: Meal[];
  activities: Activity[];
  transportation: Transportation;
  dailyCost: number;
  summary: string;
}

export interface GeneratedItinerary {
  destination: string;
  country?: string;
  days: number;
  totalBudget: number;
  budgetAllocation: BudgetAllocation;
  preferences: Preferences;
  dates: {
    start: string | null;
    end: string | null;
  };
  itineraryDays: ItineraryDay[];
}
