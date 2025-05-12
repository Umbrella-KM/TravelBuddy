import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DestinationDetailsProps {
  destination: {
    id: number;
    name: string;
    country: string;
    description?: string;
    imageUrl?: string;
    region?: string;
    bestTimeToVisit?: string;
    famousFor?: string;
    localLanguage?: string;
  };
}

export function DestinationDetails({ destination }: DestinationDetailsProps) {
  return (
    <Card className="overflow-hidden">
      {destination.imageUrl ? (
        <div className="relative h-48">
          <img 
            src={destination.imageUrl} 
            alt={destination.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h3 className="text-xl font-bold">{destination.name}</h3>
              <p className="text-sm opacity-90">{destination.country}</p>
            </div>
          </div>
        </div>
      ) : (
        <CardHeader>
          <CardTitle>{destination.name}</CardTitle>
          <CardDescription>{destination.country}</CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="pt-4">
        {destination.description && (
          <p className="text-sm text-gray-600 mb-4">{destination.description}</p>
        )}
        
        {/* India-specific details section */}
        {destination.country === 'India' && (
          <div className="space-y-3 mt-2">
            {destination.region && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold min-w-24">Region:</span>
                <Badge variant="outline" className="bg-blue-50">{destination.region}</Badge>
              </div>
            )}
            
            {destination.bestTimeToVisit && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold min-w-24">Best Time:</span>
                <span className="text-sm">{destination.bestTimeToVisit}</span>
              </div>
            )}
            
            {destination.famousFor && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold min-w-24">Famous For:</span>
                <span className="text-sm">{destination.famousFor}</span>
              </div>
            )}
            
            {destination.localLanguage && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold min-w-24">Local Language:</span>
                <span className="text-sm">{destination.localLanguage}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                Indian Destination
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}