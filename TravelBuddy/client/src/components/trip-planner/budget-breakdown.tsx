import { BudgetAllocation } from "@shared/schema";

interface BudgetBreakdownProps {
  totalBudget: number;
  budgetAllocation: BudgetAllocation;
  destination: string;
  startDate?: string;
  endDate?: string;
  days: number;
}

export function BudgetBreakdown({ 
  totalBudget,
  budgetAllocation,
  destination,
  startDate,
  endDate,
  days
}: BudgetBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format dates for display
  const formatDateRange = () => {
    if (!startDate || !endDate) return `${days} days`;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Your {destination} Itinerary</h3>
          <p className="text-neutral-600">{formatDateRange()} • {formatCurrency(totalBudget)} budget</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-900 hover:bg-neutral-100 transition">
            <i className="far fa-save mr-1"></i> Save
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-900 hover:bg-neutral-100 transition">
            <i className="fas fa-share-alt mr-1"></i> Share
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-900 hover:bg-neutral-100 transition">
            <i className="fas fa-print mr-1"></i> Print
          </button>
        </div>
      </div>
      
      <div className="bg-neutral-100 p-5 rounded-lg mb-8">
        <h4 className="font-medium text-neutral-900 mb-3">Budget Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Accommodation</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.accommodation)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.accommodation / totalBudget * 100)}% of budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Food & Dining</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.food)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.food / totalBudget * 100)}% of budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Activities</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.activities)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.activities / totalBudget * 100)}% of budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Transportation</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.transportation)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.transportation / totalBudget * 100)}% of budget</div>
          </div>
        </div>
        <div className="w-full bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Budget</span>
            <span className="font-medium">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="w-full h-4 bg-neutral-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div className="bg-blue-600 h-full" style={{ width: `${Math.round(budgetAllocation.accommodation / totalBudget * 100)}%` }}></div>
              <div className="bg-orange-500 h-full" style={{ width: `${Math.round(budgetAllocation.food / totalBudget * 100)}%` }}></div>
              <div className="bg-primary h-full" style={{ width: `${Math.round(budgetAllocation.activities / totalBudget * 100)}%` }}></div>
              <div className="bg-neutral-600 h-full" style={{ width: `${Math.round(budgetAllocation.transportation / totalBudget * 100)}%` }}></div>
            </div>
          </div>
          <div className="flex text-xs mt-2 text-neutral-600 justify-between">
            <span>Accommodation</span>
            <span>Food</span>
            <span>Activities</span>
            <span>Transport</span>
          </div>
        </div>
      </div>
    </div>
  );
}
