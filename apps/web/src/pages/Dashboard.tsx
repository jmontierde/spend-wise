import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Plus, Receipt } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatCurrency } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import BudgetProgress from "@/components/charts/BudgetProgress";
import ExpenseListItem from "@/components/expense/ExpenseListItem";
import {
  Skeleton,
  SkeletonSpendingCard,
  SkeletonBudgetProgress,
  SkeletonExpenseList,
} from "@/components/ui/Skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const currentMonth =
    new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

  const monthlySpending = useQuery(
    api.expenses.getMonthlySpending,
    currentUser ? { userId: currentUser._id, month: currentMonth } : "skip"
  );

  const recentExpenses = useQuery(
    api.expenses.getRecent,
    currentUser ? { userId: currentUser._id, limit: 5 } : "skip"
  );

  const budgetStatus = useQuery(
    api.budgets.getCurrentMonthStatus,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const currency = currentUser?.currency || "PHP";
  const isLoading = !currentUser || monthlySpending === undefined;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 max-w-5xl">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-52" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hello, {currentUser?.name?.split(" ")[0] || "there"}
                </p>
                <h1 className="text-2xl font-bold">
                  {format(new Date(), "EEEE, MMMM d")}
                </h1>
              </>
            )}
          </div>
          <Button onClick={() => navigate("/expenses/add")}>
            <Plus size={18} /> Add Expense
          </Button>
        </div>

        {/* Spending Card */}
        {isLoading ? (
          <div className="mb-6">
            <SkeletonSpendingCard />
          </div>
        ) : (
          <div className="bg-[#0a7ea4] dark:bg-[#4db8db] rounded-2xl p-6 text-white mb-6">
            <p className="text-white/80 text-sm mb-2">Spent this month</p>
            <p className="text-4xl font-bold mb-1">
              {formatCurrency(monthlySpending?.total || 0, currency)}
            </p>
            <p className="text-white/80 text-sm">
              {monthlySpending?.expenseCount || 0} transactions
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          {isLoading ? (
            <SkeletonBudgetProgress />
          ) : (
            budgetStatus?.overallBudget && (
              <Card className="p-5">
                <h3 className="text-base font-semibold mb-4">
                  Budget Progress
                </h3>
                <BudgetProgress
                  spent={budgetStatus.totalSpent}
                  budget={budgetStatus.overallBudget.amount}
                  currency={currency}
                />
              </Card>
            )
          )}

          {/* Recent Expenses */}
          {recentExpenses === undefined ? (
            <SkeletonExpenseList count={5} />
          ) : (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <h3 className="text-base font-semibold">Recent Expenses</h3>
                <button
                  onClick={() => navigate("/expenses")}
                  className="text-sm text-[#0a7ea4] dark:text-[#4db8db] font-medium"
                >
                  See All
                </button>
              </div>
              {recentExpenses.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentExpenses.map((expense: any) => (
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
                  actionLabel="Add your first expense"
                  onAction={() => navigate("/expenses/add")}
                />
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
