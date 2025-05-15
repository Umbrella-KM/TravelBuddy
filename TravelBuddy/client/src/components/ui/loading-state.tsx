import { Plane, MapPin, Hotel, Utensils } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-6">
        {/* Spinning globe */}
        <div className="w-24 h-24 border-4 border-blue-100 border-t-primary border-b-primary rounded-full animate-spin absolute"></div>
        
        {/* Flying plane */}
        <div className="absolute top-0 left-0 animate-float">
          <Plane className="h-8 w-8 text-primary transform -rotate-45" />
        </div>
      </div>
      
      <h3 className="text-xl font-medium text-neutral-900 mb-2">{message}</h3>
      <p className="text-neutral-600 text-center max-w-md mb-6">
        We're searching for the best options based on your preferences. This may take a moment...
      </p>
      
      <div className="flex space-x-8 mt-4">
        <div className="flex flex-col items-center animate-pulse" style={{ animationDelay: "0s" }}>
          <Hotel className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm text-neutral-600">Finding hotels...</span>
        </div>
        
        <div className="flex flex-col items-center animate-pulse" style={{ animationDelay: "0.5s" }}>
          <Utensils className="h-8 w-8 text-orange-500 mb-2" />
          <span className="text-sm text-neutral-600">Discovering restaurants...</span>
        </div>
        
        <div className="flex flex-col items-center animate-pulse" style={{ animationDelay: "1s" }}>
          <MapPin className="h-8 w-8 text-red-500 mb-2" />
          <span className="text-sm text-neutral-600">Mapping attractions...</span>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-neutral-500 animate-pulse">
        Your adventure is being crafted with care...
      </div>
    </div>
  );
}
