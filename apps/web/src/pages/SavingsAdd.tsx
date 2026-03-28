import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SavingsAdd() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [bankId, setBankId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "time_deposit">(
    "savings"
  );
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  const banks = useQuery(api.banks.list, {});
  const createAccount = useMutation(api.savings.createAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bankId || !balance) return;

    setLoading(true);
    try {
      await createAccount({
        userId: currentUser._id,
        bankId: bankId as any,
        accountName: accountName || undefined,
        balance: parseFloat(balance),
        accountType,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
      });
      navigate("/savings");
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setLoading(false);
    }
  };

  const banksByType = {
    bank: banks?.filter((b: any) => b.type === "bank") || [],
    digital_bank: banks?.filter((b: any) => b.type === "digital_bank") || [],
    e_wallet: banks?.filter((b: any) => b.type === "e_wallet") || [],
  };

  return (
    <div>
      <Header title="Add Account" />
      <div className="p-6 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bank Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Bank
              </label>
              {Object.entries(banksByType).map(
                ([type, bankList]) =>
                  (bankList as any[]).length > 0 && (
                    <div key={type} className="mb-3">
                      <p className="text-xs text-gray-400 uppercase mb-2">
                        {type === "bank"
                          ? "Banks"
                          : type === "digital_bank"
                            ? "Digital Banks"
                            : "E-Wallets"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(bankList as any[]).map((bank: any) => (
                          <button
                            key={bank._id}
                            type="button"
                            onClick={() => setBankId(bank._id)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                              bankId === bank._id
                                ? "text-white border-transparent"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            style={
                              bankId === bank._id
                                ? { backgroundColor: bank.color }
                                : undefined
                            }
                          >
                            {bank.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>

            <Input
              label="Account Name (optional)"
              placeholder="e.g., Emergency Fund"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />

            {/* Account Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("savings")}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    accountType === "savings"
                      ? "bg-[#0a7ea4] dark:bg-[#4db8db] text-white"
                      : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Savings
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("time_deposit")}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    accountType === "time_deposit"
                      ? "bg-[#0a7ea4] dark:bg-[#4db8db] text-white"
                      : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Time Deposit
                </button>
              </div>
            </div>

            <Input
              label="Initial Balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />

            <Input
              label="Interest Rate % (optional)"
              type="number"
              step="0.01"
              placeholder="e.g., 5.25"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />

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
                disabled={!bankId || !balance || loading}
              >
                {loading ? "Creating..." : "Add Account"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
