import { useState } from "react";
import { DestinationForm } from "@/components/trip-planner/destination-form";
import { BudgetForm } from "@/components/trip-planner/budget-form";
import { ItineraryResults } from "@/components/trip-planner/results";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { generateItinerary } from "@/lib/travel-api";
import { ItineraryForm } from "@shared/schema";
import { GeneratedItinerary } from "@/types/itinerary";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { MapPin, Plane, DollarSign, Calendar, Compass, Utensils, Hotel, Camera } from "lucide-react";

// Steps in the trip planning process
enum PlannerStep {
  Destination = 1,
  Budget = 2,
  Results = 3,
}

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<PlannerStep>(PlannerStep.Destination);
  const [formData, setFormData] = useState<Partial<ItineraryForm>>({
    days: 5,
    totalBudget: 1500,
    preferences: {
      accommodation: "mid-range",
      food: "local",
      activities: ["sightseeing", "cultural"],
    },
  });
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);

  // Mutation for generating itinerary
  const generateItineraryMutation = useMutation({
    mutationFn: generateItinerary,
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      setCurrentStep(PlannerStep.Results);
    },
    onError: (error) => {
      toast({
        title: "Error generating itinerary",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDestinationSubmit = (values: any) => {
    // Extract country from destination if provided (e.g., "Paris, France" -> "France")
    let country = "";
    const parts = values.destination.split(',');
    if (parts.length > 1) {
      country = parts[1].trim();
    }

    setFormData(prev => ({
      ...prev,
      ...values,
      country,
    }));
    setCurrentStep(PlannerStep.Budget);
  };

  const handleBudgetSubmit = (values: any) => {
    const completeFormData = {
      ...formData,
      ...values,
    } as ItineraryForm;
    
    setFormData(completeFormData);
    generateItineraryMutation.mutate(completeFormData);
  };

  const handleBackToDestination = () => {
    setCurrentStep(PlannerStep.Destination);
  };

  const handleBackToBudget = () => {
    setCurrentStep(PlannerStep.Budget);
  };

  const handleComplete = () => {
    toast({
      title: "Itinerary completed",
      description: "Your travel plan is ready! You can view it anytime in your saved trips.",
    });
    
    // Redirect to home or saved trips page
    navigate("/");
  };

  // Progress percentage based on current step
  const getProgressPercentage = (step: number, currentStep: PlannerStep) => {
    if (step < currentStep) return 100;
    if (step === currentStep) {
      if (currentStep === PlannerStep.Destination) return 0;
      if (currentStep === PlannerStep.Budget) return 50;
      return 100;
    }
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="animate-bounce inline-block mb-4">
          <Plane className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 animate-fadeIn">
          Adventure Awaits! Plan Your Dream Trip
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
          Enter your destination and budget to get a complete itinerary with accommodations, 
          dining options, attractions, and more. Let's make your travel dreams come true! ✨
        </p>
        <div className="flex justify-center">
          <Button 
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1" 
            size="lg" 
            onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Adventure <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </section>

      {/* Trip Planner Section */}
      <section id="planner" className="bg-white rounded-xl shadow-md p-6 mb-12 border-2 border-blue-100">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6 flex items-center">
          <Compass className="h-6 w-6 text-primary mr-2" /> Create Your Adventure
        </h2>
        
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 ${currentStep >= PlannerStep.Destination ? 'bg-primary' : 'bg-neutral-200'} text-white rounded-full flex items-center justify-center font-semibold`}>1</div>
              <div className={`ml-2 font-medium ${currentStep >= PlannerStep.Destination ? 'text-primary' : 'text-neutral-600'}`}>Destination</div>
            </div>
            <div className="flex-1 mx-4 h-1 bg-neutral-200">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${getProgressPercentage(1, currentStep)}%` }}
              ></div>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 ${currentStep >= PlannerStep.Budget ? 'bg-primary' : 'bg-neutral-200'} ${currentStep === PlannerStep.Destination ? 'text-neutral-600' : 'text-white'} rounded-full flex items-center justify-center font-semibold`}>2</div>
              <div className={`ml-2 font-medium ${currentStep >= PlannerStep.Budget ? 'text-primary' : 'text-neutral-600'}`}>Budget & Preferences</div>
            </div>
            <div className="flex-1 mx-4 h-1 bg-neutral-200">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${getProgressPercentage(2, currentStep)}%` }}
              ></div>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 ${currentStep >= PlannerStep.Results ? 'bg-primary' : 'bg-neutral-200'} ${currentStep < PlannerStep.Results ? 'text-neutral-600' : 'text-white'} rounded-full flex items-center justify-center font-semibold`}>3</div>
              <div className={`ml-2 font-medium ${currentStep >= PlannerStep.Results ? 'text-primary' : 'text-neutral-600'}`}>Itinerary</div>
            </div>
          </div>
        </div>

        {/* Step 1: Destination Form */}
        {currentStep === PlannerStep.Destination && (
          <DestinationForm
            onSubmit={handleDestinationSubmit}
            defaultValues={formData}
          />
        )}

        {/* Step 2: Budget & Preferences Form */}
        {currentStep === PlannerStep.Budget && (
          <BudgetForm
            onSubmit={handleBudgetSubmit}
            onBack={handleBackToDestination}
            defaultValues={formData}
          />
        )}

        {/* Loading State */}
        {generateItineraryMutation.isPending && (
          <LoadingState message="Creating Your Perfect Adventure" />
        )}

        {/* Step 3: Generated Itinerary */}
        {currentStep === PlannerStep.Results && generatedItinerary && (
          <ItineraryResults
            itinerary={generatedItinerary}
            onBack={handleBackToBudget}
            onComplete={handleComplete}
          />
        )}
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-8 flex items-center justify-center">
          <Camera className="h-6 w-6 text-primary mr-2" /> Why Plan With TravelBuddy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border-2 border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-2">Budget-Friendly Planning</h3>
              <p className="text-neutral-600">
                Our algorithm optimizes your itinerary to match your exact budget while 
                maximizing experiences. No surprises or hidden costs.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Utensils className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-2">Foodie Paradise</h3>
              <p className="text-neutral-600">
                Discover the best local eateries with our Yelp integration. From street food to fine dining,
                we've got your taste buds covered!
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-2">Easy Navigation</h3>
              <p className="text-neutral-600">
                Every location comes with Google Maps integration, so you'll never get lost.
                Just click and go!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-8">What Happy Travelers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-2 border-blue-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-200 mr-4 flex items-center justify-center overflow-hidden">
                  <i className="fas fa-user text-neutral-400 text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">Sarah M.</h4>
                  <div className="text-sm text-neutral-600">Tokyo, Japan Trip</div>
                  <div className="flex text-orange-500 mt-1">
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                  </div>
                </div>
              </div>
              <p className="text-neutral-600">
                "TravelBuddy saved me hours of research for my Tokyo trip. The budget breakdown was spot on, 
                and I loved how it suggested local dining spots I would have never found on my own. 
                Every day was perfectly balanced between sightseeing and relaxation."
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-blue-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-200 mr-4 flex items-center justify-center overflow-hidden">
                  <i className="fas fa-user text-neutral-400 text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">James T.</h4>
                  <div className="text-sm text-neutral-600">Barcelona, Spain Trip</div>
                  <div className="flex text-orange-500 mt-1">
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="far fa-star text-xs"></i>
                  </div>
                </div>
              </div>
              <p className="text-neutral-600">
                "As a budget traveler, I was skeptical that an app could really help me save money while having a great experience. 
                TravelBuddy proved me wrong. My Barcelona trip came in under budget, and I didn't feel like I missed out on anything!"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-8 text-center mb-12 shadow-lg">
        <div className="animate-pulse inline-block mb-4">
          <Plane className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Ready for your next adventure?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Create your personalized travel itinerary in minutes and start exploring the world without breaking the bank.
          Your dream vacation is just a few clicks away!
        </p>
        <Button 
          variant="secondary" 
          size="lg" 
          className="px-8 py-3 bg-white text-primary hover:bg-neutral-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Start Planning Now <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </section>
    </div>
  );
}
