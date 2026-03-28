import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "@convex/_generated/api";
import { formatCurrency } from "@spend-wise/shared";
import { CATEGORY_ICONS } from "@spend-wise/shared";

interface ExpenseListItemProps {
  expense: {
    _id: string;
    categoryId: string;
    amount: number;
    description: string;
    date: number;
  };
  currency: string;
  onClick?: () => void;
}

export default function ExpenseListItem({
  expense,
  currency,
  onClick,
}: ExpenseListItemProps) {
  const category = useQuery(api.categories.getById, {
    id: expense.categoryId as any,
  });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: (category?.color || "#6b7280") + "20" }}
        >
          {CATEGORY_ICONS[category?.icon || ""] || "📦"}
        </div>
        <div>
          <p className="text-sm font-medium">{expense.description}</p>
          <p className="text-xs text-gray-400">
            {category?.name || "..."} &middot;{" "}
            {format(new Date(expense.date), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-red-500">
        -{formatCurrency(expense.amount, currency)}
      </span>
    </button>
  );
}
