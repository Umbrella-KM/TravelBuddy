import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BudgetSlider } from "@/components/ui/budget-slider";
import { SelectionCard, SelectionGroup } from "@/components/ui/selection-card";
import { preferencesSchema } from "@shared/schema";

const formSchema = z.object({
  totalBudget: z.number().min(200),
  preferences: preferencesSchema,
});

interface BudgetFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onBack: () => void;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  destination?: string; // Add destination prop
}

export function BudgetForm({ onSubmit, onBack, defaultValues = {}, destination = '' }: BudgetFormProps) {
  const [budget, setBudget] = useState(defaultValues.totalBudget || 1500);
  // Store the destination for India-specific features
  const [selectedDestination] = useState(destination);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(
    defaultValues.preferences?.accommodation || "mid-range"
  );
  const [selectedFood, setSelectedFood] = useState<any>(
    defaultValues.preferences?.food || "local"
  );
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    defaultValues.preferences?.activities || ["sightseeing", "cultural"]
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalBudget: budget,
      preferences: {
        accommodation: selectedAccommodation as any,
        food: selectedFood as any,
        activities: selectedActivities as any[],
      },
    },
  });

  const handleBudgetChange = (value: number) => {
    setBudget(value);
    form.setValue("totalBudget", value);
  };

  const handleAccommodationSelect = (value: string) => {
    setSelectedAccommodation(value);
    form.setValue("preferences.accommodation", value as any);
  };

  const handleFoodSelect = (value: string) => {
    setSelectedFood(value);
    form.setValue("preferences.food", value as any);
  };

  const toggleActivity = (value: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(value)) {
        const newActivities = prev.filter(item => item !== value);
        form.setValue("preferences.activities", newActivities as any[]);
        return newActivities;
      } else {
        const newActivities = [...prev, value];
        form.setValue("preferences.activities", newActivities as any[]);
        return newActivities;
      }
    });
  };

  // Calculate budget allocation based on preferences
  const calculateBudgetAllocation = () => {
    // Different allocation percentages based on accommodation preference
    let accommodationPercent = 0.35; // default
    if (selectedAccommodation === "budget") accommodationPercent = 0.25;
    if (selectedAccommodation === "luxury") accommodationPercent = 0.45;

    // Different allocation percentages based on food preference
    let foodPercent = 0.25; // default
    if (selectedFood === "budget") foodPercent = 0.15;
    if (selectedFood === "fine") foodPercent = 0.35;

    // Calculate remaining percentages
    let activitiesPercent = 0.25;
    let transportationPercent = 1 - accommodationPercent - foodPercent - activitiesPercent;

    return {
      accommodation: Math.round(budget * accommodationPercent),
      food: Math.round(budget * foodPercent),
      activities: Math.round(budget * activitiesPercent),
      transportation: Math.round(budget * transportationPercent),
    };
  };

  const budgetAllocation = calculateBudgetAllocation();

  const handleSubmit = () => {
    // Ensure activities array has at least one item
    if (selectedActivities.length === 0) {
      form.setValue("preferences.activities", ["sightseeing"] as any[]);
      setSelectedActivities(["sightseeing"]);
    }
    
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-medium text-neutral-900 mb-4">What's your budget?</h3>
            
            <div className="mb-6">
              <label className="block text-neutral-600 mb-1">Total Budget</label>
              <BudgetSlider 
                min={200} 
                max={10000} 
                step={100} 
                defaultValue={budget}
                onChange={handleBudgetChange}
              />
            </div>
            
            <div className="bg-neutral-100 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-neutral-900 mb-3">Budget Allocation</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accommodation</span>
                    <span className="font-medium">${budgetAllocation.accommodation} ({Math.round(budgetAllocation.accommodation / budget * 100)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${budgetAllocation.accommodation / budget * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Food & Dining</span>
                    <span className="font-medium">${budgetAllocation.food} ({Math.round(budgetAllocation.food / budget * 100)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${budgetAllocation.food / budget * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Activities & Attractions</span>
                    <span className="font-medium">${budgetAllocation.activities} ({Math.round(budgetAllocation.activities / budget * 100)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${budgetAllocation.activities / budget * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transportation</span>
                    <span className="font-medium">${budgetAllocation.transportation} ({Math.round(budgetAllocation.transportation / budget * 100)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-neutral-600 h-2 rounded-full" style={{ width: `${budgetAllocation.transportation / budget * 100}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-neutral-600 mt-3">
                * These are suggested allocations. You can customize your budget during itinerary generation.
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-medium text-neutral-900 mb-4">Your Preferences</h3>
            
            <SelectionGroup 
              label="Accommodation Type" 
              className="mb-6"
            >
              <SelectionCard
                icon="fas fa-bed"
                label="Budget"
                selected={selectedAccommodation === "budget"}
                onClick={() => handleAccommodationSelect("budget")}
              />
              <SelectionCard
                icon="fas fa-hotel"
                label="Mid-range"
                selected={selectedAccommodation === "mid-range"}
                onClick={() => handleAccommodationSelect("mid-range")}
              />
              <SelectionCard
                icon="fas fa-concierge-bell"
                label="Luxury"
                selected={selectedAccommodation === "luxury"}
                onClick={() => handleAccommodationSelect("luxury")}
              />
            </SelectionGroup>
            
            <SelectionGroup 
              label="Food Preferences" 
              className="mb-6"
            >
              <SelectionCard
                icon="fas fa-utensils"
                label="Budget"
                selected={selectedFood === "budget"}
                onClick={() => handleFoodSelect("budget")}
              />
              <SelectionCard
                icon="fas fa-globe-americas"
                label="Local Cuisine"
                selected={selectedFood === "local"}
                onClick={() => handleFoodSelect("local")}
              />
              <SelectionCard
                icon="fas fa-glass-cheers"
                label="Fine Dining"
                selected={selectedFood === "fine"}
                onClick={() => handleFoodSelect("fine")}
              />
            </SelectionGroup>
            
            <div>
              <label className="block text-neutral-600 mb-2">Activity Interests</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SelectionCard
                  icon="fas fa-camera"
                  label="Sightseeing"
                  selected={selectedActivities.includes("sightseeing")}
                  onClick={() => toggleActivity("sightseeing")}
                />
                <SelectionCard
                  icon="fas fa-landmark"
                  label="Cultural"
                  selected={selectedActivities.includes("cultural")}
                  onClick={() => toggleActivity("cultural")}
                />
                <SelectionCard
                  icon="fas fa-hiking"
                  label="Adventure"
                  selected={selectedActivities.includes("adventure")}
                  onClick={() => toggleActivity("adventure")}
                />
                <SelectionCard
                  icon="fas fa-spa"
                  label="Relaxation"
                  selected={selectedActivities.includes("relaxation")}
                  onClick={() => toggleActivity("relaxation")}
                />
                <SelectionCard
                  icon="fas fa-shopping-bag"
                  label="Shopping"
                  selected={selectedActivities.includes("shopping")}
                  onClick={() => toggleActivity("shopping")}
                />
                <SelectionCard
                  icon="fas fa-moon"
                  label="Nightlife"
                  selected={selectedActivities.includes("nightlife")}
                  onClick={() => toggleActivity("nightlife")}
                />

                {/* Add India-specific activities if destination contains India */}
                {selectedDestination && 
                 selectedDestination.toLowerCase().includes('india') && (
                  <>
                    <div className="col-span-full mt-4 mb-2">
                      <h4 className="font-medium text-orange-600">
                        India-specific Activities
                      </h4>
                    </div>
                    <SelectionCard
                      icon="fas fa-pray"
                      label="Temple Visits"
                      selected={selectedActivities.includes("temple-visits")}
                      onClick={() => toggleActivity("temple-visits")}
                    />
                    <SelectionCard
                      icon="fas fa-monument"
                      label="Heritage Sites"
                      selected={selectedActivities.includes("heritage-sites")}
                      onClick={() => toggleActivity("heritage-sites")}
                    />
                    <SelectionCard
                      icon="fas fa-leaf"
                      label="Ayurveda & Wellness"
                      selected={selectedActivities.includes("ayurveda-wellness")}
                      onClick={() => toggleActivity("ayurveda-wellness")}
                    />
                    <SelectionCard
                      icon="fas fa-paw"
                      label="Wildlife Safari"
                      selected={selectedActivities.includes("wildlife-safari")}
                      onClick={() => toggleActivity("wildlife-safari")}
                    />
                    <SelectionCard
                      icon="fas fa-water"
                      label="Backwaters"
                      selected={selectedActivities.includes("backwaters")}
                      onClick={() => toggleActivity("backwaters")}
                    />
                    <SelectionCard
                      icon="fas fa-utensils"
                      label="Street Food Tours"
                      selected={selectedActivities.includes("street-food-tours")}
                      onClick={() => toggleActivity("street-food-tours")}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
          >
            Generate Itinerary <i className="fas fa-magic ml-2"></i>
          </Button>
        </div>
      </div>
    </Form>
  );
}
