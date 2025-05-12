import { pgTable, text, serial, integer, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (preserved from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Travel Destination schema
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  // India-specific fields
  region: text("region"),  // Northern, Southern, Eastern, Western, Central India
  bestTimeToVisit: text("best_time_to_visit"), // Winter, Summer, Monsoon
  famousFor: text("famous_for"), // What the destination is known for (temples, beaches, food, etc)
  localLanguage: text("local_language") // Primary local language
});

// Itinerary schema
export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  destination: text("destination").notNull(),
  country: text("country"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  totalBudget: integer("total_budget").notNull(),
  days: integer("days").notNull(),
  preferences: jsonb("preferences").notNull(),
  itineraryData: jsonb("itinerary_data").notNull(),
  createdAt: date("created_at").notNull(),
});

// Define the preferences schema
export const preferencesSchema = z.object({
  accommodation: z.enum(["budget", "mid-range", "luxury"]),
  food: z.enum(["budget", "local", "fine"]),
  activities: z.array(z.enum([
    "sightseeing", 
    "cultural", 
    "adventure", 
    "relaxation", 
    "shopping", 
    "nightlife",
    // India-specific activities
    "temple-visits",
    "heritage-sites",
    "ayurveda-wellness",
    "wildlife-safari",
    "backwaters",
    "street-food-tours",
    "handicrafts",
    "yoga-meditation",
    "hill-stations",
    "desert-exploration"
  ])),
});

// Define the budget allocation schema
export const budgetAllocationSchema = z.object({
  accommodation: z.number(),
  food: z.number(),
  activities: z.number(),
  transportation: z.number(),
});

// Define the itinerary form schema (used for API requests)
export const itineraryFormSchema = z.object({
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  country: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.number().min(1, "Trip must be at least 1 day").max(30, "Trip cannot exceed 30 days"),
  totalBudget: z.number().min(200, "Budget must be at least $200"),
  preferences: preferencesSchema,
});

// Define insert schemas
export const insertDestinationSchema = createInsertSchema(destinations);
export const insertItinerarySchema = createInsertSchema(itineraries);

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = typeof itineraries.$inferSelect;

export type Preferences = z.infer<typeof preferencesSchema>;
export type BudgetAllocation = z.infer<typeof budgetAllocationSchema>;
export type ItineraryForm = z.infer<typeof itineraryFormSchema>;
