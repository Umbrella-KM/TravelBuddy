import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { itineraryFormSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import axios from "axios";
import { OSMService } from "./services/osm";
import { TriposoService } from "./services/triposo";
import { YelpService } from "./services/yelp";
import { DatabaseStorage } from "./database-storage";

// Create database storage instance
const storage = new DatabaseStorage();

function generateBudgetAllocation(totalBudget: number, preferences: any) {
  // Different allocation percentages based on accommodation preference
  let accommodationPercent = 0.35; // default
  if (preferences.accommodation === "budget") accommodationPercent = 0.25;
  if (preferences.accommodation === "luxury") accommodationPercent = 0.45;

  // Different allocation percentages based on food preference
  let foodPercent = 0.25; // default
  if (preferences.food === "budget") foodPercent = 0.15;
  if (preferences.food === "fine") foodPercent = 0.35;

  // Calculate remaining percentages
  let activitiesPercent = 0.25;
  let transportationPercent = 1 - accommodationPercent - foodPercent - activitiesPercent;

  return {
    accommodation: Math.round(totalBudget * accommodationPercent),
    food: Math.round(totalBudget * foodPercent),
    activities: Math.round(totalBudget * activitiesPercent),
    transportation: Math.round(totalBudget * transportationPercent),
  };
}

async function generateAttraction(city: string, country?: string) {
  try {
    // First, try to get attraction data from Triposo API
    const attractions = await TriposoService.getPointsOfInterest(city, country, 10);
    
    // If we have attractions, return one
    if (attractions && attractions.length > 0) {
      // Get a random attraction from the results
      const attraction = attractions[Math.floor(Math.random() * attractions.length)];
      
      return {
        name: attraction.name,
        description: attraction.description,
        cost: attraction.estimatedCost,
        duration: attraction.estimatedDuration,
        imageUrl: attraction.imageUrl,
        googleMapsUrl: attraction.googleMapsUrl
      };
    }
    
    // If Triposo fails, fall back to OSM
    const osmAttractions = await OSMService.getPointsOfInterest(city, country);
    
    // If we have OSM attractions, return one
    if (osmAttractions && osmAttractions.length > 0) {
      // Get a random attraction from the results
      const attraction = osmAttractions[Math.floor(Math.random() * osmAttractions.length)];
      
      // Map OSM attraction to our format
      return {
        name: attraction.name,
        description: attraction.description,
        cost: attraction.estimatedCost,
        duration: attraction.estimatedDuration,
        imageUrl: attraction.image || `https://images.unsplash.com/photo-1553701879-4aa576804f65`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + ' ' + city)}`
      };
    }
  } catch (error) {
    console.error('Error getting attractions, falling back to defaults:', error);
  }
  
  // Fallback to predefined attractions if APIs fail or return no results
  const attractionTypes: Record<string, any[]> = {
    "Paris": [
      { name: "Eiffel Tower", description: "Iconic iron lattice tower", cost: 25, duration: "2-3 hours", imageUrl: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris" },
      { name: "Louvre Museum", description: "World's largest art museum", cost: 15, duration: "3-4 hours", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9357976b82", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris" },
      { name: "Notre-Dame Cathedral", description: "Medieval Catholic cathedral", cost: 0, duration: "1-2 hours", imageUrl: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Notre+Dame+Cathedral+Paris" },
      { name: "Seine River Cruise", description: "Scenic boat tour of Paris", cost: 35, duration: "1 hour", imageUrl: "https://images.unsplash.com/photo-1583265627959-fb7042f5133b", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Seine+River+Cruise+Paris" },
      { name: "Montmartre", description: "Historic arts district with stunning views", cost: 0, duration: "2-3 hours", imageUrl: "https://images.unsplash.com/photo-1551634979-2b11f8c218da", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Montmartre+Paris" },
      { name: "Champs-Élysées", description: "Famous avenue with luxury shopping", cost: 0, duration: "2 hours", imageUrl: "https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Champs+Elysees+Paris" },
    ],
    "Tokyo": [
      { name: "Shibuya Crossing", description: "Famous bustling intersection", cost: 0, duration: "1 hour", imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Shibuya+Crossing+Tokyo" },
      { name: "Tokyo Skytree", description: "Tallest tower in Japan", cost: 20, duration: "2 hours", imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tokyo+Skytree" },
      { name: "Meiji Shrine", description: "Shinto shrine dedicated to Emperor Meiji", cost: 0, duration: "1-2 hours", imageUrl: "https://images.unsplash.com/photo-1583889659384-ac0295c95f40", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Meiji+Shrine+Tokyo" },
      { name: "Sensō-ji Temple", description: "Ancient Buddhist temple", cost: 0, duration: "1 hour", imageUrl: "https://images.unsplash.com/photo-1570459027562-4a916cc6b0a6", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sensoji+Temple+Tokyo" },
    ],
    "default": [
      { name: "City Tour", description: "Explore the city highlights", cost: 30, duration: "3 hours", imageUrl: "https://images.unsplash.com/photo-1476304884326-cd2c88572c5f", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=City+Tour" },
      { name: "Local Museum", description: "Learn about the local history", cost: 15, duration: "2 hours", imageUrl: "https://images.unsplash.com/photo-1553701879-4aa576804f65", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Museum" },
      { name: "Nature Walk", description: "Enjoy the natural surroundings", cost: 0, duration: "2 hours", imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Park" },
    ]
  };

  const cityAttractions = attractionTypes[city] || attractionTypes["default"];
  return cityAttractions[Math.floor(Math.random() * cityAttractions.length)];
}

async function generateAccommodation(city: string, country: string | undefined, type: string) {
  try {
    // Try to get accommodation data from Triposo API
    const accommodations = await TriposoService.getAccommodations(city, country, type, 10);
    
    // If we have accommodations, return one
    if (accommodations && accommodations.length > 0) {
      // Get a random accommodation from the results
      const accommodation = accommodations[Math.floor(Math.random() * accommodations.length)];
      
      return {
        name: accommodation.name,
        description: accommodation.description,
        cost: accommodation.costPerNight,
        rating: accommodation.rating,
        imageUrl: accommodation.imageUrl,
        googleMapsUrl: accommodation.googleMapsUrl
      };
    }
    
    // If Triposo fails, fall back to OSM
    const osmAccommodations = await OSMService.getAccommodations(city, country, type);
    
    // If we have OSM accommodations, return one
    if (osmAccommodations && osmAccommodations.length > 0) {
      // Get a random accommodation from the results
      const accommodation = osmAccommodations[Math.floor(Math.random() * osmAccommodations.length)];
      
      // Return in the expected format
      return {
        name: accommodation.name,
        description: accommodation.description,
        cost: accommodation.costPerNight,
        rating: accommodation.rating,
        imageUrl: accommodation.imageUrl,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name + ' ' + city)}`
      };
    }
  } catch (error) {
    console.error('Error getting accommodations, falling back to defaults:', error);
  }
  
  // Fallback to predefined accommodations if APIs fail or return no results
  const accommodations: Record<string, Record<string, any>> = {
    "Paris": {
      "budget": { name: "Le Budget Hostel", description: "Affordable hostel in central Paris", cost: 60, rating: 3.5, imageUrl: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Budget+Hostel+Paris" },
      "mid-range": { name: "Hotel Parisien", description: "Comfortable hotel in Montmartre district", cost: 135, rating: 4, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Parisien+Paris" },
      "luxury": { name: "Grand Palais Hotel", description: "Luxury 5-star hotel near Champs-Élysées", cost: 350, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Palais+Hotel+Paris" },
    },
    "Tokyo": {
      "budget": { name: "Tokyo Backpackers", description: "Clean and modern hostel", cost: 45, rating: 3.7, imageUrl: "https://images.unsplash.com/photo-1598928636135-d146006ff4be", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tokyo+Backpackers" },
      "mid-range": { name: "Shinjuku City Hotel", description: "Convenient location near train station", cost: 125, rating: 4.1, imageUrl: "https://images.unsplash.com/photo-1621293954908-907159247fc8", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Shinjuku+City+Hotel+Tokyo" },
      "luxury": { name: "Imperial Tokyo", description: "Elegant 5-star accommodation", cost: 290, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Imperial+Hotel+Tokyo" },
    },
    "default": {
      "budget": { name: "City Hostel", description: "Budget-friendly option", cost: 40, rating: 3.5, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=City+Hostel" },
      "mid-range": { name: "Comfort Inn", description: "Mid-range hotel with good amenities", cost: 100, rating: 4.0, imageUrl: "https://images.unsplash.com/photo-1537833633404-f09d5f12f41a", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Comfort+Inn" },
      "luxury": { name: "Grand Plaza Hotel", description: "Luxury accommodation", cost: 250, rating: 4.5, imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Plaza+Hotel" },
    }
  };

  // Get accommodations for the specified city or use default
  const cityOptions = accommodations[city] || accommodations["default"];
  // Return accommodation based on type or default to mid-range
  return cityOptions[type] || cityOptions["mid-range"];
}

async function generateFood(city: string, country: string | undefined, type: string) {
  try {
    // Try to get food places from Yelp API
    const restaurants = await YelpService.searchRestaurants(city, country, type, 10);
    
    // If we have restaurants, return one
    if (restaurants && restaurants.length > 0) {
      // Get a random restaurant from the results
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      
      return {
        name: restaurant.name,
        description: restaurant.description,
        cost: restaurant.cost,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        imageUrl: restaurant.imageUrl,
        googleMapsUrl: restaurant.googleMapsUrl,
        yelpUrl: restaurant.yelpUrl
      };
    }
    
    // If Yelp fails, fall back to OSM
    const osmFoodPlaces = await OSMService.getFoodPlaces(city, country, type);
    
    // If we have OSM food places, return one
    if (osmFoodPlaces && osmFoodPlaces.length > 0) {
      // Get a random food place from the results
      const foodPlace = osmFoodPlaces[Math.floor(Math.random() * osmFoodPlaces.length)];
      
      return {
        name: foodPlace.name,
        description: foodPlace.description,
        cost: foodPlace.cost,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodPlace.name + ' ' + city)}`
      };
    }
  } catch (error) {
    console.error('Error getting restaurants, falling back to defaults:', error);
  }
  
  // Fallback to predefined food options if APIs fail or return no results
  const foodOptions: Record<string, Record<string, any[]>> = {
    "Paris": {
      "budget": [
        { name: "Le Petit Café", description: "Simple French breakfast", cost: 10, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Le+Petit+Cafe+Paris" },
        { name: "Boulangerie Moderne", description: "Fresh baguettes and pastries", cost: 8, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Boulangerie+Paris" },
        { name: "Crêpe Stand", description: "Street food crêpes", cost: 6, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Crepe+Stand+Paris" },
      ],
      "local": [
        { name: "Café de Paris", description: "Traditional French breakfast", cost: 15, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+de+Paris" },
        { name: "Le Petit Bistro", description: "Local cuisine lunch", cost: 25, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Le+Petit+Bistro+Paris" },
        { name: "Chez Marie", description: "Traditional dinner", cost: 35, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chez+Marie+Paris" },
      ],
      "fine": [
        { name: "L'Authentique", description: "Gourmet French breakfast", cost: 25, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=L'Authentique+Paris" },
        { name: "Bistro Élégant", description: "Fine dining lunch", cost: 45, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistro+Elegant+Paris" },
        { name: "Le Grand Restaurant", description: "Michelin-starred dinner", cost: 120, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Le+Grand+Restaurant+Paris" },
      ],
    },
    "Tokyo": {
      "budget": [
        { name: "Yoshinoya", description: "Fast-food beef bowls", cost: 7, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Yoshinoya+Tokyo" },
        { name: "Convenience Store Bento", description: "Pre-made meals", cost: 5, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=7-Eleven+Tokyo" },
        { name: "Ramen Stand", description: "Quick noodle soup", cost: 8, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ramen+Tokyo" },
      ],
      "local": [
        { name: "Sushi-Ya", description: "Fresh local sushi", cost: 30, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sushi+Restaurant+Tokyo" },
        { name: "Izakaya Tanuki", description: "Japanese pub food", cost: 25, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Izakaya+Tokyo" },
        { name: "Tempura House", description: "Traditional tempura dishes", cost: 20, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tempura+Restaurant+Tokyo" },
      ],
      "fine": [
        { name: "Ginza Kaiseki", description: "Multi-course traditional meal", cost: 80, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Kaiseki+Ginza+Tokyo" },
        { name: "Tokyo Teppanyaki", description: "Premium grilled dishes", cost: 60, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Teppanyaki+Tokyo" },
        { name: "Sushi Omakase", description: "Chef's selection sushi experience", cost: 100, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Omakase+Sushi+Tokyo" },
      ],
    },
    "default": {
      "budget": [
        { name: "City Cafe", description: "Quick breakfast options", cost: 8, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe" },
        { name: "Corner Deli", description: "Sandwiches and salads", cost: 10, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Deli" },
        { name: "Street Food Stand", description: "Local fast food", cost: 7, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Street+Food" },
      ],
      "local": [
        { name: "Local Breakfast Spot", description: "Regional morning dishes", cost: 12, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Breakfast+Restaurant" },
        { name: "Traditional Lunch", description: "Authentic midday meal", cost: 18, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lunch+Restaurant" },
        { name: "Neighborhood Restaurant", description: "Evening local specialties", cost: 25, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Dinner+Restaurant" },
      ],
      "fine": [
        { name: "Gourmet Café", description: "Upscale breakfast", cost: 20, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gourmet+Breakfast" },
        { name: "Fine Dining Lunch", description: "Elegant midday meal", cost: 40, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fine+Dining+Restaurant" },
        { name: "Premium Restaurant", description: "Sophisticated dinner experience", cost: 75, googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Premium+Restaurant" },
      ],
    }
  };

  // Get food options for the specified city or use default
  const cityOptions = foodOptions[city] || foodOptions["default"];
  // Return food options based on type or default to local
  const options = cityOptions[type] || cityOptions["local"];
  return options[Math.floor(Math.random() * options.length)];
}

async function generateItinerary(formData: any) {
  const { 
    destination, 
    country, 
    days, 
    totalBudget, 
    preferences,
    startDate,
    endDate 
  } = formData;

  // Generate budget allocation
  const budgetAllocation = generateBudgetAllocation(totalBudget, preferences);
  
  // Daily budget allocation
  const dailyAccommodation = Math.round(budgetAllocation.accommodation / days);
  const dailyFood = Math.round(budgetAllocation.food / days);
  const dailyActivities = Math.round(budgetAllocation.activities / days);
  const dailyTransportation = Math.round(budgetAllocation.transportation / days);
  
  // Generate itinerary days
  const itineraryDays = [];
  
  for (let i = 0; i < days; i++) {
    // Parse the startDate if it exists
    let currentDate = null;
    if (startDate) {
      currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
    }
    
    // Generate activities for the day based on preferences
    const dayActivities = [];
    for (let j = 0; j < 2; j++) {
      dayActivities.push(await generateAttraction(destination, country));
    }
    
    // Generate accommodation
    const accommodation = await generateAccommodation(destination, country, preferences.accommodation);
    
    // Generate food options
    const breakfast = await generateFood(destination, country, preferences.food);
    const lunch = await generateFood(destination, country, preferences.food);
    const dinner = await generateFood(destination, country, preferences.food);
    
    const dayItinerary = {
      day: i + 1,
      date: currentDate ? currentDate.toISOString().split('T')[0] : null,
      title: `Day ${i + 1}: ${dayActivities[0].name}`,
      accommodation: {
        ...accommodation,
        costPerNight: accommodation.cost
      },
      meals: [
        { type: "breakfast", ...breakfast },
        { type: "lunch", ...lunch },
        { type: "dinner", ...dinner }
      ],
      activities: dayActivities,
      transportation: {
        type: "Local Transit",
        description: "Daily public transportation",
        cost: dailyTransportation,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=public+transportation+${encodeURIComponent(destination)}`
      },
      dailyCost: dailyAccommodation + dailyFood + dailyActivities + dailyTransportation,
      summary: `Explore ${destination} with a visit to ${dayActivities[0].name} and ${dayActivities[1].name}. Stay at ${accommodation.name} and enjoy local cuisine.`
    };
    
    itineraryDays.push(dayItinerary);
  }
  
  // Construct the complete itinerary object
  const itinerary = {
    destination,
    country,
    days,
    totalBudget,
    budgetAllocation,
    preferences,
    dates: {
      start: startDate,
      end: endDate
    },
    itineraryDays
  };
  
  return itinerary;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Indian destinations data
  try {
    await storage.initializeIndianDestinations();
    console.log("Indian destinations initialized successfully");
  } catch (error) {
    console.error("Error initializing Indian destinations:", error);
  }
  // API routes
  app.get("/api/destinations", async (req: Request, res: Response) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.post("/api/generate-itinerary", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validated = itineraryFormSchema.parse(req.body);
      
      // Generate itinerary based on form data
      const generatedItinerary = await generateItinerary(validated);
      
      // In a real application, you might want to save this itinerary
      // for now, we'll just return it
      res.json(generatedItinerary);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error generating itinerary:", error);
        res.status(500).json({ message: "Failed to generate itinerary" });
      }
    }
  });

  app.post("/api/save-itinerary", async (req: Request, res: Response) => {
    try {
      const { itineraryData } = req.body;
      
      if (!itineraryData) {
        return res.status(400).json({ message: "Itinerary data is required" });
      }
      
      // Convert dates to strings for storage
      const startDateStr = itineraryData.dates?.start || null;
      const endDateStr = itineraryData.dates?.end || null;
      
      const newItinerary = await storage.createItinerary({
        destination: itineraryData.destination,
        country: itineraryData.country || "",
        startDate: startDateStr,
        endDate: endDateStr,
        totalBudget: itineraryData.totalBudget,
        days: itineraryData.days,
        preferences: itineraryData.preferences,
        itineraryData: itineraryData,
        userId: null, // In a real app, you'd get this from authentication
        createdAt: new Date().toISOString(),
      });
      
      res.status(201).json(newItinerary);
    } catch (error) {
      console.error("Error saving itinerary:", error);
      res.status(500).json({ message: "Failed to save itinerary" });
    }
  });

  app.get("/api/itineraries", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const itineraries = await storage.getItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.get("/api/itineraries/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const itinerary = await storage.getItinerary(id);
      
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      
      res.json(itinerary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch itinerary" });
    }
  });

  // New API endpoints for Triposo and Yelp integration
  app.get("/api/destination-info", async (req: Request, res: Response) => {
    try {
      const { city, country } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const destinationInfo = await TriposoService.getDestinationInfo(city as string, country as string);
      
      if (!destinationInfo) {
        return res.status(404).json({ message: "Destination information not found" });
      }
      
      res.json(destinationInfo);
    } catch (error) {
      console.error("Error fetching destination info:", error);
      res.status(500).json({ message: "Failed to fetch destination information" });
    }
  });

  app.get("/api/points-of-interest", async (req: Request, res: Response) => {
    try {
      const { city, country, count } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const pointsOfInterest = await TriposoService.getPointsOfInterest(
        city as string, 
        country as string, 
        count ? parseInt(count as string) : 10
      );
      
      res.json(pointsOfInterest);
    } catch (error) {
      console.error("Error fetching points of interest:", error);
      res.status(500).json({ message: "Failed to fetch points of interest" });
    }
  });

  app.get("/api/accommodations", async (req: Request, res: Response) => {
    try {
      const { city, country, type, count } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const accommodations = await TriposoService.getAccommodations(
        city as string, 
        country as string, 
        type as string || 'mid-range', 
        count ? parseInt(count as string) : 10
      );
      
      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const { city, country, type, limit } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const restaurants = await YelpService.searchRestaurants(
        city as string, 
        country as string, 
        type as string || 'local', 
        limit ? parseInt(limit as string) : 10
      );
      
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurant/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }
      
      const restaurant = await YelpService.getRestaurantDetails(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      res.status(500).json({ message: "Failed to fetch restaurant details" });
    }
  });

  app.get("/api/restaurant/:id/reviews", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }
      
      const reviews = await YelpService.getRestaurantReviews(id);
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching restaurant reviews:", error);
      res.status(500).json({ message: "Failed to fetch restaurant reviews" });
    }
  });

  app.get("/api/tour-activities", async (req: Request, res: Response) => {
    try {
      const { city, country, count } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const tourActivities = await TriposoService.getTourActivities(
        city as string, 
        country as string, 
        count ? parseInt(count as string) : 10
      );
      
      res.json(tourActivities);
    } catch (error) {
      console.error("Error fetching tour activities:", error);
      res.status(500).json({ message: "Failed to fetch tour activities" });
    }
  });

  app.get("/api/day-plans", async (req: Request, res: Response) => {
    try {
      const { city, country } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const dayPlans = await TriposoService.getDayPlans(city as string, country as string);
      
      res.json(dayPlans);
    } catch (error) {
      console.error("Error fetching day plans:", error);
      res.status(500).json({ message: "Failed to fetch day plans" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
