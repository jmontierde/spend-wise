import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SavingsTransaction() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useCurrentUser();
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const accounts = useQuery(
    api.savings.listAccounts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const addTransaction = useMutation(api.savings.addTransaction);

  const accountId = id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !accountId || !amount || !description) return;

    setLoading(true);
    try {
      await addTransaction({
        userId: currentUser._id,
        accountId: accountId as any,
        type,
        amount: parseFloat(amount),
        description,
        date: Date.now(),
      });
      navigate(`/savings/${accountId}`);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Add Transaction" />
      <div className="p-6 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("deposit")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  type === "deposit"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setType("withdrawal")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  type === "withdrawal"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
              >
                Withdrawal
              </button>
            </div>

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
              placeholder="e.g., Salary, Transfer from BPI"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* Account Selection (if no id in URL) */}
            {!id && accounts && accounts.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Select Account
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {accounts.map((acc: any) => (
                    <AccountOption
                      key={acc._id}
                      account={acc}
                      isSelected={false}
                      onSelect={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

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
                disabled={
                  !amount ||
                  !description ||
                  !accountId ||
                  loading
                }
              >
                {loading ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function AccountOption({
  account,
  isSelected,
  onSelect,
}: {
  account: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const bank = useQuery(api.banks.getById, { id: account.bankId });

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`px-4 py-3 rounded-xl text-left border-2 transition-colors ${
        isSelected
          ? "border-[#0a7ea4] dark:border-[#4db8db] bg-[#0a7ea4]/5"
          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <p className="text-sm font-semibold">{bank?.shortName || "..."}</p>
      {account.accountName && (
        <p className="text-xs text-gray-400 truncate">{account.accountName}</p>
      )}
    </button>
  );
}
