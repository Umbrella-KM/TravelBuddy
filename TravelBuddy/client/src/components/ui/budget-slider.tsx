import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface BudgetSliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
}

export function BudgetSlider({ min, max, step, defaultValue, onChange }: BudgetSliderProps) {
  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleValueChange = (values: number[]) => {
    setValue(values[0]);
    onChange(values[0]);
  };

  // Format as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-2xl font-semibold text-neutral-900">{formatCurrency(value)}</span>
        <span className="ml-1 text-neutral-600">USD</span>
      </div>
      
      <Slider 
        defaultValue={[value]} 
        min={min} 
        max={max} 
        step={step} 
        onValueChange={handleValueChange}
      />
      
      <div className="flex justify-between text-xs text-neutral-600">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max / 2)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
