import { 
  users, type User, type InsertUser, 
  destinations, type Destination, type InsertDestination,
  itineraries, type Itinerary, type InsertItinerary
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Destination methods
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  getDestinationByName(name: string): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;

  // Itinerary methods
  getItineraries(userId?: number): Promise<Itinerary[]>;
  getItinerary(id: number): Promise<Itinerary | undefined>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  updateItinerary(id: number, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined>;
  deleteItinerary(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private destinations: Map<number, Destination>;
  private itineraries: Map<number, Itinerary>;
  currentUserId: number;
  currentDestinationId: number;
  currentItineraryId: number;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.itineraries = new Map();
    this.currentUserId = 1;
    this.currentDestinationId = 1;
    this.currentItineraryId = 1;

    // Initialize with some popular destinations
    this.initializeDestinations();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async getDestinationByName(name: string): Promise<Destination | undefined> {
    return Array.from(this.destinations.values()).find(
      (destination) => destination.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = this.currentDestinationId++;
    const destination: Destination = { ...insertDestination, id };
    this.destinations.set(id, destination);
    return destination;
  }

  // Itinerary methods
  async getItineraries(userId?: number): Promise<Itinerary[]> {
    const itineraries = Array.from(this.itineraries.values());
    if (userId) {
      return itineraries.filter(itinerary => itinerary.userId === userId);
    }
    return itineraries;
  }

  async getItinerary(id: number): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.currentItineraryId++;
    const itinerary: Itinerary = { ...insertItinerary, id };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async updateItinerary(id: number, partialItinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const existingItinerary = this.itineraries.get(id);
    if (!existingItinerary) return undefined;

    const updatedItinerary = { ...existingItinerary, ...partialItinerary };
    this.itineraries.set(id, updatedItinerary);
    return updatedItinerary;
  }

  async deleteItinerary(id: number): Promise<boolean> {
    return this.itineraries.delete(id);
  }

  // Initialize with some popular destinations
  private initializeDestinations() {
    const popularDestinations = [
      { name: "Paris", country: "France", description: "The City of Light", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34" },
      { name: "Tokyo", country: "Japan", description: "Modern meets traditional", imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8" },
      { name: "New York", country: "USA", description: "The Big Apple", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9" },
      { name: "Rome", country: "Italy", description: "The Eternal City", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5" },
      { name: "Barcelona", country: "Spain", description: "Catalonian gem", imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4" },
      { name: "Bangkok", country: "Thailand", description: "City of Angels", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5" },
      { name: "Bali", country: "Indonesia", description: "Island of the Gods", imageUrl: "https://images.unsplash.com/photo-1536599424071-0b215a388ba7" },
    ];

    popularDestinations.forEach(destination => {
      const id = this.currentDestinationId++;
      this.destinations.set(id, { ...destination, id });
    });
  }
}

export const storage = new MemStorage();
