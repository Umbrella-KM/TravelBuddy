import { useState } from "react";
import { ItineraryDay as ItineraryDayType } from "@/types/itinerary";
import { ChevronDown, ChevronUp, Bed, Utensils, MapPin, Euro, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItineraryDayProps {
  day: ItineraryDayType;
  isOpen?: boolean;
}

export function ItineraryDay({ day, isOpen = false }: ItineraryDayProps) {
  const [expanded, setExpanded] = useState(isOpen);

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

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div 
        className="bg-neutral-100 p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h4 className="font-semibold text-lg">Day {day.day}: {day.title.split(":")[1] || day.title} {formattedDate && `(${formattedDate})`}</h4>
        {expanded ? <ChevronUp className="text-neutral-600" /> : <ChevronDown className="text-neutral-600" />}
      </div>
      
      {expanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                <Bed className="text-blue-600 mr-2 h-5 w-5" /> Accommodation
              </h5>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {day.accommodation.imageUrl && (
                  <img 
                    src={day.accommodation.imageUrl} 
                    alt={day.accommodation.name} 
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <div className="font-medium">{day.accommodation.name}</div>
                  <div className="text-sm text-neutral-600 mb-2">{day.accommodation.description}</div>
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">{formatCurrency(day.accommodation.costPerNight)}/night</span>
                    <div className="flex items-center mt-1">
                      <div className="flex text-orange-500">
                        {[...Array(Math.floor(day.accommodation.rating))].map((_, i) => (
                          <i key={i} className="fas fa-star text-xs"></i>
                        ))}
                        {day.accommodation.rating % 1 > 0 && (
                          <i className="fas fa-star-half-alt text-xs"></i>
                        )}
                        {[...Array(5 - Math.ceil(day.accommodation.rating))].map((_, i) => (
                          <i key={i} className="far fa-star text-xs"></i>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-600 ml-1">({Math.floor(Math.random() * 300) + 50} reviews)</span>
                    </div>
                    {day.accommodation.googleMapsUrl && (
                      <div className="mt-2">
                        <a 
                          href={day.accommodation.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3 mr-1" /> View on Google Maps
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                <Utensils className="text-orange-500 mr-2 h-5 w-5" /> Food & Dining
              </h5>
              <div className="space-y-3">
                {day.meals.map((meal, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-neutral-600">{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} - {meal.description}</div>
                      </div>
                      <div className="text-sm text-orange-500 font-medium">{formatCurrency(meal.cost)}</div>
                    </div>
                    {meal.googleMapsUrl && (
                      <div className="mt-2">
                        <a 
                          href={meal.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3 mr-1" /> View on Google Maps
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-neutral-900 mb-3 flex items-center">
                <MapPin className="text-primary mr-2 h-5 w-5" /> Activities
              </h5>
              <div className="space-y-3">
                {day.activities.map((activity, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {activity.imageUrl && (
                      <img 
                        src={activity.imageUrl} 
                        alt={activity.name} 
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-neutral-600 mb-1">{activity.description}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-primary font-medium">
                          {activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">{activity.duration}</div>
                      </div>
                      {activity.googleMapsUrl && (
                        <div className="mt-2">
                          <a 
                            href={activity.googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-primary hover:underline"
                          >
                            <MapPin className="h-3 w-3 mr-1" /> View on Google Maps
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <h5 className="font-medium text-neutral-900 mb-2">Day Summary</h5>
            <p className="text-sm text-neutral-600">
              {day.summary}
            </p>
            <div className="mt-3 flex items-center text-sm flex-wrap gap-2">
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
