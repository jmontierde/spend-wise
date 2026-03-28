import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatCurrency } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function SavingsDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  const account = useQuery(
    api.savings.getAccountById,
    id ? { id: id as any } : "skip"
  );
  const bank = useQuery(
    api.banks.getById,
    account ? { id: account.bankId } : "skip"
  );
  const transactions = useQuery(
    api.savings.listTransactions,
    currentUser && id
      ? {
          userId: currentUser._id,
          accountId: id as any,
          limit: 20,
        }
      : "skip"
  );

  const updateAccount = useMutation(api.savings.updateAccount);
  const deleteAccount = useMutation(api.savings.deleteAccount);

  const currency = currentUser?.currency || "PHP";

  const handleUpdateBalance = async () => {
    if (!account || !newBalance) return;
    try {
      await updateAccount({
        id: account._id,
        balance: parseFloat(newBalance),
      });
      setEditing(false);
      setNewBalance("");
    } catch (error) {
      console.error("Failed to update balance:", error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this account? All transactions will be lost."))
      return;
    try {
      await deleteAccount({ id: id as any });
      navigate("/savings");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  if (!account || !bank) return null;

  return (
    <div>
      <Header title="Account Details" />
      <div className="p-6 max-w-3xl">
        {/* Account Header */}
        <div
          className="rounded-2xl p-6 text-white mb-6 text-center"
          style={{ backgroundColor: bank.color }}
        >
          <p className="text-lg font-semibold">{bank.name}</p>
          {account.accountName && (
            <p className="text-white/80 text-sm">{account.accountName}</p>
          )}
          <p className="text-3xl font-bold my-3">
            {formatCurrency(account.balance, currency)}
          </p>
          <div className="flex justify-center gap-4 text-sm text-white/80">
            <span>
              {account.accountType === "savings"
                ? "Savings Account"
                : "Time Deposit"}
            </span>
            {account.interestRate && (
              <span>{account.interestRate}% p.a.</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setNewBalance(account.balance.toString());
              setEditing(true);
            }}
          >
            <Pencil size={16} /> Update Balance
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/savings/${id}/transaction`)}
          >
            <Plus size={16} /> Add Transaction
          </Button>
        </div>

        {/* Transactions */}
        <Card className="overflow-hidden mb-6">
          <h3 className="font-semibold px-5 pt-5 pb-2">Transactions</h3>
          {transactions && transactions.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx: any) => {
                const isDeposit =
                  tx.type === "deposit" || tx.type === "interest";
                return (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDeposit ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownLeft size={16} className="text-green-500" />
                        ) : (
                          <ArrowUpRight size={16} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(tx.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isDeposit ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">
              No transactions yet
            </p>
          )}
        </Card>

        {/* Delete */}
        <Button variant="danger" className="w-full" onClick={handleDelete}>
          <Trash2 size={16} /> Delete Account
        </Button>

        {/* Edit Balance Modal */}
        <Modal
          open={editing}
          onClose={() => setEditing(false)}
          title="Update Balance"
        >
          <div className="space-y-4">
            <Input
              label="New Balance"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateBalance}>
                Update
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
