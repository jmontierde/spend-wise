import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { User, Mail, DollarSign, Moon, Sun, LogOut, Check } from "lucide-react";
import { api } from "@convex/_generated/api";
import { CURRENCIES } from "@spend-wise/shared";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { SkeletonSettingsRow } from "@/components/ui/Skeleton";

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const { user, currentUser } = useCurrentUser();
  const { signOut } = useClerk();

  const updateUser = useMutation(api.auth.updateUser);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name);
  }, [currentUser?.name]);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    try {
      await updateUser({ clerkId: user.id, name: name.trim() });
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    if (!user) return;
    try {
      await updateUser({ clerkId: user.id, currency });
      setShowCurrencyPicker(false);
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  };

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    await signOut();
    navigate("/sign-in");
  };

  const currentCurrency = CURRENCIES.find(
    (c) => c.code === (currentUser?.currency || "PHP")
  );

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        {/* Profile Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 ml-1">
            Profile
          </h3>
          {!currentUser ? (
            <Card className="divide-y divide-gray-100 dark:divide-gray-800">
              <SkeletonSettingsRow />
              <SkeletonSettingsRow />
            </Card>
          ) : (
            <Card className="divide-y divide-gray-100 dark:divide-gray-800">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => {
                  setName(currentUser?.name || "");
                  setEditingName(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0a7ea4]/10 dark:bg-[#4db8db]/10 flex items-center justify-center">
                    <User size={18} className="text-[#0a7ea4] dark:text-[#4db8db]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-xs text-gray-400">
                      {currentUser?.name || "Not set"}
                    </p>
                  </div>
                </div>
                <span className="text-gray-300 dark:text-gray-600">&rsaquo;</span>
              </button>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-gray-400">
                      {currentUser?.email ||
                        user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3 ml-1">
            Preferences
          </h3>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setShowCurrencyPicker(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="text-lg">{currentCurrency?.symbol}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Currency</p>
                  <p className="text-xs text-gray-400">
                    {currentCurrency?.name}
                  </p>
                </div>
              </div>
              <span className="text-gray-300 dark:text-gray-600">&rsaquo;</span>
            </button>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  {theme === "dark" ? (
                    <Moon size={18} className="text-purple-500" />
                  ) : (
                    <Sun size={18} className="text-purple-500" />
                  )}
                </div>
                <p className="text-sm font-medium">Dark Mode</p>
              </div>
              <button
                onClick={() => dispatch(toggleTheme())}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  theme === "dark"
                    ? "bg-[#0a7ea4] dark:bg-[#4db8db]"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    theme === "dark" ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* Sign Out */}
        <Button variant="danger" className="w-full" onClick={handleSignOut}>
          <LogOut size={16} /> Sign Out
        </Button>

        <p className="text-center text-xs text-gray-400 mt-6">
          SpendWise v1.0.0
        </p>

        {/* Edit Name Modal */}
        <Modal
          open={editingName}
          onClose={() => setEditingName(false)}
          title="Edit Name"
        >
          <div className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditingName(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveName}>
                Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* Currency Picker Modal */}
        <Modal
          open={showCurrencyPicker}
          onClose={() => setShowCurrencyPicker(false)}
          title="Select Currency"
        >
          <div className="space-y-2">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  currentUser?.currency === currency.code
                    ? "bg-[#0a7ea4]/10 dark:bg-[#4db8db]/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleCurrencyChange(currency.code)}
              >
                <span className="text-xl w-8">{currency.symbol}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{currency.name}</p>
                  <p className="text-xs text-gray-400">{currency.code}</p>
                </div>
                {currentUser?.currency === currency.code && (
                  <Check size={18} className="text-[#0a7ea4] dark:text-[#4db8db]" />
                )}
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
