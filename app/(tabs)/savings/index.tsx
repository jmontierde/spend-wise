import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { AccountCard } from "@/components/savings/account-card";
import { TransactionItem } from "@/components/savings/transaction-item";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency as formatPeso } from "@/utils/format-currency";

export default function SavingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const seedBanks = useMutation(api.banks.seedDefaultBanks);
  const updateBankShortNames = useMutation(api.banks.updateBankShortNames);

  // Seed banks on first load
  const banks = useQuery(api.banks.list, {});
  if (banks && banks.length === 0) {
    seedBanks({});
  } else if (banks && banks.length > 0 && banks[0].shortName?.length <= 3) {
    // Migration: update existing banks with new short names for logo matching
    updateBankShortNames({});
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

  const formatAmount = (amount: number) => {
    if (!showBalance) return "••••••";
    return formatPeso(amount, currency);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Savings</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push("/(tabs)/savings/add")}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View
          style={[
            styles.totalCard,
            { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          ]}
        >
          <View style={styles.totalHeader}>
            <Text style={[styles.totalLabel, { color: colors.icon }]}>
              Total Balance
            </Text>
            <TouchableOpacity onPress={toggleBalance}>
              <IconSymbol
                name={showBalance ? "eye.fill" : "eye.slash.fill"}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatAmount(totalBalance?.total || 0)}
          </Text>
          <View style={styles.totalBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, { color: colors.icon }]}>
                Savings
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {formatAmount(totalBalance?.savingsTotal || 0)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, { color: colors.icon }]}>
                Time Deposits
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {formatAmount(totalBalance?.timeDepositTotal || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Cards */}
        {accounts && accounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Accounts
              </Text>
              <Text style={[styles.accountCount, { color: colors.icon }]}>
                {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountsScroll}
            >
              {accounts.slice(0, 4).map((account: Doc<"savingsAccounts">) => (
                <AccountCard
                  key={account._id}
                  account={account}
                  currency={currency}
                  compact
                  onPress={() => router.push(`/(tabs)/savings/${account._id}`)}
                />
              ))}
            </ScrollView>

            {accounts.length > 4 && (
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={[styles.seeAllText, { color: colors.tint }]}>
                  See all accounts
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.tint} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {(!accounts || accounts.length === 0) && (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <IconSymbol name="wallet.pass" size={64} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No accounts yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              Add your savings accounts to track your money across different banks
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push("/(tabs)/savings/add")}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions && recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Transactions
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/savings/transaction")}
              >
                <Text style={[styles.addText, { color: colors.tint }]}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              {recentTransactions.map((tx: Doc<"savingsTransactions">) => (
                <TransactionItem
                  key={tx._id}
                  transaction={tx}
                  currency={currency}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  totalCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
  },
  totalBreakdown: {
    flexDirection: "row",
    gap: 24,
  },
  breakdownItem: {},
  breakdownLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  accountCount: {
    fontSize: 14,
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
  },
  accountsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionsList: {
    gap: 4,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
