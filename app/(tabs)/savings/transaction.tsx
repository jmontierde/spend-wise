import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();

  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<Id<"savingsAccounts"> | undefined>();
  const [loading, setLoading] = useState(false);

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const accounts = useQuery(
    api.savings.listAccounts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const addTransaction = useMutation(api.savings.addTransaction);

  const handleSubmit = async () => {
    if (!currentUser || !accountId || !amount || !description) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addTransaction({
        userId: currentUser._id,
        accountId,
        type,
        amount: parseFloat(amount),
        description,
        date: Date.now(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = accountId && amount && parseFloat(amount) > 0 && description;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Transaction Type */}
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "deposit" && { backgroundColor: "#22c55e" },
            type !== "deposit" && {
              backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
            },
          ]}
          onPress={() => setType("deposit")}
        >
          <Text
            style={[
              styles.typeText,
              { color: type === "deposit" ? "#fff" : colors.text },
            ]}
          >
            Deposit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "withdrawal" && { backgroundColor: "#ef4444" },
            type !== "withdrawal" && {
              backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
            },
          ]}
          onPress={() => setType("withdrawal")}
        >
          <Text
            style={[
              styles.typeText,
              { color: type === "withdrawal" ? "#fff" : colors.text },
            ]}
          >
            Withdrawal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currencySymbol, { color: colors.text }]}>₱</Text>
          <TextInput
            style={[
              styles.amountInput,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.icon}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
              color: colors.text,
            },
          ]}
          placeholder="e.g., Salary, Transfer from BPI"
          placeholderTextColor={colors.icon}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Account Selection */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.icon }]}>Select Account</Text>
        <View style={styles.accountsGrid}>
          {accounts?.map((account: Doc<"savingsAccounts">) => (
            <AccountOption
              key={account._id}
              account={account}
              isSelected={accountId === account._id}
              onSelect={() => setAccountId(account._id)}
            />
          ))}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: isValid ? colors.tint : colors.icon },
        ]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Add Transaction</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function AccountOption({
  account,
  isSelected,
  onSelect,
}: {
  account: Doc<"savingsAccounts">;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const bank = useQuery(api.banks.getById, { id: account.bankId });

  return (
    <TouchableOpacity
      style={[
        styles.accountOption,
        {
          backgroundColor: isSelected
            ? bank?.color || colors.tint
            : colorScheme === "dark"
              ? "#2a2a2a"
              : "#f5f5f5",
          borderColor: isSelected ? bank?.color || colors.tint : "transparent",
        },
      ]}
      onPress={onSelect}
    >
      <Text
        style={[
          styles.accountBank,
          { color: isSelected ? "#fff" : colors.text },
        ]}
      >
        {bank?.shortName || "..."}
      </Text>
      {account.accountName && (
        <Text
          style={[
            styles.accountName,
            { color: isSelected ? "rgba(255,255,255,0.8)" : colors.icon },
          ]}
          numberOfLines={1}
        >
          {account.accountName}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "500",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "600",
  },
  accountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  accountOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
  },
  accountBank: {
    fontSize: 14,
    fontWeight: "600",
  },
  accountName: {
    fontSize: 12,
    marginTop: 2,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
