export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mb-4"></div>
      <h3 className="text-xl font-medium text-neutral-900 mb-2">Creating Your Perfect Itinerary</h3>
      <p className="text-neutral-600 text-center max-w-md">
        We're searching for the best options based on your preferences. This may take a moment...
      </p>
    </div>
  );
}
