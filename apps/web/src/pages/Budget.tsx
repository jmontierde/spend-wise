import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Plus, Wallet, Lightbulb } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatCurrency } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import BudgetProgress from "@/components/charts/BudgetProgress";
import { SkeletonBudgetProgress } from "@/components/ui/Skeleton";

export default function Budget() {
  const { currentUser } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const [loading, setLoading] = useState(false);

  const budgetStatus = useQuery(
    api.budgets.getCurrentMonthStatus,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const categories = useQuery(api.categories.list, {
    userId: currentUser?._id,
  });

  const createBudget = useMutation(api.budgets.create);
  const updateBudget = useMutation(api.budgets.update);
  const removeBudget = useMutation(api.budgets.remove);

  const currency = currentUser?.currency || "PHP";

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setAmount(budget.amount.toString());
    setSelectedCategory(budget.categoryId || "");
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBudget(null);
    setAmount("");
    setSelectedCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !amount) return;

    setLoading(true);
    try {
      const currentMonth =
        new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

      if (editingBudget) {
        await updateBudget({
          id: editingBudget._id,
          amount: parseFloat(amount),
        });
      } else {
        await createBudget({
          userId: currentUser._id,
          amount: parseFloat(amount),
          month: currentMonth,
          categoryId: selectedCategory ? (selectedCategory as any) : undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c: any) => c._id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories?.find((c: any) => c._id === categoryId)?.color || "#6b7280";
  };

  return (
    <div>
      <Header title="Budget" />
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Budget</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Budget
          </Button>
        </div>

        {/* Overall Budget */}
        {budgetStatus === undefined ? (
          <div className="space-y-4 mb-6">
            <SkeletonBudgetProgress />
            <SkeletonBudgetProgress />
          </div>
        ) : budgetStatus?.overallBudget ? (
          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Overall Budget</h3>
              <button
                onClick={() => handleEdit(budgetStatus.overallBudget)}
                className="text-sm text-[#0a7ea4] dark:text-[#4db8db] font-medium"
              >
                Edit
              </button>
            </div>
            <BudgetProgress
              spent={budgetStatus.totalSpent}
              budget={budgetStatus.overallBudget.amount}
              currency={currency}
            />
          </Card>
        ) : (
          <Card className="mb-6">
            <EmptyState
              icon={<Wallet size={48} />}
              title="Set a Monthly Budget"
              subtitle="Track your spending against a budget goal"
              actionLabel="Create Budget"
              onAction={() => setShowForm(true)}
            />
          </Card>
        )}

        {/* Category Budgets */}
        {budgetStatus?.categoryBudgets &&
          budgetStatus.categoryBudgets.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Category Budgets</h3>
              <div className="space-y-3">
                {budgetStatus.categoryBudgets.map((item: any) => (
                  <Card key={item.budget._id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getCategoryColor(
                              item.budget.categoryId
                            ),
                          }}
                        />
                        <span className="font-medium text-sm">
                          {getCategoryName(item.budget.categoryId)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEdit(item.budget)}
                        className="text-xs text-[#0a7ea4] dark:text-[#4db8db] font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <BudgetProgress
                      spent={item.spent}
                      budget={item.budget.amount}
                      currency={currency}
                      color={getCategoryColor(item.budget.categoryId)}
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

        {/* Tip */}
        <div className="flex items-start gap-3 mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
          <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set category budgets to get more detailed tracking and alerts when
            you&apos;re close to your limits.
          </p>
        </div>

        {/* Budget Form Modal */}
        <Modal
          open={showForm}
          onClose={handleClose}
          title={editingBudget ? "Edit Budget" : "New Budget"}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {!editingBudget && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category (optional - leave empty for overall budget)
                </label>
                <select
                  className="w-full h-12 px-4 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Overall Budget</option>
                  {categories?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!amount || loading}>
                {loading ? "Saving..." : editingBudget ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
