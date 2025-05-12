import { apiRequest } from "@/lib/queryClient";
import { ItineraryForm } from "@shared/schema";
import { GeneratedItinerary } from "@/types/itinerary";

export async function getDestinations() {
  const response = await fetch("/api/destinations");
  if (!response.ok) {
    throw new Error("Failed to fetch destinations");
  }
  return response.json();
}

export async function generateItinerary(formData: ItineraryForm): Promise<GeneratedItinerary> {
  const res = await apiRequest("POST", "/api/generate-itinerary", formData);
  return res.json();
}

export async function saveItinerary(itineraryData: GeneratedItinerary) {
  const res = await apiRequest("POST", "/api/save-itinerary", { itineraryData });
  return res.json();
}

export async function getItineraries(userId?: number) {
  const url = userId ? `/api/itineraries?userId=${userId}` : "/api/itineraries";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch itineraries");
  }
  return response.json();
}

export async function getItinerary(id: number) {
  const response = await fetch(`/api/itineraries/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch itinerary");
  }
  return response.json();
}
