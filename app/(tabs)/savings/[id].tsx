import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { TransactionItem } from "@/components/savings/transaction-item";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/utils/format-currency";

export default function AccountDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();

  const [editing, setEditing] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const account = useQuery(
    api.savings.getAccountById,
    id ? { id: id as Id<"savingsAccounts"> } : "skip"
  );

  const bank = useQuery(
    api.banks.getById,
    account ? { id: account.bankId } : "skip"
  );

  const transactions = useQuery(
    api.savings.listTransactions,
    currentUser && id
      ? { userId: currentUser._id, accountId: id as Id<"savingsAccounts">, limit: 20 }
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
      setNewBalance("");
    } catch (error) {
      console.error("Failed to update balance:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete this account? All transactions will also be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount({ id: id as Id<"savingsAccounts"> });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error("Failed to delete account:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  if (!account || !bank) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Account Header */}
      <View style={[styles.header, { backgroundColor: bank.color }]}>
        <View style={styles.headerContent}>
          <Text style={styles.bankName}>{bank.name}</Text>
          {account.accountName && (
            <Text style={styles.accountName}>{account.accountName}</Text>
          )}
          <Text style={styles.balance}>{formatCurrency(account.balance, currency)}</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.metaText}>
              {account.accountType === "savings" ? "Savings Account" : "Time Deposit"}
            </Text>
            {account.interestRate && (
              <Text style={styles.metaText}>{account.interestRate}% p.a.</Text>
            )}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          ]}
          onPress={() => {
            setNewBalance(account.balance.toString());
            setEditing(true);
          }}
        >
          <IconSymbol name="pencil" size={20} color={colors.tint} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Update Balance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          ]}
          onPress={() => router.push("/(tabs)/savings/transaction")}
        >
          <IconSymbol name="plus" size={20} color={colors.tint} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Add Transaction
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Transactions
        </Text>

        {transactions && transactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {transactions.map((tx: Doc<"savingsTransactions">) => (
              <TransactionItem key={tx._id} transaction={tx} currency={currency} />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No transactions yet
            </Text>
          </View>
        )}
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: "#ef444420" }]}
        onPress={handleDelete}
      >
        <IconSymbol name="trash.fill" size={20} color="#ef4444" />
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Edit Balance Modal */}
      {editing && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Update Balance
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                ₱
              </Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                    color: colors.text,
                  },
                ]}
                value={newBalance}
                onChangeText={setNewBalance}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e5e5e5" }]}
                onPress={() => {
                  setEditing(false);
                  setNewBalance("");
                }}
              >
                <Text style={{ color: "#333" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleUpdateBalance}
              >
                <Text style={{ color: "#fff" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerContent: {
    alignItems: "center",
  },
  bankName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 12,
  },
  balance: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  transactionsList: {
    gap: 4,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
