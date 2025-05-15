import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Triposo API credentials
const TRIPOSO_API_TOKEN = process.env.TRIPOSO_API_TOKEN || '';
const TRIPOSO_ACCOUNT = process.env.TRIPOSO_ACCOUNT || '';

// Base URL for Triposo API
const TRIPOSO_API_URL = 'https://www.triposo.com/api/20220104';

/**
 * Service for interacting with Triposo API
 */
export class TriposoService {
  /**
   * Get destination information
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @returns Destination information
   */
  static async getDestinationInfo(city: string, country?: string) {
    try {
      const locationId = country ? `${city.toLowerCase()}_${country.toLowerCase()}` : city.toLowerCase();
      
      const response = await axios.get(`${TRIPOSO_API_URL}/location.json`, {
        params: {
          id: locationId,
          fields: 'id,name,snippet,intro,images,coordinates,properties',
          account: TRIPOSO_ACCOUNT,
          token: TRIPOSO_API_TOKEN
        }
      });
      
      return response.data.results[0] || null;
    } catch (error) {
      console.error('Error fetching destination info from Triposo:', error);
      return null;
    }
  }

  /**
   * Get points of interest for a destination
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @param count Number of POIs to return
   * @returns Array of points of interest
   */
  static async getPointsOfInterest(city: string, country?: string, count: number = 10) {
    try {
      const locationId = country ? `${city.toLowerCase()}_${country.toLowerCase()}` : city.toLowerCase();
      
      const response = await axios.get(`${TRIPOSO_API_URL}/poi.json`, {
        params: {
          location_id: locationId,
          count: count,
          fields: 'id,name,snippet,intro,images,coordinates,properties,score,price_tier,tag_labels',
          order_by: '-score',
          account: TRIPOSO_ACCOUNT,
          token: TRIPOSO_API_TOKEN
        }
      });
      
      return this.processTriposoPOIs(response.data.results);
    } catch (error) {
      console.error('Error fetching POIs from Triposo:', error);
      return [];
    }
  }

  /**
   * Get accommodations for a destination
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @param type Accommodation type (budget, mid-range, luxury)
   * @param count Number of accommodations to return
   * @returns Array of accommodations
   */
  static async getAccommodations(city: string, country?: string, type: string = 'mid-range', count: number = 10) {
    try {
      const locationId = country ? `${city.toLowerCase()}_${country.toLowerCase()}` : city.toLowerCase();
      
      // Map accommodation type to price tier
      let priceTier;
      switch (type) {
        case 'budget':
          priceTier = 'price_tier:1,price_tier:2';
          break;
        case 'luxury':
          priceTier = 'price_tier:4,price_tier:5';
          break;
        case 'mid-range':
        default:
          priceTier = 'price_tier:3';
          break;
      }
      
      const response = await axios.get(`${TRIPOSO_API_URL}/poi.json`, {
        params: {
          location_id: locationId,
          tag_labels: 'hotels',
          count: count,
          fields: 'id,name,snippet,intro,images,coordinates,properties,score,price_tier,tag_labels',
          order_by: '-score',
          annotate: priceTier,
          account: TRIPOSO_ACCOUNT,
          token: TRIPOSO_API_TOKEN
        }
      });
      
      return this.processTriposoAccommodations(response.data.results, type);
    } catch (error) {
      console.error('Error fetching accommodations from Triposo:', error);
      return [];
    }
  }

  /**
   * Get tour activities for a destination
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @param count Number of tours to return
   * @returns Array of tour activities
   */
  static async getTourActivities(city: string, country?: string, count: number = 10) {
    try {
      const locationId = country ? `${city.toLowerCase()}_${country.toLowerCase()}` : city.toLowerCase();
      
      const response = await axios.get(`${TRIPOSO_API_URL}/tour.json`, {
        params: {
          location_ids: locationId,
          count: count,
          fields: 'id,name,intro,images,price,duration,vendor,booking_info',
          order_by: '-score',
          account: TRIPOSO_ACCOUNT,
          token: TRIPOSO_API_TOKEN
        }
      });
      
      return this.processTriposoTours(response.data.results);
    } catch (error) {
      console.error('Error fetching tour activities from Triposo:', error);
      return [];
    }
  }

  /**
   * Get day plans for a destination
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @returns Array of day plans
   */
  static async getDayPlans(city: string, country?: string) {
    try {
      const locationId = country ? `${city.toLowerCase()}_${country.toLowerCase()}` : city.toLowerCase();
      
      const response = await axios.get(`${TRIPOSO_API_URL}/day_planner.json`, {
        params: {
          location_id: locationId,
          max_distance: 20000,
          fields: 'id,name,description,segments',
          account: TRIPOSO_ACCOUNT,
          token: TRIPOSO_API_TOKEN
        }
      });
      
      return response.data.results;
    } catch (error) {
      console.error('Error fetching day plans from Triposo:', error);
      return [];
    }
  }

