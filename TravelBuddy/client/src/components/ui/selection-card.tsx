import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export function SelectionCard({ icon, label, selected = false, onClick }: SelectionCardProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 border rounded-lg text-center transition-all",
        selected ? 
          "border-primary bg-primary/10" :
          "border-neutral-200 hover:border-primary"
      )}
    >
      <i className={`${icon} ${selected ? 'text-primary' : 'text-neutral-600'} mb-1`}></i>
      <div className={`text-sm ${selected ? 'font-medium' : ''}`}>{label}</div>
    </button>
  );
}

interface SelectionGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectionGroup({ label, children, className }: SelectionGroupProps) {
  return (
    <div className={className}>
      <label className="block text-neutral-600 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}
