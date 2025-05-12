import axios from 'axios';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Service for interacting with OpenStreetMap data via Overpass API
 */
export class OSMService {
  /**
   * Fetches points of interest around a specific location
   * 
   * @param city The name of the city
   * @param country The country (optional)
   * @param categories Types of POIs to fetch (optional)
   * @param radius Search radius in meters (defaults to 5000m/5km)
   * @returns Array of points of interest
   */
  static async getPointsOfInterest(city: string, country?: string, categories: string[] = [], radius: number = 5000) {
    try {
      // Default categories if none provided
      if (categories.length === 0) {
        // Base categories for all countries
        categories = [
          'tourism=attraction', 
          'tourism=museum', 
          'tourism=gallery',
          'tourism=viewpoint',
          'historic=monument',
          'historic=castle',
          'historic=ruins',
          'leisure=park'
        ];
        
        // Add India-specific categories if the country is India
        if (country && country.toLowerCase() === 'india') {
          const indiaSpecificCategories = [
            'historic=temple',
            'historic=fort',
            'historic=palace',
            'natural=beach',
            'amenity=place_of_worship',
            'tourism=guest_house'
          ];
          categories = [...categories, ...indiaSpecificCategories];
        }
      }

      // Create location query string
      let locationQuery = `"${city}"`;
      if (country) {
        locationQuery += ` "${country}"`;
      }

      // Build the Overpass query
      const categoryFilters = categories.map(cat => {
        const [key, value] = cat.split('=');
        return `node[${key}="${value}"](around:${radius});
               way[${key}="${value}"](around:${radius});
               relation[${key}="${value}"](around:${radius});`;
      }).join('\n');

      const query = `
        [out:json][timeout:60];
        {{geocodeArea:${locationQuery}}}->.searchArea;
        (
          ${categoryFilters}
        );
        out body;
        >;
        out skel qt;
      `;

      // Fetch data from Overpass API
      const response = await axios.post(OVERPASS_API_URL, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Process the response into a more usable format
      return this.processOSMResponse(response.data);
    } catch (error) {
      console.error('Error fetching OSM data:', error);
      
      // If the Overpass query fails (which can happen with geocoding),
      // fall back to a more direct coordinate-based approach
      return this.fallbackToNominatimAndDirectCoordinates(city, country, categories, radius);
    }
  }

  /**
   * Fallback method using Nominatim for geocoding and direct coordinates for Overpass
   */
  private static async fallbackToNominatimAndDirectCoordinates(
    city: string, 
    country?: string, 
    categories: string[] = [],
    radius: number = 5000
  ) {
    try {
      // 1. Get coordinates from Nominatim
      const locationQuery = `${city}${country ? ', ' + country : ''}`;
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`
      );

      if (nominatimResponse.data.length === 0) {
        throw new Error(`Location not found: ${locationQuery}`);
      }

      const { lat, lon } = nominatimResponse.data[0];

      // 2. Use these coordinates for Overpass query
      const categoryFilters = categories.map(cat => {
        const [key, value] = cat.split('=');
        return `node[${key}="${value}"](around:${radius},${lat},${lon});
               way[${key}="${value}"](around:${radius},${lat},${lon});
               relation[${key}="${value}"](around:${radius},${lat},${lon});`;
      }).join('\n');

      const query = `
        [out:json][timeout:60];
        (
          ${categoryFilters}
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(OVERPASS_API_URL, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return this.processOSMResponse(response.data);
    } catch (error) {
      console.error('Error in fallback OSM data fetch:', error);
      return [];
    }
  }

  /**
   * Process the raw OSM response into a more usable format
   */
  private static processOSMResponse(osmData: any) {
    const pois = [];

    if (!osmData.elements) {
      return [];
    }

    // Filter for nodes that have a name tag and useful properties
    for (const element of osmData.elements) {
      if (element.tags && element.tags.name) {
        // Create a standardized POI object
        const poi = {
          id: element.id,
          name: element.tags.name,
          type: this.determinePoiType(element.tags),
          description: this.generateDescription(element.tags),
          lat: element.lat || (element.center ? element.center.lat : null),
          lon: element.lon || (element.center ? element.center.lon : null),
          address: this.formatAddress(element.tags),
          tags: element.tags,
          // Estimate visit duration and cost based on type
          estimatedDuration: this.estimateVisitDuration(element.tags),
          estimatedCost: this.estimateVisitCost(element.tags),
          // Try to find an image if available
          image: element.tags.image || element.tags['wikimedia_commons'] || null
        };

        // Only include POIs with coordinates
        if (poi.lat && poi.lon) {
          pois.push(poi);
        }
      }
    }

    return pois;
  }

  /**
   * Determine the general type of POI based on OSM tags
   */
  private static determinePoiType(tags: any) {
    if (tags.tourism === 'attraction') return 'attraction';
    if (tags.tourism === 'museum') return 'museum';
    if (tags.tourism === 'gallery') return 'gallery';
    if (tags.tourism === 'viewpoint') return 'viewpoint';
    if (tags.historic === 'monument') return 'monument';
    if (tags.historic === 'castle') return 'castle';
    if (tags.historic === 'palace') return 'palace'; // For Indian palaces and forts
    if (tags.historic === 'fort') return 'fort'; // For Indian forts
    if (tags.historic === 'temple') return 'temple'; // For Indian temples
    if (tags.historic === 'ruins') return 'ruins';
    if (tags.leisure === 'park') return 'park';
    if (tags.religion === 'hindu') return 'hindu_temple';
    if (tags.religion === 'buddhist') return 'buddhist_temple';
    if (tags.religion === 'jain') return 'jain_temple';
    if (tags.religion === 'sikh') return 'gurudwara';
    if (tags.amenity === 'place_of_worship' && tags.religion) return `${tags.religion}_place_of_worship`;
    if (tags.natural === 'beach') return 'beach';
    if (tags.natural === 'mountain') return 'mountain';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.shop) return 'shop';
    return 'point_of_interest';
  }

  /**
   * Generate a description based on available tags
   */
  private static generateDescription(tags: any) {
    if (tags.description) return tags.description;
    
    const descriptions = [];
    if (tags.historic) descriptions.push(`Historic ${tags.historic}`);
    if (tags.architecture) descriptions.push(`${tags.architecture} architecture`);
    if (tags.tourism) descriptions.push(`Tourist ${tags.tourism}`);
    if (tags.amenity) descriptions.push(`${tags.amenity.replace('_', ' ')}`);

    if (descriptions.length > 0) {
      return descriptions.join(', ');
    }
    
    return 'Point of interest';
  }

  /**
   * Format address from OSM tags
   */
  private static formatAddress(tags: any) {
    const addressParts = [];
    
    if (tags['addr:street']) {
      let streetAddress = tags['addr:street'];
      if (tags['addr:housenumber']) streetAddress = `${tags['addr:housenumber']} ${streetAddress}`;
      addressParts.push(streetAddress);
    }
    
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:postcode']) addressParts.push(tags['addr:postcode']);
    if (tags['addr:country']) addressParts.push(tags['addr:country']);
    
    return addressParts.join(', ');
  }

  /**
   * Estimate visit duration based on POI type
   * Returns duration in hours
   */
  private static estimateVisitDuration(tags: any) {
    // These are rough estimates
    if (tags.tourism === 'museum') return '2-3 hours';
    if (tags.tourism === 'gallery') return '1-2 hours';
    if (tags.historic === 'castle') return '2-3 hours';
    if (tags.leisure === 'park') return '1-2 hours';
    if (tags.tourism === 'viewpoint') return '30 minutes';
    if (tags.historic === 'monument') return '30 minutes';
    return '1 hour';
  }

  /**
   * Estimate visit cost based on POI type
   * Returns cost in USD (very approximate)
   */
  private static estimateVisitCost(tags: any) {
    // Parse from fee:amount if available
    if (tags['fee:amount']) {
      const match = tags['fee:amount'].match(/\d+(\.\d+)?/);
      if (match) return parseFloat(match[0]);
    }
    
    // Check if free
    if (tags.fee === 'no' || tags.access === 'yes') return 0;
    
    // Make estimates based on type
    if (tags.tourism === 'museum') return 15;
    if (tags.tourism === 'gallery') return 12;
    if (tags.historic === 'castle') return 20;
    if (tags.tourism === 'attraction') return 10;
    
    // Parks and viewpoints are typically free
    if (tags.leisure === 'park' || tags.tourism === 'viewpoint') return 0;
    
    // Default for unknown
    return 10;
  }

  /**
   * Get accommodations from OpenStreetMap
   */
  static async getAccommodations(city: string, country?: string, type: string = 'mid-range', radius: number = 5000) {
    try {
      // Define OSM accommodation types
      let accommodationTypes: string[] = [];
      
      // Map preference type to actual OSM tags
      switch (type) {
        case 'budget':
          accommodationTypes = ['tourism=hostel', 'tourism=guest_house', 'tourism=motel'];
          break;
        case 'luxury':
          accommodationTypes = ['tourism=hotel'];
          break;
        case 'mid-range':
        default:
          accommodationTypes = ['tourism=hotel', 'tourism=apartment'];
          break;
      }
      
      const pois = await this.getPointsOfInterest(city, country, accommodationTypes, radius);
      
      // Add accommodation-specific processing here
      return pois.map(poi => {
        // Customize the accommodation object
        return {
          ...poi,
          costPerNight: this.estimateAccommodationCost(poi.tags, type),
          rating: this.estimateAccommodationRating(poi.tags),
          imageUrl: poi.image || `https://images.unsplash.com/photo-1566073771259-6a8506099945`
        };
      });
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }
  }

  /**
   * Estimate accommodation cost based on tags and accommodation type
   */
  private static estimateAccommodationCost(tags: any, type: string) {
    // Default base prices by accommodation type (USD)
    const basePrices = {
      'budget': 50,
      'mid-range': 120,
      'luxury': 250
    };
    
    // Adjust prices for specific countries
    if (tags['addr:country'] === 'India' || tags.country === 'India') {
      // India typically has lower accommodation costs (in USD)
      basePrices.budget = 30;      // ~2500 INR
      basePrices['mid-range'] = 75;    // ~6000 INR
      basePrices.luxury = 150;     // ~12000 INR
      
      // Special case for specific accommodation types in India
      if (tags.tourism === 'heritage_hotel' || tags.building === 'haveli') {
        // Heritage hotels and havelis are often premium accommodations
        return Math.round(basePrices.luxury * 1.2);
      }
      
      if (tags.tourism === 'guest_house' || tags.tourism === 'hostel') {
        // Guest houses and hostels in India are very budget-friendly
        return Math.round(basePrices.budget * 0.7);
      }
      
      // Ashrams and spiritual retreats
      if (tags.amenity === 'ashram' || tags.name?.toLowerCase().includes('ashram')) {
        return Math.round(basePrices.budget * 0.8);
      }
    }
    
    // Adjust based on stars if available
    let multiplier = 1.0;
    if (tags.stars) {
      const stars = parseInt(tags.stars);
      if (stars <= 2) multiplier = 0.8;
      else if (stars === 3) multiplier = 1.0;
      else if (stars === 4) multiplier = 1.3;
      else if (stars >= 5) multiplier = 1.8;
    }
    
    // Adjust for location - properties in city center are typically more expensive
    if (tags.location === 'city_center' || tags['addr:district']?.toLowerCase().includes('central')) {
      multiplier *= 1.2;
    }
    
    return Math.round(basePrices[type as keyof typeof basePrices] * multiplier);
  }

  /**
   * Estimate accommodation rating based on tags
   */
  private static estimateAccommodationRating(tags: any) {
    if (tags.stars) {
      const stars = parseFloat(tags.stars);
      // Convert 1-5 stars to 1-5 rating
      return Math.min(5, Math.max(1, stars));
    }
    
    // Default ratings based on common types
    if (tags.tourism === 'hotel') return 4.0;
    if (tags.tourism === 'hostel') return 3.5;
    if (tags.tourism === 'guest_house') return 3.7;
    if (tags.tourism === 'apartment') return 4.2;
    
    // Default value
    return 3.8;
  }

  /**
   * Get restaurants/food places from OpenStreetMap
   */
  static async getFoodPlaces(city: string, country?: string, type: string = 'local', radius: number = 5000) {
    try {
      let foodTypes: string[] = [];
      
      // Map preference type to actual OSM tags
      switch (type) {
        case 'budget':
          foodTypes = ['amenity=fast_food', 'amenity=food_court'];
          break;
        case 'fine':
          foodTypes = ['amenity=restaurant', 'cuisine=fine_dining'];
          break;
        case 'local':
        default:
          foodTypes = ['amenity=restaurant'];
          break;
      }
      
      const pois = await this.getPointsOfInterest(city, country, foodTypes, radius);
      
      return pois.map(poi => {
        // Get the cuisine type if available
        const cuisineType = poi.tags.cuisine ? 
          poi.tags.cuisine.split(';')[0].replace('_', ' ') : 
          'Local cuisine';
          
        return {
          name: poi.name,
          type: type,
          description: `${cuisineType} ${poi.type === 'restaurant' ? 'restaurant' : 'eatery'}`,
          cost: this.estimateFoodCost(poi.tags, type),
          address: poi.address,
          lat: poi.lat,
          lon: poi.lon
        };
      });
    } catch (error) {
      console.error('Error fetching food places:', error);
      return [];
    }
  }

  /**
   * Estimate food place cost based on tags and food type
   */
  private static estimateFoodCost(tags: any, type: string) {
    // Base prices by food type (USD per meal)
    const basePrices = {
      'budget': 8,
      'local': 20,
      'fine': 50
    };
    
    // Lower base prices for India (converting to USD equivalent)
    if (tags['addr:country'] === 'India' || tags.country === 'India') {
      basePrices.budget = 4;  // ~300 INR
      basePrices.local = 10;  // ~750 INR
      basePrices.fine = 25;   // ~2000 INR
    }
    
    // Adjust based on cuisine if available
    let multiplier = 1.0;
    
    if (tags.cuisine) {
      const cuisines = tags.cuisine.split(';');
      // Fine dining types
      if (cuisines.includes('fine_dining')) multiplier = 2.0;
      // International cuisines typically cost more
      else if (cuisines.includes('sushi')) multiplier = 1.5;
      else if (cuisines.includes('seafood')) multiplier = 1.3;
      else if (cuisines.includes('italian')) multiplier = 1.3;
      else if (cuisines.includes('french')) multiplier = 1.4;
      // Indian cuisines with regional variations
      else if (cuisines.includes('indian')) multiplier = 1.0;
      else if (cuisines.includes('north_indian')) multiplier = 1.1;
      else if (cuisines.includes('south_indian')) multiplier = 0.9;
      else if (cuisines.includes('gujarati')) multiplier = 0.9;
      else if (cuisines.includes('bengali')) multiplier = 1.0;
      else if (cuisines.includes('punjabi')) multiplier = 1.1;
      else if (cuisines.includes('kerala')) multiplier = 1.0;
      else if (cuisines.includes('goan')) multiplier = 1.2;
      // Street food and quick service
      else if (cuisines.includes('fast_food')) multiplier = 0.7;
      else if (cuisines.includes('street_food')) multiplier = 0.6;
      else if (cuisines.includes('dhaba')) multiplier = 0.5; // Indian roadside eateries
    }
    
    return Math.round(basePrices[type as keyof typeof basePrices] * multiplier);
  }
}