  /**
   * Process Triposo POIs into a standardized format
   */
  private static processTriposoPOIs(pois: any[]) {
    return pois.map(poi => {
      // Get the first image if available
      const imageUrl = poi.images && poi.images.length > 0 
        ? poi.images[0].sizes.medium.url 
        : 'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f';
      
      // Estimate cost based on price tier
      let estimatedCost = 0;
      if (poi.price_tier) {
        switch (poi.price_tier) {
          case 1: estimatedCost = 0; break;     // Free
          case 2: estimatedCost = 10; break;    // Budget
          case 3: estimatedCost = 20; break;    // Mid-range
          case 4: estimatedCost = 35; break;    // Upscale
          case 5: estimatedCost = 50; break;    // Luxury
        }
      }
      
      // Estimate duration based on POI type
      let estimatedDuration = '1-2 hours';
      if (poi.tag_labels) {
        if (poi.tag_labels.includes('museums')) estimatedDuration = '2-3 hours';
        else if (poi.tag_labels.includes('amusement_parks')) estimatedDuration = '3-4 hours';
        else if (poi.tag_labels.includes('monuments')) estimatedDuration = '30 minutes';
        else if (poi.tag_labels.includes('natural')) estimatedDuration = '2-3 hours';
      }
      
      return {
        id: poi.id,
        name: poi.name,
        description: poi.snippet || poi.intro || 'A popular attraction',
        type: this.determinePOIType(poi.tag_labels),
        estimatedCost: estimatedCost,
        estimatedDuration: estimatedDuration,
        imageUrl: imageUrl,
        coordinates: poi.coordinates,
        score: poi.score,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.name + ' ' + (poi.location_id || ''))}`,
        tags: poi.tag_labels || []
      };
    });
  }

  /**
   * Process Triposo accommodations into a standardized format
   */
  private static processTriposoAccommodations(accommodations: any[], type: string) {
    return accommodations.map(accommodation => {
      // Get the first image if available
      const imageUrl = accommodation.images && accommodation.images.length > 0 
        ? accommodation.images[0].sizes.medium.url 
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
      
      // Estimate cost based on price tier and accommodation type
      let costPerNight = 100; // Default mid-range
      if (type === 'budget') costPerNight = 50;
      else if (type === 'luxury') costPerNight = 250;
      
      // Adjust based on price tier if available
      if (accommodation.price_tier) {
        switch (accommodation.price_tier) {
          case 1: costPerNight = 30; break;     // Very budget
          case 2: costPerNight = 60; break;     // Budget
          case 3: costPerNight = 120; break;    // Mid-range
          case 4: costPerNight = 200; break;    // Upscale
          case 5: costPerNight = 350; break;    // Luxury
        }
      }
      
      // Estimate rating based on score
      let rating = 3.5;
      if (accommodation.score) {
        // Convert score (typically 0-10) to rating (1-5)
        rating = Math.min(5, Math.max(1, (accommodation.score / 2)));
      }
      
      return {
        id: accommodation.id,
        name: accommodation.name,
        description: accommodation.snippet || accommodation.intro || 'A comfortable place to stay',
        costPerNight: costPerNight,
        rating: rating.toFixed(1),
        imageUrl: imageUrl,
        coordinates: accommodation.coordinates,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name + ' ' + (accommodation.location_id || ''))}`,
        type: type
      };
    });
  }

  /**
   * Process Triposo tours into a standardized format
   */
  private static processTriposoTours(tours: any[]) {
    return tours.map(tour => {
      // Get the first image if available
      const imageUrl = tour.images && tour.images.length > 0 
        ? tour.images[0].sizes.medium.url 
        : 'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f';
      
      // Extract price if available
      let cost = 0;
      if (tour.price && tour.price.amount) {
        cost = tour.price.amount;
      }
      
      return {
        id: tour.id,
        name: tour.name,
        description: tour.intro || 'An exciting tour experience',
        cost: cost,
        duration: tour.duration || '2-3 hours',
        imageUrl: imageUrl,
        bookingInfo: tour.booking_info || null,
        vendor: tour.vendor || null
      };
    });
  }

  /**
   * Determine the general type of POI based on Triposo tags
   */
  private static determinePOIType(tags: string[] = []) {
    if (tags.includes('museums')) return 'museum';
    if (tags.includes('natural')) return 'nature';
    if (tags.includes('beaches')) return 'beach';
    if (tags.includes('amusement_parks')) return 'amusement_park';
    if (tags.includes('monuments')) return 'monument';
    if (tags.includes('historic')) return 'historic';
    if (tags.includes('cultural')) return 'cultural';
    if (tags.includes('shopping')) return 'shopping';
    if (tags.includes('nightlife')) return 'nightlife';
    if (tags.includes('foods')) return 'food';
    return 'attraction';
  }
}

