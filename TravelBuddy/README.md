# TravelBuddy

TravelBuddy is a travel planning application that helps users create personalized travel itineraries based on their preferences, budget, and destination.

## Features

- Generate detailed travel itineraries for any destination
- Customize your trip based on accommodation preferences, food preferences, and activities
- Get budget breakdowns for your trip
- View attractions, accommodations, and restaurants for your destination
- Save and manage your itineraries

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **APIs**:
  - OpenTripMap API (for points of interest and attractions)
  - Geoapify Places API (for accommodations and restaurants)
  - OpenStreetMap (for mapping and additional data)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/TravelBuddy.git
   cd TravelBuddy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database connection string (if using a database)
   DATABASE_URL=

   # OpenTripMap API key (free tier)
   OPENTRIPMAP_API_KEY=your_opentripmap_api_key

   # Geoapify API key (free tier)
   GEOAPIFY_API_KEY=your_geoapify_api_key

   # Port for the server (optional)
   PORT=3000
   ```

   You can get free API keys from:
   - [OpenTripMap](https://opentripmap.io/product) - Free tier includes 1000 requests per day
   - [Geoapify](https://www.geoapify.com/) - Free tier includes 3000 requests per day

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your destination, travel dates, and number of days
2. Set your budget and preferences for accommodation, food, and activities
3. Click "Generate Itinerary" to create your personalized travel plan
4. View and save your itinerary
5. Access your saved itineraries from the dashboard

## API Endpoints

- `GET /api/destinations` - Get a list of destinations
- `POST /api/generate-itinerary` - Generate a travel itinerary
- `POST /api/save-itinerary` - Save an itinerary
- `GET /api/itineraries` - Get all saved itineraries
- `GET /api/itineraries/:id` - Get a specific itinerary by ID

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenTripMap](https://opentripmap.io) for providing points of interest data
- [Geoapify](https://www.geoapify.com) for providing places data
- [OpenStreetMap](https://www.openstreetmap.org) for mapping data

