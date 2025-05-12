import { 
  users, type User, type InsertUser, 
  destinations, type Destination, type InsertDestination,
  itineraries, type Itinerary, type InsertItinerary
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations);
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || undefined;
  }

  async getDestinationByName(name: string): Promise<Destination | undefined> {
    const [destination] = await db
      .select()
      .from(destinations)
      .where(
        eq(destinations.name, name)
      );
    return destination || undefined;
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const [destination] = await db
      .insert(destinations)
      .values(insertDestination)
      .returning();
    return destination;
  }

  // Itinerary methods
  async getItineraries(userId?: number): Promise<Itinerary[]> {
    if (userId) {
      return await db
        .select()
        .from(itineraries)
        .where(eq(itineraries.userId, userId));
    }
    return await db.select().from(itineraries);
  }

  async getItinerary(id: number): Promise<Itinerary | undefined> {
    const [itinerary] = await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.id, id));
    return itinerary || undefined;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const [itinerary] = await db
      .insert(itineraries)
      .values(insertItinerary)
      .returning();
    return itinerary;
  }

  async updateItinerary(id: number, partialItinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const [updatedItinerary] = await db
      .update(itineraries)
      .set(partialItinerary)
      .where(eq(itineraries.id, id))
      .returning();
    return updatedItinerary || undefined;
  }

  async deleteItinerary(id: number): Promise<boolean> {
    const result = await db
      .delete(itineraries)
      .where(eq(itineraries.id, id))
      .returning();
    return result.length > 0;
  }

  // Helper method to initialize Indian destinations data
  async initializeIndianDestinations(): Promise<void> {
    // First check if destinations already exist
    const existingDestinations = await this.getDestinations();
    if (existingDestinations.some(d => d.country === "India")) {
      return; // Indian destinations already exist
    }

    const indianDestinations = [
      { 
        name: "Delhi", 
        country: "India", 
        description: "India's historic capital city with rich Mughal heritage", 
        imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Red Fort, India Gate, Qutub Minar, street food",
        localLanguage: "Hindi, Urdu"
      },
      { 
        name: "Mumbai", 
        country: "India", 
        description: "The financial capital and entertainment hub of India", 
        imageUrl: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7",
        region: "Western India",
        bestTimeToVisit: "November to February",
        famousFor: "Gateway of India, Bollywood, Marine Drive, street food",
        localLanguage: "Marathi, Hindi"
      },
      { 
        name: "Jaipur", 
        country: "India", 
        description: "The Pink City known for its stunning palaces and forts", 
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Hawa Mahal, City Palace, Amber Fort, textiles",
        localLanguage: "Hindi, Rajasthani"
      },
      { 
        name: "Agra", 
        country: "India", 
        description: "Home to the iconic Taj Mahal", 
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Taj Mahal, Agra Fort, Fatehpur Sikri",
        localLanguage: "Hindi, Urdu"
      },
      { 
        name: "Varanasi", 
        country: "India", 
        description: "The spiritual capital of India on the banks of the Ganges", 
        imageUrl: "https://images.unsplash.com/photo-1561361058-c24cecde1159",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Ghats, Ganga Aarti, temples, silk weaving",
        localLanguage: "Hindi, Bhojpuri"
      },
      { 
        name: "Goa", 
        country: "India", 
        description: "Beautiful beaches and Portuguese heritage", 
        imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
        region: "Western India",
        bestTimeToVisit: "November to February",
        famousFor: "Beaches, nightlife, Portuguese architecture, seafood",
        localLanguage: "Konkani, Marathi"
      },
      { 
        name: "Kolkata", 
        country: "India", 
        description: "City of Joy with rich cultural heritage", 
        imageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255",
        region: "Eastern India",
        bestTimeToVisit: "October to March",
        famousFor: "Victoria Memorial, Howrah Bridge, literature, sweets",
        localLanguage: "Bengali"
      },
      { 
        name: "Udaipur", 
        country: "India", 
        description: "City of Lakes with romantic atmosphere", 
        imageUrl: "https://images.unsplash.com/photo-1602642977157-f0d1ce405303",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Lake Palace, City Palace, romantic settings",
        localLanguage: "Hindi, Rajasthani"
      },
      { 
        name: "Amritsar", 
        country: "India", 
        description: "Home to the Golden Temple and Sikh heritage", 
        imageUrl: "https://images.unsplash.com/photo-1590090232385-005bbe46273c",
        region: "Northern India",
        bestTimeToVisit: "October to March",
        famousFor: "Golden Temple, Wagah Border, Punjabi cuisine",
        localLanguage: "Punjabi"
      },
      { 
        name: "Darjeeling", 
        country: "India", 
        description: "Tea plantations and Himalayan views", 
        imageUrl: "https://images.unsplash.com/photo-1606117331085-5760e3b58520",
        region: "Eastern India",
        bestTimeToVisit: "April to June, September to November",
        famousFor: "Tea gardens, toy train, Kanchenjunga views",
        localLanguage: "Nepali, Bengali"
      },
      { 
        name: "Rishikesh", 
        country: "India", 
        description: "Yoga capital of the world on the banks of the Ganges", 
        imageUrl: "https://images.unsplash.com/photo-1588970698009-c9b338ac00ea",
        region: "Northern India",
        bestTimeToVisit: "September to April",
        famousFor: "Yoga, meditation, river rafting, Beatles Ashram",
        localLanguage: "Hindi, Garhwali"
      },
      { 
        name: "Chennai", 
        country: "India", 
        description: "Cultural capital of South India with beautiful beaches", 
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
        region: "Southern India",
        bestTimeToVisit: "November to February",
        famousFor: "Marina Beach, temples, Carnatic music, South Indian cuisine",
        localLanguage: "Tamil"
      },
      { 
        name: "Kochi", 
        country: "India", 
        description: "Historic port city with diverse cultural influences", 
        imageUrl: "https://images.unsplash.com/photo-1590123292784-ea000b38b3be",
        region: "Southern India",
        bestTimeToVisit: "October to March",
        famousFor: "Chinese fishing nets, Fort Kochi, spice markets",
        localLanguage: "Malayalam"
      },
    ];

    // Add Indian destinations
    for (const destination of indianDestinations) {
      await this.createDestination(destination);
    }
  }
}