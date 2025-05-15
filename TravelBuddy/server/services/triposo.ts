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
   * Get location information for a destination
   * 
   * @param destination The name of the destination (city)
   * @param country Optional country name to narrow down search
   * @returns Location information
   */
  static async getLocationInfo(destination: string, country?: string) {
    try {
      let query = destination;
      if (country) {
        query = `${destination}, ${country}`;
      }

      const response = await axios.get(`${TRIPOSO_API_URL}/location.json`, {
        params: {
          annotate: 'trigram:' + query,
          trigram: '>=0.3',
          fields: 'id,name,score,snippet,country_id,coordinates,images',
          order_by: '-score',
          count: 5
        },
        headers: {
          'X-Triposo-Account': TRIPOSO_ACCOUNT,
          'X-Triposo-Token': TRIPOSO_API_TOKEN
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Error fetching location info from Triposo:', error);
      return [];
    }
  }

  /**
   * Get points of interest for a destination
   * 
   * @param locationId The Triposo location ID
   * @param tags Optional tags to filter POIs
   * @param count Number of POIs to return
   * @returns Array of points of interest
   */
  static async getPointsOfInterest(locationId: string, tags?: string[], count: number = 10) {
    try {
      const tagsParam = tags ? tags.join(',') : 'sightseeing';
      
      const response = await axios.get(`${TRIPOSO_API_URL}/poi.json`, {
        params: {
          location_id: locationId,
          tag_labels: tagsParam,
          count: count,
          fields: 'id,name,score,intro,tag_labels,properties,images,coordinates,price_tier,booking_info',
          order_by: '-score'
        },
        headers: {
          'X-Triposo-Account': TRIPOSO_ACCOUNT,
          'X-Triposo-Token': TRIPOSO_API_TOKEN
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
   * @param locationId The Triposo location ID
   * @param type Accommodation type (budget, mid-range, luxury)
   * @param count Number of accommodations to return
   * @returns Array of accommodations
   */
  static async getAccommodations(locationId: string, type: string = 'mid-range', count: number = 10) {
    try {
      // Map preference type to price tier
      let priceTier;
      switch (type) {
        case 'budget':
          priceTier = '1,2';
          break;
        case 'luxury':
          priceTier = '4,5';
          break;
        case 'mid-range':
        default:
          priceTier = '2,3';
          break;
      }
      
      const response = await axios.get(`${TRIPOSO_API_URL}/poi.json`, {
        params: {
          location_id: locationId,
          tag_labels: 'hotels',
          price_tier: priceTier,
          count: count,
          fields: 'id,name,score,intro,tag_labels,properties,images,coordinates,price_tier,booking_info',
          order_by: '-score'
        },
        headers: {
          'X-Triposo-Account': TRIPOSO_ACCOUNT,
          'X-Triposo-Token': TRIPOSO_API_TOKEN
        }
      });

      return this.processTriposoAccommodations(response.data.results, type);
    } catch (error) {
      console.error('Error fetching accommodations from Triposo:', error);
      return [];
    }
  }

  /**
   * Get food places for a destination
   * 
   * @param locationId The Triposo location ID
   * @param type Food preference type (budget, local, fine)
   * @param count Number of food places to return
   * @returns Array of food places
   */
  static async getFoodPlaces(locationId: string, type: string = 'local', count: number = 10) {
    try {
      // Map preference type to price tier and tags
      let priceTier;
      let tags = ['restaurants'];
      
      switch (type) {
        case 'budget':
          priceTier = '1,2';
          tags.push('cheap');
          break;
        case 'fine':
          priceTier = '4,5';
          tags.push('fine_dining');
          break;
        case 'local':
        default:
          priceTier = '2,3';
          tags.push('local_cuisine');
          break;
      }
      
      const response = await axios.get(`${TRIPOSO_API_URL}/poi.json`, {
        params: {
          location_id: locationId,
          tag_labels: tags.join(','),
          price_tier: priceTier,
          count: count,
          fields: 'id,name,score,intro,tag_labels,properties,images,coordinates,price_tier,booking_info',
          order_by: '-score'
        },
        headers: {
          'X-Triposo-Account': TRIPOSO_ACCOUNT,
          'X-Triposo-Token': TRIPOSO_API_TOKEN
        }
      });

      return this.processTriposoFoodPlaces(response.data.results, type);
    } catch (error) {
      console.error('Error fetching food places from Triposo:', error);
      return [];
    }
  }

  /**
   * Get tour activities for a destination
   * 
   * @param locationId The Triposo location ID
   * @param count Number of tours to return
   * @returns Array of tour activities
   */
  static async getTourActivities(locationId: string, count: number = 10) {
    try {
      const response = await axios.get(`${TRIPOSO_API_URL}/tour.json`, {
        params: {
          location_ids: locationId,
          count: count,
          fields: 'id,name,score,intro,price,vendor,duration,images,booking_info',
          order_by: '-score'
        },
        headers: {
          'X-Triposo-Account': TRIPOSO_ACCOUNT,
          'X-Triposo-Token': TRIPOSO_API_TOKEN
        }
      });

      return this.processTriposoTours(response.data.results);
    } catch (error) {
      console.error('Error fetching tours from Triposo:', error);
      return [];
    }
  }

  /**
   * Process Triposo POI data into a standardized format
   */
  private static processTriposoPOIs(pois: any[]) {
    return pois.map(poi => {
      // Get the first image if available
      const imageUrl = poi.images && poi.images.length > 0 
        ? poi.images[0].sizes.medium.url 
        : 'https://images.unsplash.com/photo-1553701879-4aa576804f65';
      
      // Estimate cost based on price tier
      let cost = 0;
      if (poi.price_tier) {
        switch (poi.price_tier) {
          case 1: cost = 0; break;      // Free
          case 2: cost = 10; break;     // Budget
          case 3: cost = 20; break;     // Mid-range
          case 4: cost = 35; break;     // Upscale
          case 5: cost = 50; break;     // Luxury
        }
      }
      
      // Estimate duration based on POI type
      let duration = '1 hour';
      if (poi.tag_labels) {
        if (poi.tag_labels.includes('museums')) duration = '2-3 hours';
        if (poi.tag_labels.includes('castles')) duration = '2-3 hours';
        if (poi.tag_labels.includes('amusement_parks')) duration = '4-5 hours';
        if (poi.tag_labels.includes('viewpoints')) duration = '30 minutes';
      }
      
      return {
        id: poi.id,
        name: poi.name,
        description: poi.intro || 'Point of interest',
        cost: cost,
        duration: duration,
        imageUrl: imageUrl,
        coordinates: poi.coordinates,
        tags: poi.tag_labels,
        googleMapsUrl: poi.coordinates ? 
          `https://www.google.com/maps/search/?api=1&query=${poi.coordinates.latitude},${poi.coordinates.longitude}` : 
          undefined
      };
    });
  }

  /**
   * Process Triposo accommodation data into a standardized format
   */
  private static processTriposoAccommodations(accommodations: any[], type: string) {
    return accommodations.map(accommodation => {
      // Get the first image if available
      const imageUrl = accommodation.images && accommodation.images.length > 0 
        ? accommodation.images[0].sizes.medium.url 
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
      
      // Estimate cost based on price tier and accommodation type
      let costPerNight = 100; // Default mid-range
      if (accommodation.price_tier) {
        switch (type) {
          case 'budget':
            costPerNight = accommodation.price_tier * 25; // $25-$125
            break;
          case 'luxury':
            costPerNight = accommodation.price_tier * 100; // $100-$500
            break;
          case 'mid-range':
          default:
            costPerNight = accommodation.price_tier * 50; // $50-$250
            break;
        }
      }
      
      // Estimate rating based on score
      const rating = accommodation.score 
        ? Math.min(5, Math.max(3, Math.round(accommodation.score * 5 * 10) / 10)) 
        : 4.0;
      
      return {
        id: accommodation.id,
        name: accommodation.name,
        description: accommodation.intro || 'Accommodation',
        costPerNight: costPerNight,
        cost: costPerNight, // For compatibility
        rating: rating,
        imageUrl: imageUrl,
        coordinates: accommodation.coordinates,
        bookingInfo: accommodation.booking_info,
        googleMapsUrl: accommodation.coordinates ? 
          `https://www.google.com/maps/search/?api=1&query=${accommodation.coordinates.latitude},${accommodation.coordinates.longitude}` : 
          undefined
      };
    });
  }

  /**
   * Process Triposo food place data into a standardized format
   */
  private static processTriposoFoodPlaces(foodPlaces: any[], type: string) {
    return foodPlaces.map(place => {
      // Get the first image if available
      const imageUrl = place.images && place.images.length > 0 
        ? place.images[0].sizes.medium.url 
        : undefined;
      
      // Estimate cost based on price tier and food type
      let cost = 15; // Default mid-range
      if (place.price_tier) {
        switch (type) {
          case 'budget':
            cost = place.price_tier * 5; // $5-$25
            break;
          case 'fine':
            cost = place.price_tier * 20; // $20-$100
            break;
          case 'local':
          default:
            cost = place.price_tier * 10; // $10-$50
            break;
        }
      }
      
      // Determine cuisine type from tags
      let cuisineType = 'Local cuisine';
      if (place.tag_labels) {
        const cuisineTags = place.tag_labels.filter((tag: string) => 
          tag.startsWith('cuisine_')
        );
        
        if (cuisineTags.length > 0) {
          cuisineType = cuisineTags[0].replace('cuisine_', '').replace('_', ' ');
          cuisineType = cuisineType.charAt(0).toUpperCase() + cuisineType.slice(1);
        }
      }
      
      return {
        id: place.id,
        name: place.name,
        type: type,
        description: `${cuisineType} ${place.intro ? '- ' + place.intro : ''}`,
        cost: cost,
        imageUrl: imageUrl,
        coordinates: place.coordinates,
        googleMapsUrl: place.coordinates ? 
          `https://www.google.com/maps/search/?api=1&query=${place.coordinates.latitude},${place.coordinates.longitude}` : 
          undefined
      };
    });
  }

  /**
   * Process Triposo tour data into a standardized format
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
      } else {
        // Estimate based on duration
        const durationHours = tour.duration ? parseInt(tour.duration) / 3600 : 2;
        cost = Math.round(durationHours * 25);
      }
      
      // Format duration
      let duration = '2 hours';
      if (tour.duration) {
        const hours = Math.floor(parseInt(tour.duration) / 3600);
        duration = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '30 minutes';
      }
      
      return {
        id: tour.id,
        name: tour.name,
        description: tour.intro || 'Guided tour',
        cost: cost,
        duration: duration,
        imageUrl: imageUrl,
        vendor: tour.vendor,
        bookingInfo: tour.booking_info
      };
    });
  }
}

