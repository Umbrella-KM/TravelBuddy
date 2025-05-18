import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// OpenTripMap API credentials
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY || '';

// Base URL for OpenTripMap API
const OPENTRIPMAP_API_URL = 'https://api.opentripmap.com/0.1/en';

/**
 * Service for interacting with OpenTripMap API
 */
export class OpenTripMapService {
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

      const response = await axios.get(`${OPENTRIPMAP_API_URL}/places/geoname`, {
        params: {
          name: query,
          apikey: OPENTRIPMAP_API_KEY
        }
      });

      if (!response.data) {
        return [];
      }

      // Format the response to match the expected structure
      return [{
        id: response.data.name.toLowerCase().replace(/\s+/g, '-'),
        name: response.data.name,
        country_id: response.data.country,
        coordinates: {
          latitude: response.data.lat,
          longitude: response.data.lon
        }
      }];
    } catch (error) {
      console.error('Error fetching location info from OpenTripMap:', error);
      return [];
    }
  }

  /**
   * Get points of interest for a destination
   * 
   * @param locationId The location ID (not used directly with OpenTripMap)
   * @param tags Optional tags to filter POIs
   * @param count Number of POIs to return
   * @returns Array of points of interest
   */
  static async getPointsOfInterest(locationId: string, tags?: string[], count: number = 10) {
    try {
      // Extract coordinates from the location ID or use a geocoding service
      // For this implementation, we'll use the locationId to get coordinates first
      const locations = await this.getLocationInfo(locationId.replace(/-/g, ' '));
      
      if (!locations || locations.length === 0) {
        return [];
      }
      
      const { latitude, longitude } = locations[0].coordinates;
      
      // Map our tags to OpenTripMap kinds
      let kinds = 'interesting_places';
      if (tags && tags.length > 0) {
        kinds = this.mapTagsToKinds(tags);
      }
      
      // Get places within a radius
      const radius = 5000; // 5km
      const response = await axios.get(`${OPENTRIPMAP_API_URL}/places/radius`, {
        params: {
          radius,
          lon: longitude,
          lat: latitude,
          kinds,
          rate: 2, // Minimum rating
          limit: count,
          apikey: OPENTRIPMAP_API_KEY
        }
      });

      if (!response.data || !response.data.features) {
        return [];
      }

      // Get details for each place
      const pois = [];
      for (const feature of response.data.features.slice(0, count)) {
        const xid = feature.properties.xid;
        if (xid) {
          const details = await this.getPlaceDetails(xid);
          if (details) {
            pois.push(details);
          }
        }
      }

      return pois;
    } catch (error) {
      console.error('Error fetching POIs from OpenTripMap:', error);
      return [];
    }
  }

  /**
   * Get details for a specific place
   * 
   * @param xid The OpenTripMap XID
   * @returns Place details
   */
  static async getPlaceDetails(xid: string) {
    try {
      const response = await axios.get(`${OPENTRIPMAP_API_URL}/places/xid/${xid}`, {
        params: {
          apikey: OPENTRIPMAP_API_KEY
        }
      });

      if (!response.data) {
        return null;
      }

      const place = response.data;
      
      // Estimate cost based on place kind
      const cost = this.estimateCost(place.kinds);
      
      // Estimate duration based on place kind
      const duration = this.estimateDuration(place.kinds);
      
      return {
        id: place.xid,
        name: place.name,
        description: place.wikipedia_extracts ? 
          place.wikipedia_extracts.text : 
          (place.info ? place.info.descr : 'Point of interest'),
        cost,
        duration,
        imageUrl: place.preview ? 
          place.preview.source : 
          'https://images.unsplash.com/photo-1553701879-4aa576804f65',
        coordinates: {
          latitude: place.point.lat,
          longitude: place.point.lon
        },
        tags: place.kinds ? place.kinds.split(',') : [],
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${place.point.lat},${place.point.lon}`
      };
    } catch (error) {
      console.error('Error fetching place details from OpenTripMap:', error);
      return null;
    }
  }

  /**
   * Map our tags to OpenTripMap kinds
   */
  private static mapTagsToKinds(tags: string[]): string {
    const kindMap: Record<string, string> = {
      'sightseeing': 'interesting_places,tourist_facilities',
      'cultural': 'museums,cultural,historic,architecture',
      'adventure': 'natural,sport,amusements',
      'relaxation': 'beaches,natural,gardens_and_parks',
      'shopping': 'commercial,shops',
      'nightlife': 'foods,adult',
      'temple-visits': 'religion',
      'heritage-sites': 'historic,architecture,cultural',
      'ayurveda-wellness': 'sport,foods',
      'wildlife-safari': 'natural,zoos',
      'backwaters': 'natural,beaches',
      'street-food-tours': 'foods',
      'handicrafts': 'shops,commercial',
      'yoga-meditation': 'sport,religion',
      'hill-stations': 'natural,mountains',
      'desert-exploration': 'natural'
    };

    const kinds = tags.map(tag => kindMap[tag] || tag).join(',');
    return kinds || 'interesting_places';
  }

  /**
   * Estimate cost based on place kind
   */
  private static estimateCost(kinds: string): number {
    if (!kinds) return 10;
    
    if (kinds.includes('museums')) return 15;
    if (kinds.includes('historic')) return 10;
    if (kinds.includes('amusements')) return 30;
    if (kinds.includes('zoos')) return 20;
    if (kinds.includes('religion')) return 0;
    if (kinds.includes('natural')) return 0;
    if (kinds.includes('beaches')) return 0;
    if (kinds.includes('gardens_and_parks')) return 0;
    
    return 10; // Default cost
  }

  /**
   * Estimate duration based on place kind
   */
  private static estimateDuration(kinds: string): string {
    if (!kinds) return '1 hour';
    
    if (kinds.includes('museums')) return '2-3 hours';
    if (kinds.includes('historic')) return '1-2 hours';
    if (kinds.includes('amusements')) return '3-4 hours';
    if (kinds.includes('zoos')) return '2-3 hours';
    if (kinds.includes('religion')) return '1 hour';
    if (kinds.includes('natural')) return '2 hours';
    if (kinds.includes('beaches')) return '3 hours';
    if (kinds.includes('gardens_and_parks')) return '1-2 hours';
    
    return '1 hour'; // Default duration
  }
}

