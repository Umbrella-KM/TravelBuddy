# TravelBuddy - Smart Travel Itinerary Generator

TravelBuddy is a web application that generates personalized travel itineraries based on destination and budget. It allocates your budget for accommodations, food, and activities, and provides links to Google Maps for all points of interest along with reviews.

## Features

- **Budget-Based Itinerary Generation**: Create travel plans that fit your specific budget
- **Smart Budget Allocation**: Automatically allocates funds for accommodations, food, activities, and transportation
- **Destination Information**: Get detailed information about your destination using Triposo API
- **Restaurant Recommendations**: Find the best places to eat with Yelp API integration
- **Google Maps Integration**: View all points of interest, accommodations, and restaurants on Google Maps
- **Reviews and Ratings**: See ratings and reviews for accommodations and restaurants
- **Customizable Preferences**: Choose your preferred accommodation type, food options, and activities
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **APIs**: Triposo API, Yelp API, Google Maps
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS, Radix UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

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

4. Add your API keys to the `.env` file:
   - Get Triposo API credentials from [Triposo](https://www.triposo.com/api/)
   - Get Yelp API key from [Yelp Fusion](https://www.yelp.com/developers/documentation/v3/authentication)

5. Set up the database:
   ```
   npm run db:push
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Enter your destination and travel dates
2. Specify your budget and preferences
3. Get a personalized itinerary with accommodations, meals, and activities
4. View details for each day of your trip
5. Click on Google Maps links to see locations
6. Save your itinerary for future reference

## API Endpoints

### Triposo API Endpoints

- `GET /api/destination-info`: Get information about a destination
- `GET /api/points-of-interest`: Get points of interest for a destination
- `GET /api/accommodations`: Get accommodations for a destination
- `GET /api/tour-activities`: Get tour activities for a destination
- `GET /api/day-plans`: Get day plans for a destination

### Yelp API Endpoints

- `GET /api/restaurants`: Search for restaurants in a location
- `GET /api/restaurant/:id`: Get details for a specific restaurant
- `GET /api/restaurant/:id/reviews`: Get reviews for a specific restaurant

### Itinerary Endpoints

- `POST /api/generate-itinerary`: Generate a new itinerary
- `POST /api/save-itinerary`: Save an itinerary
- `GET /api/itineraries`: Get all saved itineraries
- `GET /api/itineraries/:id`: Get a specific itinerary

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Triposo API](https://www.triposo.com/api/) for destination information
- [Yelp API](https://www.yelp.com/developers) for restaurant data
- [Google Maps](https://developers.google.com/maps) for location services
- [Unsplash](https://unsplash.com/) for stock images

