import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Plus, List, CalendarDays, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatCurrency, CATEGORY_ICONS } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setExpenseViewMode } from "@/store/slices/uiSlice";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ExpenseListItem from "@/components/expense/ExpenseListItem";
import { SkeletonExpenseList } from "@/components/ui/Skeleton";

export default function Expenses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.ui.expenseViewMode);
  const { currentUser } = useCurrentUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const expensesData = useQuery(
    api.expenses.list,
    currentUser ? { userId: currentUser._id, limit: 50 } : "skip"
  );

  const currency = currentUser?.currency || "PHP";

  const calendarData = useMemo(() => {
    if (!expensesData?.items) return {};
    const byDay: Record<string, { total: number; expenses: any[] }> = {};
    const monthStart = startOfMonth(currentMonth).getTime();
    const monthEnd = endOfMonth(currentMonth).getTime();

    for (const expense of expensesData.items) {
      if (expense.date >= monthStart && expense.date <= monthEnd) {
        const dayKey = format(new Date(expense.date), "yyyy-MM-dd");
        if (!byDay[dayKey]) byDay[dayKey] = { total: 0, expenses: [] };
        byDay[dayKey].total += expense.amount;
        byDay[dayKey].expenses.push(expense);
      }
    }
    return byDay;
  }, [expensesData?.items, currentMonth]);

  const daysInMonth = endOfMonth(currentMonth).getDate();
  const firstDayOfWeek = startOfMonth(currentMonth).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthTotal = Object.values(calendarData).reduce(
    (sum, d) => sum + d.total,
    0
  );

  return (
    <div>
      <Header title="Expenses" />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => dispatch(setExpenseViewMode("list"))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-[#0a7ea4] dark:bg-[#4db8db] text-white"
                  : "text-gray-500"
              }`}
            >
              <List size={16} /> List
            </button>
            <button
              onClick={() => dispatch(setExpenseViewMode("calendar"))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-[#0a7ea4] dark:bg-[#4db8db] text-white"
                  : "text-gray-500"
              }`}
            >
              <CalendarDays size={16} /> Calendar
            </button>
          </div>
          <Button onClick={() => navigate("/expenses/add")}>
            <Plus size={18} /> Add Expense
          </Button>
        </div>

        {viewMode === "list" ? (
          expensesData === undefined ? (
            <SkeletonExpenseList count={8} />
          ) : (
          <Card className="overflow-hidden">
            {expensesData?.items && expensesData.items.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {expensesData.items.map((expense: any) => (
                  <ExpenseListItem
                    key={expense._id}
                    expense={expense}
                    currency={currency}
                    onClick={() => navigate(`/expenses/${expense._id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Receipt size={48} />}
                title="No expenses yet"
                subtitle="Start tracking your spending by adding your first expense"
                actionLabel="Add Expense"
                onAction={() => navigate("/expenses/add")}
              />
            )}
          </Card>
          )
        ) : (
          <Card className="p-5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <h3 className="font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                {monthTotal > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Total: {formatCurrency(monthTotal, currency)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const dayKey = format(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  ),
                  "yyyy-MM-dd"
                );
                const dayData = calendarData[dayKey];
                return (
                  <div
                    key={day}
                    className={`aspect-square p-1 rounded-lg text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      dayData ? "bg-red-50 dark:bg-red-900/10" : ""
                    }`}
                    onClick={() => {
                      if (dayData) {
                        // Could show a modal with day's expenses
                      }
                    }}
                  >
                    <span className="text-xs">{day}</span>
                    {dayData && (
                      <p className="text-[10px] text-red-500 font-medium truncate">
                        {formatCurrency(dayData.total, currency, true)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
