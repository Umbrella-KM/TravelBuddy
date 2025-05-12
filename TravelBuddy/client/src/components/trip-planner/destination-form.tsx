import { useState, useEffect } from "react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDestinations } from "@/lib/travel-api";
import { DestinationDetails } from "./destination-details";

const formSchema = z.object({
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tripLength: z.number().min(1).max(30),
});

interface DestinationFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
}

interface PopularDestination {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  region?: string;
  bestTimeToVisit?: string;
  famousFor?: string;
  localLanguage?: string;
}

export function DestinationForm({ onSubmit, defaultValues = {} }: DestinationFormProps) {
  const [tripLength, setTripLength] = useState(defaultValues.tripLength || 5);
  const [selectedDestination, setSelectedDestination] = useState<PopularDestination | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: defaultValues.destination || "",
      startDate: defaultValues.startDate || "",
      endDate: defaultValues.endDate || "",
      tripLength: defaultValues.tripLength || 5,
    },
  });

  // Update trip length when dates change
  useEffect(() => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      
      if (diffDays > 0) {
        setTripLength(diffDays);
        form.setValue("tripLength", diffDays);
      }
    }
  }, [form.watch("startDate"), form.watch("endDate")]);

  // Query popular destinations from API
  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/destinations"],
    queryFn: getDestinations,
  });

  const handleTripLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setTripLength(value);
    form.setValue("tripLength", value);
  };

  const selectDestination = (destination: PopularDestination) => {
    form.setValue("destination", `${destination.name}, ${destination.country}`);
    setSelectedDestination(destination);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-medium text-neutral-900 mb-4">Where do you want to go?</h3>
            
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-neutral-600" />
                    </div>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter a destination (city, country)" 
                        className="pl-10"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="mt-6">
              <h4 className="font-medium text-neutral-900 mb-3">Popular Destinations</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {destinations.map((destination: PopularDestination) => (
                  <button 
                    key={destination.id}
                    type="button"
                    className={`p-3 border rounded-lg text-left transition ${
                      selectedDestination?.id === destination.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary'
                    }`}
                    onClick={() => selectDestination(destination)}
                  >
                    <div className="font-medium">{destination.name}</div>
                    <div className="text-sm text-neutral-600">{destination.country}</div>
                    {destination.country === 'India' && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                          Indian Destination
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Show destination details for selected destination */}
              {selectedDestination && (
                <div className="mt-6">
                  <h4 className="font-medium text-neutral-900 mb-3">Destination Details</h4>
                  <DestinationDetails destination={selectedDestination} />
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-medium text-neutral-900 mb-4">When are you traveling?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-600">Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-600">End Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="tripLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-600">Trip Length</FormLabel>
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-neutral-900">{tripLength}</span>
                      <span className="ml-1 text-neutral-600">days</span>
                    </div>
                    <FormControl>
                      <input 
                        {...field}
                        type="range" 
                        min="1" 
                        max="30" 
                        value={tripLength}
                        onChange={handleTripLengthChange}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer mt-2" 
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-neutral-600 mt-1">
                      <span>1 day</span>
                      <span>15 days</span>
                      <span>30 days</span>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">
            Continue <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </form>
    </Form>
  );
}
