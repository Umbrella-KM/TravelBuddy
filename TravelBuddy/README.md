# TravelBuddy - Smart Travel Itinerary Generator

TravelBuddy is a web application that generates personalized travel itineraries based on destination and budget. It allocates your budget for accommodation, food, and activities, and provides links to Google Maps for places and points of interest along with their reviews.

## Features

- **Destination-based Itinerary Generation**: Enter your destination and get a complete travel plan
- **Budget Allocation**: Automatically allocates your budget for accommodation, food, and activities
- **Personalized Preferences**: Choose your accommodation type, food preferences, and activity interests
- **Google Maps Integration**: View locations on Google Maps with direct links
- **Reviews and Ratings**: See ratings and reviews for accommodations and attractions
- **Day-by-Day Planning**: Get a detailed day-by-day itinerary with all details
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js, Express
- **APIs**:
  - Triposo API for destination information and basic planning
  - Yelp API for detailed restaurant filtering
  - OpenStreetMap as a fallback for location data

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/TravelBuddy.git
   cd TravelBuddy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Get API keys:
   - Triposo API: Sign up at [https://www.triposo.com/api/](https://www.triposo.com/api/)
   - Yelp API: Get your API key from [https://www.yelp.com/developers](https://www.yelp.com/developers)

5. Add your API keys to the `.env` file:
   ```
   TRIPOSO_API_TOKEN=your_triposo_api_token
   TRIPOSO_ACCOUNT=your_triposo_account
   YELP_API_KEY=your_yelp_api_key
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your destination and travel dates
2. Set your budget and preferences for accommodation, food, and activities
3. Generate your personalized itinerary
4. View and save your travel plan
5. Click on Google Maps links to see locations

## Project Structure

```
TravelBuddy/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API clients
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express server
│   ├── services/           # API service integrations
│   │   ├── triposo.ts      # Triposo API service
│   │   ├── yelp.ts         # Yelp API service
│   │   └── osm.ts          # OpenStreetMap service (fallback)
│   ├── routes.ts           # API routes
│   └── index.ts            # Server entry point
└── shared/                 # Shared code between client and server
    └── schema.ts           # Data schemas and types
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Triposo API](https://www.triposo.com/api/) for destination data
- [Yelp API](https://www.yelp.com/developers) for restaurant information
- [OpenStreetMap](https://www.openstreetmap.org/) for geographic data
- [Unsplash](https://unsplash.com/) for placeholder images

