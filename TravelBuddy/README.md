# TravelPlan - Comprehensive Travel Itinerary Generator

TravelPlan is a web application that generates personalized travel itineraries based on destination, duration, and budget. It creates a comprehensive plan showing budget breakdown and provides a complete itinerary with Google Maps links for accommodations, restaurants, and attractions along with customer reviews.

## Features

- **Comprehensive Budget Breakdown**: Detailed allocation of your budget with visualizations
- **Complete Itinerary Generation**: Enter your destination and get a day-by-day travel plan
- **Google Maps Integration**: View all locations on Google Maps with direct links
- **Customer Reviews**: See ratings and reviews for accommodations, restaurants, and attractions
- **Personalized Preferences**: Choose your accommodation type, food preferences, and activity interests
- **Interactive UI**: User-friendly interface with tabs and detailed information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**:
  - Triposo API for destination information and points of interest
  - Yelp API for restaurant information and reviews
  - OpenStreetMap as a fallback for location data

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or use the provided Neon serverless option)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/TravelPlan.git
   cd TravelPlan
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
   DATABASE_URL=your_database_connection_string
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
4. View the comprehensive budget breakdown with visualizations
5. Explore the detailed day-by-day itinerary with Google Maps links and reviews
6. Save or share your travel plan

## Project Structure

```
TravelPlan/
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

- [Triposo API](https://www.triposo.com/api/) for destination data and points of interest
- [Yelp API](https://www.yelp.com/developers) for restaurant information and reviews
- [OpenStreetMap](https://www.openstreetmap.org/) for geographic data
- [Google Maps](https://maps.google.com/) for location mapping
- [Unsplash](https://unsplash.com/) for placeholder images

