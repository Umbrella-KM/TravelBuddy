import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Yelp API credentials
const YELP_API_KEY = process.env.YELP_API_KEY || '';

// Base URL for Yelp API
const YELP_API_URL = 'https://api.yelp.com/v3';

/**
 * Service for interacting with Yelp API
 */
export class YelpService {
  /**
   * Search for restaurants in a location
   * 
   * @param location The location to search in (city, address, etc.)
   * @param term Optional search term (e.g., "coffee", "dinner")
   * @param price Price level (1=budget, 2=mid, 3=mid-high, 4=expensive)
   * @param limit Number of results to return
   * @returns Array of restaurants
   */
  static async searchRestaurants(location: string, term?: string, price?: string, limit: number = 10) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/search`, {
        params: {
          location,
          term: term || 'restaurants',
          price,
          limit,
          sort_by: 'rating'
        },
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`
        }
      });

      return this.processYelpRestaurants(response.data.businesses);
    } catch (error) {
      console.error('Error fetching restaurants from Yelp:', error);
      return [];
    }
  }

  /**
   * Search for restaurants by coordinates
   * 
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @param term Optional search term (e.g., "coffee", "dinner")
   * @param price Price level (1=budget, 2=mid, 3=mid-high, 4=expensive)
   * @param limit Number of results to return
   * @returns Array of restaurants
   */
  static async searchRestaurantsByCoordinates(
    latitude: number, 
    longitude: number, 
    term?: string, 
    price?: string, 
    limit: number = 10
  ) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/search`, {
        params: {
          latitude,
          longitude,
          term: term || 'restaurants',
          price,
          limit,
          sort_by: 'rating'
        },
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`
        }
      });

      return this.processYelpRestaurants(response.data.businesses);
    } catch (error) {
      console.error('Error fetching restaurants from Yelp:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific business
   * 
   * @param businessId The Yelp business ID
   * @returns Detailed business information
   */
  static async getBusinessDetails(businessId: string) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching business details from Yelp:', error);
      return null;
    }
  }

  /**
   * Get reviews for a specific business
   * 
   * @param businessId The Yelp business ID
   * @returns Array of reviews
   */
  static async getBusinessReviews(businessId: string) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/${businessId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`
        }
      });

      return response.data.reviews;
    } catch (error) {
      console.error('Error fetching business reviews from Yelp:', error);
      return [];
    }
  }

  /**
   * Process Yelp restaurant data into a standardized format
   */
  private static processYelpRestaurants(restaurants: any[]) {
    return restaurants.map(restaurant => {
      // Map Yelp price level to our food type
      let foodType = 'local';
      if (restaurant.price) {
        switch (restaurant.price) {
          case '$': foodType = 'budget'; break;
          case '$$': foodType = 'local'; break;
          case '$$$':
          case '$$$$': foodType = 'fine'; break;
        }
      }
      
      // Estimate cost based on price level
      let cost = 20; // Default
      if (restaurant.price) {
        switch (restaurant.price) {
          case '$': cost = 10; break;
          case '$$': cost = 25; break;
          case '$$$': cost = 45; break;
          case '$$$$': cost = 80; break;
        }
      }
      
      // Get cuisine categories
      const categories = restaurant.categories 
        ? restaurant.categories.map((cat: any) => cat.title).join(', ') 
        : 'Restaurant';
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        type: foodType,
        description: categories,
        cost: cost,
        rating: restaurant.rating,
        reviewCount: restaurant.review_count,
        imageUrl: restaurant.image_url,
        coordinates: {
          latitude: restaurant.coordinates.latitude,
          longitude: restaurant.coordinates.longitude
        },
        address: restaurant.location.display_address.join(', '),
        phone: restaurant.display_phone,
        yelpUrl: restaurant.url,
        googleMapsUrl: restaurant.coordinates ? 
          `https://www.google.com/maps/search/?api=1&query=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}` : 
          undefined
      };
    });
  }
}

