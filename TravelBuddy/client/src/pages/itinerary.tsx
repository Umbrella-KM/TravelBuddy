import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { getItinerary } from "@/lib/travel-api";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetBreakdown } from "@/components/trip-planner/budget-breakdown";
import { ItineraryDay } from "@/components/trip-planner/itinerary-day";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Itinerary() {
  const { id } = useParams();
  const itineraryId = parseInt(id);

  // Fetch itinerary data
  const { data: itineraryData, isLoading, isError } = useQuery({
    queryKey: [`/api/itineraries/${itineraryId}`],
    queryFn: () => getItinerary(itineraryId),
    enabled: !isNaN(itineraryId),
  });

  // If we have itinerary data, extract the relevant parts
  const itinerary = itineraryData?.itineraryData;

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent>
            <LoadingState message="Loading your itinerary..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !itinerary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Itinerary Not Found</h2>
            <p className="text-neutral-600 mb-6">We couldn't find the itinerary you're looking for.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 mb-8">
        <CardContent>
          <BudgetBreakdown 
            totalBudget={itinerary.totalBudget}
            budgetAllocation={itinerary.budgetAllocation}
            destination={itinerary.destination}
            startDate={itinerary.dates?.start}
            endDate={itinerary.dates?.end}
            days={itinerary.days}
          />
        </CardContent>
      </Card>

      <div className="space-y-6 mb-8">
        {itinerary.itineraryDays.map((day: any) => (
          <ItineraryDay 
            key={day.day} 
            day={day}
            isOpen={day.day === 1} // First day is expanded by default
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/">
          <Button variant="outline" className="mr-4">
            <i className="fas fa-arrow-left mr-2"></i> Back to Home
          </Button>
        </Link>
        <Button>
          <i className="fas fa-print mr-2"></i> Print Itinerary
        </Button>
      </div>
    </div>
  );
}
