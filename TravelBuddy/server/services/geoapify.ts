import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Geoapify API credentials
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '';

// Base URL for Geoapify API
const GEOAPIFY_API_URL = 'https://api.geoapify.com/v2/places';

/**
 * Service for interacting with Geoapify Places API
 */
export class GeoapifyService {
  /**
   * Get accommodations for a destination
   * 
   * @param city The city name
   * @param country Optional country name
   * @param type Accommodation type (budget, mid-range, luxury)
   * @param count Number of accommodations to return
   * @returns Array of accommodations
   */
  static async getAccommodations(city: string, country?: string, type: string = 'mid-range', count: number = 10) {
    try {
      // Map preference type to accommodation categories
      let categories: string;
      switch (type) {
        case 'budget':
          categories = 'accommodation.hostel,accommodation.guest_house';
          break;
        case 'luxury':
          categories = 'accommodation.hotel.luxury';
          break;
        case 'mid-range':
        default:
          categories = 'accommodation.hotel';
          break;
      }
      
      // Build the location query
      let locationQuery = city;
      if (country) {
        locationQuery = `${city}, ${country}`;
      }
      
      const response = await axios.get(GEOAPIFY_API_URL, {
        params: {
          categories,
          filter: `place:${encodeURIComponent(locationQuery)}`,
          limit: count,
          apiKey: GEOAPIFY_API_KEY
        }
      });

      if (!response.data || !response.data.features) {
        return [];
      }

      return this.processGeoapifyAccommodations(response.data.features, type);
    } catch (error) {
      console.error('Error fetching accommodations from Geoapify:', error);
      return [];
    }
  }

  /**
   * Get food places for a destination
   * 
   * @param city The city name
   * @param country Optional country name
   * @param type Food preference type (budget, local, fine)
   * @param count Number of food places to return
   * @returns Array of food places
   */
  static async getFoodPlaces(city: string, country?: string, type: string = 'local', count: number = 10) {
    try {
      // Map preference type to food categories
      let categories: string;
      switch (type) {
        case 'budget':
          categories = 'catering.fast_food,catering.food_court';
          break;
        case 'fine':
          categories = 'catering.restaurant.gourmet';
          break;
        case 'local':
        default:
          categories = 'catering.restaurant';
          break;
      }
      
      // Build the location query
      let locationQuery = city;
      if (country) {
        locationQuery = `${city}, ${country}`;
      }
      
      const response = await axios.get(GEOAPIFY_API_URL, {
        params: {
          categories,
          filter: `place:${encodeURIComponent(locationQuery)}`,
          limit: count,
          apiKey: GEOAPIFY_API_KEY
        }
      });

      if (!response.data || !response.data.features) {
        return [];
      }

      return this.processGeoapifyFoodPlaces(response.data.features, type);
    } catch (error) {
      console.error('Error fetching food places from Geoapify:', error);
      return [];
    }
  }

  /**
   * Process Geoapify accommodation data into a standardized format
   */
  private static processGeoapifyAccommodations(accommodations: any[], type: string) {
    return accommodations.map(accommodation => {
      const properties = accommodation.properties;
      
      // Estimate cost based on accommodation type
      let costPerNight: number;
      let rating: number;
      
      switch (type) {
        case 'budget':
          costPerNight = Math.floor(Math.random() * 30) + 40; // $40-$70
          rating = Math.floor(Math.random() * 10) / 10 + 3.0; // 3.0-4.0
          break;
        case 'luxury':
          costPerNight = Math.floor(Math.random() * 150) + 200; // $200-$350
          rating = Math.floor(Math.random() * 10) / 10 + 4.0; // 4.0-5.0
          break;
        case 'mid-range':
        default:
          costPerNight = Math.floor(Math.random() * 50) + 100; // $100-$150
          rating = Math.floor(Math.random() * 10) / 10 + 3.5; // 3.5-4.5
          break;
      }
      
      // Adjust for India if applicable
      if (properties.country === 'India') {
        costPerNight = Math.round(costPerNight * 0.6); // Lower prices for India
      }
      
      // Generate a description based on available data
      let description = properties.name;
      if (properties.categories) {
        const categories = properties.categories.split(',');
        if (categories.includes('accommodation.hotel.luxury')) {
          description = `Luxury hotel in ${properties.city || properties.suburb || ''}`;
        } else if (categories.includes('accommodation.hotel')) {
          description = `Hotel in ${properties.city || properties.suburb || ''}`;
        } else if (categories.includes('accommodation.hostel')) {
          description = `Hostel in ${properties.city || properties.suburb || ''}`;
        } else if (categories.includes('accommodation.guest_house')) {
          description = `Guest house in ${properties.city || properties.suburb || ''}`;
        }
      }
      
      // Get a random hotel image from Unsplash
      const imageUrl = `https://source.unsplash.com/random/800x600/?hotel,${type}`;
      
      return {
        id: properties.place_id,
        name: properties.name,
        description,
        costPerNight,
        cost: costPerNight, // For compatibility
        rating,
        imageUrl,
        coordinates: {
          latitude: properties.lat,
          longitude: properties.lon
        },
        address: properties.formatted,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${properties.lat},${properties.lon}`
      };
    });
  }

  /**
   * Process Geoapify food place data into a standardized format
   */
  private static processGeoapifyFoodPlaces(foodPlaces: any[], type: string) {
    return foodPlaces.map(place => {
      const properties = place.properties;
      
      // Estimate cost based on food type
      let cost: number;
      
      switch (type) {
        case 'budget':
          cost = Math.floor(Math.random() * 5) + 5; // $5-$10
          break;
        case 'fine':
          cost = Math.floor(Math.random() * 30) + 40; // $40-$70
          break;
        case 'local':
        default:
          cost = Math.floor(Math.random() * 10) + 15; // $15-$25
          break;
      }
      
      // Adjust for India if applicable
      if (properties.country === 'India') {
        cost = Math.round(cost * 0.5); // Lower prices for India
      }
      
      // Determine cuisine type from categories
      let cuisineType = 'Local cuisine';
      if (properties.categories) {
        const categories = properties.categories.split(',');
        for (const category of categories) {
          if (category.startsWith('catering.restaurant.')) {
            cuisineType = category.replace('catering.restaurant.', '').replace('_', ' ');
            cuisineType = cuisineType.charAt(0).toUpperCase() + cuisineType.slice(1);
            break;
          }
        }
      }
      
      // Get a random food image from Unsplash
      const imageUrl = `https://source.unsplash.com/random/800x600/?food,${type}`;
      
      return {
        id: properties.place_id,
        name: properties.name,
        type,
        description: `${cuisineType} restaurant`,
        cost,
        imageUrl,
        coordinates: {
          latitude: properties.lat,
          longitude: properties.lon
        },
        address: properties.formatted,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${properties.lat},${properties.lon}`
      };
    });
  }
}

