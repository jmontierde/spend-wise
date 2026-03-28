import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { CATEGORY_ICONS } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ExpenseAdd() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = useQuery(api.categories.list, {
    userId: currentUser?._id,
  });
  const createExpense = useMutation(api.expenses.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !categoryId || !amount) return;

    setLoading(true);
    try {
      await createExpense({
        userId: currentUser._id,
        categoryId: categoryId as any,
        amount: parseFloat(amount),
        description,
        date: new Date(date).getTime(),
        notes: notes || undefined,
      });
      navigate("/expenses");
    } catch (error) {
      console.error("Failed to create expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Add Expense" />
      <div className="p-6 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Description"
              placeholder="e.g., Lunch at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories?.map((cat: any) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors border ${
                      categoryId === cat._id
                        ? "border-[#0a7ea4] dark:border-[#4db8db] bg-[#0a7ea4]/5 dark:bg-[#4db8db]/5"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat.icon] || "📦"}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Notes (optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 resize-none"
                rows={3}
                placeholder="Add any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!amount || !description || !categoryId || loading}
              >
                {loading ? "Saving..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
