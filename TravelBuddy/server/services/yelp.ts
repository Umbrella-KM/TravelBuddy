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
   * @param city The name of the city
   * @param country The country (optional)
   * @param type Food type/category (budget, local, fine)
   * @param limit Number of results to return
   * @returns Array of restaurants
   */
  static async searchRestaurants(city: string, country?: string, type: string = 'local', limit: number = 10) {
    try {
      // Create location string
      const location = country ? `${city}, ${country}` : city;
      
      // Map food type to price range
      let price;
      switch (type) {
        case 'budget':
          price = '1,2'; // $ and $$
          break;
        case 'fine':
          price = '3,4'; // $$$ and $$$$
          break;
        case 'local':
        default:
          price = '1,2,3'; // $, $$, and $$$
          break;
      }
      
      // Set categories based on type
      let categories = 'restaurants';
      if (type === 'fine') {
        categories = 'restaurants,gourmet';
      }
      
      const response = await axios.get(`${YELP_API_URL}/businesses/search`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`
        },
        params: {
          location: location,
          term: 'restaurants',
          categories: categories,
          price: price,
          limit: limit,
          sort_by: 'rating'
        }
      });
      
      return this.processYelpRestaurants(response.data.businesses, type);
    } catch (error) {
      console.error('Error fetching restaurants from Yelp:', error);
      return [];
    }
  }

  /**
   * Get details for a specific restaurant
   * 
   * @param id Yelp business ID
   * @returns Restaurant details
   */
  static async getRestaurantDetails(id: string) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/${id}`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant details from Yelp:', error);
      return null;
    }
  }

  /**
   * Get reviews for a specific restaurant
   * 
   * @param id Yelp business ID
   * @returns Restaurant reviews
   */
  static async getRestaurantReviews(id: string) {
    try {
      const response = await axios.get(`${YELP_API_URL}/businesses/${id}/reviews`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`
        }
      });
      
      return response.data.reviews;
    } catch (error) {
      console.error('Error fetching restaurant reviews from Yelp:', error);
      return [];
    }
  }

  /**
   * Process Yelp restaurants into a standardized format
   */
  private static processYelpRestaurants(restaurants: any[], type: string) {
    return restaurants.map(restaurant => {
      // Estimate cost based on price and type
      let cost = 20; // Default mid-range
      if (restaurant.price) {
        switch (restaurant.price) {
          case '$': cost = 10; break;     // Budget
          case '$$': cost = 20; break;    // Mid-range
          case '$$$': cost = 40; break;   // Upscale
          case '$$$$': cost = 80; break;  // Fine dining
        }
      } else {
        // If no price is provided, estimate based on type
        if (type === 'budget') cost = 10;
        else if (type === 'fine') cost = 60;
      }
      
      // Get cuisine type from categories
      let cuisineType = 'Local cuisine';
      if (restaurant.categories && restaurant.categories.length > 0) {
        cuisineType = restaurant.categories[0].title;
      }
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        description: `${cuisineType} restaurant`,
        type: type,
        cost: cost,
        rating: restaurant.rating,
        reviewCount: restaurant.review_count,
        imageUrl: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        address: restaurant.location.display_address.join(', '),
        phone: restaurant.display_phone,
        coordinates: {
          latitude: restaurant.coordinates.latitude,
          longitude: restaurant.coordinates.longitude
        },
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.location.display_address.join(' '))}`,
        yelpUrl: restaurant.url,
        categories: restaurant.categories
      };
    });
  }
}

