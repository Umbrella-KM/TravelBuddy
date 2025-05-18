import { BudgetAllocation } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

  // Calculate daily budget
  const dailyBudget = Math.round(totalBudget / days);
  
  // Calculate per-person costs (assuming 1 person by default)
  const perPersonTotal = totalBudget;
  
  // Prepare data for pie chart
  const budgetData = [
    { name: 'Accommodation', value: budgetAllocation.accommodation, color: '#3b82f6' },
    { name: 'Food & Dining', value: budgetAllocation.food, color: '#f97316' },
    { name: 'Activities', value: budgetAllocation.activities, color: '#8b5cf6' },
    { name: 'Transportation', value: budgetAllocation.transportation, color: '#6b7280' },
  ];
  
  // Calculate accommodation cost per night
  const accommodationPerNight = Math.round(budgetAllocation.accommodation / days);
  
  // Calculate food cost per day
  const foodPerDay = Math.round(budgetAllocation.food / days);
  
  // Calculate activities cost per day
  const activitiesPerDay = Math.round(budgetAllocation.activities / days);
  
  // Calculate transportation cost per day
  const transportationPerDay = Math.round(budgetAllocation.transportation / days);

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
        <h4 className="font-medium text-neutral-900 mb-3">Comprehensive Budget Breakdown</h4>
        
        {/* Budget Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Accommodation</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.accommodation)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.accommodation / totalBudget * 100)}% of budget</div>
            <div className="text-xs text-neutral-500 mt-1">{formatCurrency(accommodationPerNight)}/night</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Food & Dining</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.food)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.food / totalBudget * 100)}% of budget</div>
            <div className="text-xs text-neutral-500 mt-1">{formatCurrency(foodPerDay)}/day</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Activities</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.activities)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.activities / totalBudget * 100)}% of budget</div>
            <div className="text-xs text-neutral-500 mt-1">{formatCurrency(activitiesPerDay)}/day</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Transportation</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(budgetAllocation.transportation)}</div>
            <div className="text-sm text-neutral-600">{Math.round(budgetAllocation.transportation / totalBudget * 100)}% of budget</div>
            <div className="text-xs text-neutral-500 mt-1">{formatCurrency(transportationPerDay)}/day</div>
          </div>
        </div>
        
        {/* Additional Budget Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Total Budget</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(totalBudget)}</div>
            <div className="text-sm text-neutral-600">For {days} days</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Daily Budget</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(dailyBudget)}</div>
            <div className="text-sm text-neutral-600">Per day</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-neutral-600 mb-1">Per Person</div>
            <div className="text-xl font-medium text-neutral-900">{formatCurrency(perPersonTotal)}</div>
            <div className="text-sm text-neutral-600">Total trip cost</div>
          </div>
        </div>
        
        {/* Budget Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-medium text-neutral-900 mb-3">Budget Distribution</h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Budget Progress Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-medium text-neutral-900 mb-3">Budget Allocation</h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-600">Accommodation</span>
                  <span className="text-sm font-medium">{formatCurrency(budgetAllocation.accommodation)} ({Math.round(budgetAllocation.accommodation / totalBudget * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${Math.round(budgetAllocation.accommodation / totalBudget * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-600">Food & Dining</span>
                  <span className="text-sm font-medium">{formatCurrency(budgetAllocation.food)} ({Math.round(budgetAllocation.food / totalBudget * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: `${Math.round(budgetAllocation.food / totalBudget * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-600">Activities</span>
                  <span className="text-sm font-medium">{formatCurrency(budgetAllocation.activities)} ({Math.round(budgetAllocation.activities / totalBudget * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${Math.round(budgetAllocation.activities / totalBudget * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-600">Transportation</span>
                  <span className="text-sm font-medium">{formatCurrency(budgetAllocation.transportation)} ({Math.round(budgetAllocation.transportation / totalBudget * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="bg-neutral-600 h-full" style={{ width: `${Math.round(budgetAllocation.transportation / totalBudget * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
