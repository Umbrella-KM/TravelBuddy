import { useState } from "react";
import { ItineraryDay as ItineraryDayType } from "@/types/itinerary";
import { ChevronDown, ChevronUp, Bed, Utensils, MapPin, Euro, ExternalLink, Star, StarHalf, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItineraryDayProps {
  day: ItineraryDayType;
  isOpen?: boolean;
}

export function ItineraryDay({ day, isOpen = false }: ItineraryDayProps) {
  const [expanded, setExpanded] = useState(isOpen);
  const [selectedTab, setSelectedTab] = useState<'all' | 'accommodation' | 'food' | 'activities'>('all');

  const toggleExpand = () => {
    setExpanded(prev => !prev);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date if available
  const formattedDate = day.date 
    ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  // Generate random review count if not provided
  const getReviewCount = (base: number = 50) => {
    return Math.floor(Math.random() * 300) + base;
  };

  // Render star ratings
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex text-orange-500">
        {[...Array(Math.floor(rating))].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-current" />
        ))}
        {rating % 1 > 0 && (
          <StarHalf className="h-3 w-3 fill-current" />
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <Star key={i} className="h-3 w-3 text-neutral-300" />
        ))}
      </div>
    );
  };

  // Generate mock reviews
  const generateReviews = (itemName: string, rating: number) => {
    const reviewTemplates = [
      { text: `Great experience at ${itemName}. Highly recommended!`, rating: 5, author: "Alex M." },
      { text: `Good value for money. Would visit again.`, rating: 4, author: "Jamie L." },
      { text: `Decent place, but could be better in some aspects.`, rating: 3, author: "Taylor S." },
      { text: `Excellent service and atmosphere. One of the highlights of our trip.`, rating: 5, author: "Jordan P." },
      { text: `Nice location, friendly staff, overall a pleasant experience.`, rating: 4, author: "Casey R." }
    ];
    
    // Filter reviews based on the item's rating
    const relevantReviews = reviewTemplates.filter(review => 
      Math.abs(review.rating - rating) <= 1
    );
    
    // Return 2-3 random reviews
    const numReviews = Math.floor(Math.random() * 2) + 2;
    const shuffled = [...relevantReviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numReviews);
  };

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
      <div 
        className="bg-neutral-100 p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h4 className="font-semibold text-lg">Day {day.day}: {day.title.split(":")[1] || day.title} {formattedDate && `(${formattedDate})`}</h4>
        {expanded ? <ChevronUp className="text-neutral-600" /> : <ChevronDown className="text-neutral-600" />}
      </div>
      
      {expanded && (
        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-200 mb-4">
            <button 
              className={`px-4 py-2 font-medium text-sm ${selectedTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-neutral-600'}`}
              onClick={() => setSelectedTab('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${selectedTab === 'accommodation' ? 'text-primary border-b-2 border-primary' : 'text-neutral-600'}`}
              onClick={() => setSelectedTab('accommodation')}
            >
              Accommodation
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${selectedTab === 'food' ? 'text-primary border-b-2 border-primary' : 'text-neutral-600'}`}
              onClick={() => setSelectedTab('food')}
            >
              Food & Dining
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${selectedTab === 'activities' ? 'text-primary border-b-2 border-primary' : 'text-neutral-600'}`}
              onClick={() => setSelectedTab('activities')}
            >
              Activities
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accommodation Section */}
            {(selectedTab === 'all' || selectedTab === 'accommodation') && (
              <div>
                <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                  <Bed className="text-blue-600 mr-2 h-5 w-5" /> Accommodation
                </h5>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {day.accommodation.imageUrl && (
                    <img 
                      src={day.accommodation.imageUrl} 
                      alt={day.accommodation.name} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="font-medium text-lg">{day.accommodation.name}</div>
                    <div className="text-sm text-neutral-600 mb-2">{day.accommodation.description}</div>
                    <div className="flex items-center mb-2">
                      {renderStarRating(day.accommodation.rating)}
                      <span className="text-xs text-neutral-600 ml-1">
                        ({day.accommodation.reviewCount || getReviewCount()} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">{formatCurrency(day.accommodation.costPerNight)}</span>
                      <span className="text-neutral-600 ml-1">per night</span>
                    </div>
                    {day.accommodation.googleMapsUrl && (
                      <a 
                        href={day.accommodation.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline mb-3"
                      >
                        <MapPin className="h-4 w-4 mr-1" /> View on Google Maps
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    
                    {/* Reviews Section */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <h6 className="font-medium text-sm mb-2">Guest Reviews</h6>
                      <div className="space-y-3">
                        {generateReviews(day.accommodation.name, day.accommodation.rating).map((review, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center mb-1">
                              {renderStarRating(review.rating)}
                              <span className="ml-2 font-medium">{review.author}</span>
                            </div>
                            <p className="text-neutral-600">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Food & Dining Section */}
            {(selectedTab === 'all' || selectedTab === 'food') && (
              <div>
                <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                  <Utensils className="text-orange-500 mr-2 h-5 w-5" /> Food & Dining
                </h5>
                <div className="space-y-4">
                  {day.meals.map((meal, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {meal.imageUrl && (
                        <img 
                          src={meal.imageUrl} 
                          alt={meal.name} 
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-xs text-neutral-500 uppercase mb-1">{meal.type}</div>
                            <div className="text-sm text-neutral-600 mb-2">{meal.description}</div>
                          </div>
                          <div className="text-sm text-green-600 font-medium">{formatCurrency(meal.cost)}</div>
                        </div>
                        
                        {/* Rating and Reviews */}
                        {meal.rating && (
                          <div className="flex items-center mb-2">
                            {renderStarRating(meal.rating)}
                            <span className="text-xs text-neutral-600 ml-1">
                              ({meal.reviewCount || getReviewCount(30)} reviews)
                            </span>
                          </div>
                        )}
                        
                        {meal.googleMapsUrl && (
                          <a 
                            href={meal.googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline"
                          >
                            <MapPin className="h-4 w-4 mr-1" /> View on Google Maps
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                        
                        {/* Reviews Section */}
                        {meal.rating && (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <h6 className="font-medium text-sm mb-2">Diner Reviews</h6>
                            <div className="space-y-2">
                              {generateReviews(meal.name, meal.rating || 4).map((review, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="flex items-center mb-1">
                                    {renderStarRating(review.rating)}
                                    <span className="ml-2 font-medium">{review.author}</span>
                                  </div>
                                  <p className="text-neutral-600 text-xs">{review.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Activities Section */}
            {(selectedTab === 'all' || selectedTab === 'activities') && (
              <div>
                <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                  <MapPin className="text-primary mr-2 h-5 w-5" /> Activities
                </h5>
                <div className="space-y-4">
                  {day.activities.map((activity, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {activity.imageUrl && (
                        <img 
                          src={activity.imageUrl} 
                          alt={activity.name} 
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="font-medium">{activity.name}</div>
                        <div className="text-sm text-neutral-600 mb-2">{activity.description}</div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="bg-neutral-100 px-2 py-1 rounded text-xs flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {activity.duration}
                          </div>
                          <div className="bg-neutral-100 px-2 py-1 rounded text-xs flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" /> 
                            {activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}
                          </div>
                          {activity.tags && activity.tags.map((tag, idx) => (
                            <div key={idx} className="bg-neutral-100 px-2 py-1 rounded text-xs">
                              {tag}
                            </div>
                          ))}
                        </div>
                        
                        {activity.googleMapsUrl && (
                          <a 
                            href={activity.googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline mb-3"
                          >
                            <MapPin className="h-4 w-4 mr-1" /> View on Google Maps
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                        
                        {/* Reviews Section */}
                        <div className="mt-3 pt-3 border-t border-neutral-100">
                          <h6 className="font-medium text-sm mb-2">Visitor Reviews</h6>
                          <div className="space-y-2">
                            {generateReviews(activity.name, 4.5).map((review, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="flex items-center mb-1">
                                  {renderStarRating(review.rating)}
                                  <span className="ml-2 font-medium">{review.author}</span>
                                </div>
                                <p className="text-neutral-600 text-xs">{review.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <h5 className="font-medium text-neutral-900 mb-2">Day Summary</h5>
            <p className="text-sm text-neutral-600 mb-3">
              {day.summary}
            </p>
            <div className="flex items-center text-sm flex-wrap gap-2">
              <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1 flex items-center">
                <Euro className="text-neutral-600 mr-1 h-4 w-4" />
                <span>Day Cost: <strong>{formatCurrency(day.dailyCost)}</strong></span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1 flex items-center">
                <MapPin className="text-neutral-600 mr-1 h-4 w-4" />
                <span>Main Area: <strong>{day.activities[0]?.name || 'Various Locations'}</strong></span>
              </div>
              {day.transportation.googleMapsUrl && (
                <a 
                  href={day.transportation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-neutral-200 rounded-lg px-3 py-1 flex items-center hover:border-primary hover:text-primary transition-colors"
                >
                  <i className="fas fa-bus text-neutral-600 mr-1"></i>
                  <span>Public Transport</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
