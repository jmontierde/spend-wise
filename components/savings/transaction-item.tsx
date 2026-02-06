import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getBankLogo } from "@/constants/bank-logos";
import { formatCurrency } from "@/utils/format-currency";

interface TransactionItemProps {
  transaction: Doc<"savingsTransactions">;
  currency: string;
  onPress?: () => void;
}

export function TransactionItem({
  transaction,
  currency,
  onPress,
}: TransactionItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const account = useQuery(api.savings.getAccountById, { id: transaction.accountId });
  const bank = useQuery(
    api.banks.getById,
    account ? { id: account.bankId } : "skip"
  );

  const isPositive =
    transaction.type === "deposit" || transaction.type === "interest";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
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

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.date, { color: colors.icon }]}>
          {format(new Date(transaction.date), "MMM d, yyyy h:mm a")}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          { color: isPositive ? "#22c55e" : "#ef4444" },
        ]}
      >
        {isPositive ? "+" : "-"}
        {formatCurrency(transaction.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bankBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bankLogo: {
    width: 40,
    height: 40,
  },
  bankShortName: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
