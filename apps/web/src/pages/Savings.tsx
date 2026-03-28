import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { format } from "date-fns";
import { Plus, Eye, EyeOff, PiggyBank, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatCurrency } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

function AccountCard({
  account,
  currency,
  showBalance,
  onClick,
}: {
  account: any;
  currency: string;
  showBalance: boolean;
  onClick: () => void;
}) {
  const bank = useQuery(api.banks.getById, { id: account.bankId });

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="px-3 py-1 rounded-lg text-white text-xs font-semibold"
          style={{ backgroundColor: bank?.color || "#6b7280" }}
        >
          {bank?.shortName || "..."}
        </div>
        <span className="text-xs text-gray-400 capitalize">
          {account.accountType === "time_deposit" ? "Time Deposit" : "Savings"}
        </span>
      </div>
      {account.accountName && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {account.accountName}
        </p>
      )}
      <p className="text-xl font-bold">
        {showBalance ? formatCurrency(account.balance, currency) : "••••••"}
      </p>
    </Card>
  );
}

function TransactionItem({
  tx,
  currency,
}: {
  tx: any;
  currency: string;
}) {
  const isDeposit = tx.type === "deposit" || tx.type === "interest";

  return (
    <div className="flex items-center justify-between px-4 py-3">
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
}

export default function Savings() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [showBalance, setShowBalance] = useState(true);

  const seedBanks = useMutation(api.banks.seedDefaultBanks);
  const banks = useQuery(api.banks.list, {});

  if (banks && banks.length === 0) {
    seedBanks({});
  }

  const totalBalance = useQuery(
    api.savings.getTotalBalance,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const accounts = useQuery(
    api.savings.listAccounts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const recentTransactions = useQuery(
    api.savings.getRecentTransactions,
    currentUser ? { userId: currentUser._id, limit: 5 } : "skip"
  );

  const currency = currentUser?.currency || "PHP";

  return (
    <div>
      <Header title="Savings" />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Savings</h2>
          <Button onClick={() => navigate("/savings/add")}>
            <Plus size={18} /> Add Account
          </Button>
        </div>

        {/* Total Balance */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Balance
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <p className="text-3xl font-bold mb-4">
            {showBalance
              ? formatCurrency(totalBalance?.total || 0, currency)
              : "••••••"}
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">Savings</p>
              <p className="font-semibold">
                {showBalance
                  ? formatCurrency(totalBalance?.savingsTotal || 0, currency)
                  : "••••••"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Time Deposits</p>
              <p className="font-semibold">
                {showBalance
                  ? formatCurrency(
                      totalBalance?.timeDepositTotal || 0,
                      currency
                    )
                  : "••••••"}
              </p>
            </div>
          </div>
        </Card>

        {/* Accounts Grid */}
        {accounts && accounts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Accounts ({accounts.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {accounts.map((account: any) => (
                <AccountCard
                  key={account._id}
                  account={account}
                  currency={currency}
                  showBalance={showBalance}
                  onClick={() => navigate(`/savings/${account._id}`)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="mb-6">
            <EmptyState
              icon={<PiggyBank size={48} />}
              title="No accounts yet"
              subtitle="Add your savings accounts to track your money across different banks"
              actionLabel="Add Account"
              onAction={() => navigate("/savings/add")}
            />
          </Card>
        )}

        {/* Recent Transactions */}
        {recentTransactions && recentTransactions.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h3 className="font-semibold">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentTransactions.map((tx: any) => (
                <TransactionItem key={tx._id} tx={tx} currency={currency} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
