import { formatCurrency } from "@spend-wise/shared";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  currency: string;
  label?: string;
  color?: string;
}

export default function BudgetProgress({
  spent,
  budget,
  currency,
  label,
  color,
}: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const barColor =
    color || (percentage > 90 ? "#ef4444" : percentage > 75 ? "#eab308" : "#22c55e");

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {formatCurrency(spent, currency)} spent
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatCurrency(budget, currency)} budget
        </span>
      </div>
    </div>
  );
}
