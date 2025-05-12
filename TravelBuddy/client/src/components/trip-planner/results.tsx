import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BudgetBreakdown } from "./budget-breakdown";
import { ItineraryDay } from "./itinerary-day";
import { GeneratedItinerary } from "@/types/itinerary";
import { useMutation } from "@tanstack/react-query";
import { saveItinerary } from "@/lib/travel-api";
import { useToast } from "@/hooks/use-toast";

interface ResultsProps {
  itinerary: GeneratedItinerary;
  onBack: () => void;
  onComplete: () => void;
}

export function ItineraryResults({ itinerary, onBack, onComplete }: ResultsProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<number>(1); // First day is expanded by default
  
  const saveItineraryMutation = useMutation({
    mutationFn: saveItinerary,
    onSuccess: () => {
      toast({
        title: "Itinerary saved!",
        description: "Your itinerary has been saved successfully.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to save itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSaveItinerary = () => {
    saveItineraryMutation.mutate(itinerary);
  };

  return (
    <div>
      <BudgetBreakdown 
        totalBudget={itinerary.totalBudget}
        budgetAllocation={itinerary.budgetAllocation}
        destination={itinerary.destination}
        startDate={itinerary.dates.start || undefined}
        endDate={itinerary.dates.end || undefined}
        days={itinerary.days}
      />
      
      {/* Day by Day Itinerary */}
      <div className="space-y-6">
        {itinerary.itineraryDays.map((day) => (
          <ItineraryDay 
            key={day.day} 
            day={day} 
            isOpen={day.day === 1} // First day is open by default
          />
        ))}
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline"
          onClick={onBack}
        >
          <i className="fas fa-arrow-left mr-2"></i> Edit Preferences
        </Button>
        <Button 
          onClick={handleSaveItinerary}
          disabled={saveItineraryMutation.isPending}
        >
          {saveItineraryMutation.isPending ? (
            <>Saving... <i className="fas fa-circle-notch fa-spin ml-2"></i></>
          ) : (
            <>Finalize Itinerary <i className="fas fa-check ml-2"></i></>
          )}
        </Button>
      </div>
    </div>
  );
}
