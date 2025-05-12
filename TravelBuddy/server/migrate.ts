import { db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

// This script creates all the tables defined in our schema
async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Create tables in order of dependencies
    console.log('Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    console.log('Creating/updating destinations table...');
    // First, create the base table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        description TEXT,
        image_url TEXT
      );
    `);
    
    // Now add the new columns if they don't exist
    // Add region column
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'destinations' AND column_name = 'region'
        ) THEN
          ALTER TABLE destinations ADD COLUMN region TEXT;
        END IF;
      END $$;
    `);
    
    // Add best_time_to_visit column
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'destinations' AND column_name = 'best_time_to_visit'
        ) THEN
          ALTER TABLE destinations ADD COLUMN best_time_to_visit TEXT;
        END IF;
      END $$;
    `);
    
    // Add famous_for column
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'destinations' AND column_name = 'famous_for'
        ) THEN
          ALTER TABLE destinations ADD COLUMN famous_for TEXT;
        END IF;
      END $$;
    `);
    
    // Add local_language column
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'destinations' AND column_name = 'local_language'
        ) THEN
          ALTER TABLE destinations ADD COLUMN local_language TEXT;
        END IF;
      END $$;
    `);
    
    console.log('Creating itineraries table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS itineraries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        destination TEXT NOT NULL,
        country TEXT,
        start_date DATE,
        end_date DATE,
        total_budget INTEGER NOT NULL,
        days INTEGER NOT NULL,
        preferences JSONB NOT NULL,
        itinerary_data JSONB NOT NULL,
        created_at DATE NOT NULL
      );
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();