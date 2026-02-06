import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getBankLogo } from "@/constants/bank-logos";
import { formatCurrency } from "@/utils/format-currency";

interface AccountCardProps {
  account: Doc<"savingsAccounts">;
  currency: string;
  onPress?: () => void;
  compact?: boolean;
}

export function AccountCard({
  account,
  currency,
  onPress,
  compact = false,
}: AccountCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const bank = useQuery(api.banks.getById, { id: account.bankId });

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: bank?.color || "#6b7280" }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.compactLabel}>Balance</Text>
        <Text style={styles.compactBalance}>{formatCurrency(account.balance, currency)}</Text>
        <Text style={styles.compactBank}>{bank?.shortName || "..."}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.bankBadge,
            // Only show background color when no logo (fallback to text)
            !getBankLogo(bank?.shortName || "") && { backgroundColor: bank?.color || "#6b7280" },
          ]}
        >
          {bank?.shortName && getBankLogo(bank.shortName) ? (
            <Image
              source={getBankLogo(bank.shortName)!}
              style={styles.bankLogo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.bankShortName}>{bank?.shortName || "..."}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.bankName, { color: colors.text }]}>
            {bank?.name || "Loading..."}
          </Text>
          {account.accountName && (
            <Text style={[styles.accountName, { color: colors.icon }]}>
              {account.accountName}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={[styles.balanceLabel, { color: colors.icon }]}>Balance</Text>
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatCurrency(account.balance, currency)}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.icon }]}>Type</Text>
          <Text style={[styles.footerValue, { color: colors.text }]}>
            {account.accountType === "savings" ? "Savings" : "Time Deposit"}
          </Text>
        </View>
        {account.interestRate && (
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: colors.icon }]}>Rate</Text>
            <Text style={[styles.footerValue, { color: colors.text }]}>
              {account.interestRate}% p.a.
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bankBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bankLogo: {
    width: 44,
    height: 44,
  },
  bankShortName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerRight: {
    marginLeft: 12,
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
  },
  accountName: {
    fontSize: 13,
    marginTop: 2,
  },
  balanceSection: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  balance: {
    fontSize: 28,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    gap: 24,
  },
  footerItem: {},
  footerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Compact styles
  compactCard: {
    width: 160,
    height: 100,
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  compactLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  compactBalance: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  compactBank: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
});
