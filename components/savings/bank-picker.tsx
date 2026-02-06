import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getBankLogo } from "@/constants/bank-logos";

interface BankPickerProps {
  selectedId?: Id<"banks">;
  onSelect: (bankId: Id<"banks">) => void;
  bankType?: "bank" | "digital_bank" | "e_wallet";
}

export function BankPicker({ selectedId, onSelect, bankType }: BankPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const banks = useQuery(api.banks.list, { type: bankType });

  if (!banks) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }

  // Group banks by type
  const digitalBanks = banks.filter((b) => b.type === "digital_bank");
  const traditionalBanks = banks.filter((b) => b.type === "bank");
  const eWallets = banks.filter((b) => b.type === "e_wallet");

  const renderBank = (bank: Doc<"banks">) => {
    const isSelected = selectedId === bank._id;

    return (
      <TouchableOpacity
        key={bank._id}
        style={[
          styles.bankItem,
          {
            backgroundColor: isSelected
              ? bank.color
              : colorScheme === "dark"
                ? "#2a2a2a"
                : "#f5f5f5",
            borderColor: isSelected ? bank.color : "transparent",
          },
        ]}
        onPress={() => onSelect(bank._id)}
      >
        <View
          style={[
            styles.bankBadge,
            // Only show background color when no logo (fallback to text)
            !getBankLogo(bank.shortName) && {
              backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : bank.color,
            },
          ]}
        >
          {getBankLogo(bank.shortName) ? (
            <Image
              source={getBankLogo(bank.shortName)!}
              style={styles.bankLogo}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={[
                styles.bankShortName,
                { color: "#fff" },
              ]}
            >
              {bank.shortName}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.bankName,
            { color: isSelected ? "#fff" : colors.text },
          ]}
          numberOfLines={2}
        >
          {bank.name}
        </Text>
        {bank.interestRate && (
          <Text
            style={[
              styles.interestRate,
              { color: isSelected ? "rgba(255,255,255,0.8)" : colors.icon },
            ]}
          >
            {bank.interestRate}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, items: Doc<"banks">[]) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>{title}</Text>
        <View style={styles.bankGrid}>{items.map(renderBank)}</View>
      </View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {!bankType && (
        <>
          {renderSection("Digital Banks", digitalBanks)}
          {renderSection("Traditional Banks", traditionalBanks)}
          {renderSection("E-Wallets", eWallets)}
        </>
      )}
      {bankType && (
        <View style={styles.bankGrid}>{banks.map(renderBank)}</View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loading: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  bankItem: {
    width: "31%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  bankBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  bankLogo: {
    width: 44,
    height: 44,
  },
  bankShortName: {
    fontSize: 11,
    fontWeight: "bold",
  },
  bankName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  interestRate: {
    fontSize: 10,
    textAlign: "center",
  },
});
