import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getBankLogo } from "@/constants/bank-logos";
import { formatCurrency } from "@/utils/format-currency";

interface AccountPickerProps {
  userId: Id<"users">;
  selectedId?: Id<"savingsAccounts">;
  onSelect: (accountId: Id<"savingsAccounts"> | undefined) => void;
  currency?: string;
}

export function AccountPicker({
  userId,
  selectedId,
  onSelect,
  currency = "PHP",
}: AccountPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const accounts = useQuery(api.savings.listAccounts, { userId });

  if (!accounts || accounts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* No account option */}
      <TouchableOpacity
        style={[
          styles.accountItem,
          {
            backgroundColor:
              selectedId === undefined
                ? colors.tint
                : colorScheme === "dark"
                  ? "#2a2a2a"
                  : "#f5f5f5",
            borderColor: selectedId === undefined ? colors.tint : "transparent",
          },
        ]}
        onPress={() => onSelect(undefined)}
      >
        <Text
          style={[
            styles.accountName,
            { color: selectedId === undefined ? "#fff" : colors.text },
          ]}
        >
          Cash / Other
        </Text>
      </TouchableOpacity>

      {/* Savings accounts */}
      {accounts.map((account) => (
        <AccountOption
          key={account._id}
          account={account}
          isSelected={selectedId === account._id}
          onSelect={() => onSelect(account._id)}
          currency={currency}
        />
      ))}
    </View>
  );
}

function AccountOption({
  account,
  isSelected,
  onSelect,
  currency,
}: {
  account: Doc<"savingsAccounts">;
  isSelected: boolean;
  onSelect: () => void;
  currency: string;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const bank = useQuery(api.banks.getById, { id: account.bankId });
  const bankLogo = bank?.shortName ? getBankLogo(bank.shortName) : null;

  return (
    <TouchableOpacity
      style={[
        styles.accountItem,
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
      <View style={styles.accountContent}>
        {bankLogo ? (
          <Image source={bankLogo} style={styles.bankLogo} resizeMode="contain" />
        ) : (
          <View
            style={[
              styles.bankBadge,
              { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : bank?.color || "#6b7280" },
            ]}
          >
            <Text style={styles.bankShortName}>{bank?.shortName || "..."}</Text>
          </View>
        )}
        <View style={styles.accountInfo}>
          <Text
            style={[
              styles.accountName,
              { color: isSelected ? "#fff" : colors.text },
            ]}
            numberOfLines={1}
          >
            {account.accountName || bank?.name || "Account"}
          </Text>
          <Text
            style={[
              styles.accountBalance,
              { color: isSelected ? "rgba(255,255,255,0.8)" : colors.icon },
            ]}
          >
            {formatCurrency(account.balance, currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  accountItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bankLogo: {
    width: 28,
    height: 28,
  },
  bankBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  bankShortName: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 13,
    fontWeight: "600",
  },
  accountBalance: {
    fontSize: 11,
    marginTop: 2,
  },
});
