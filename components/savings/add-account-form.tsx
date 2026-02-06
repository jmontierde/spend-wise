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
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BankPicker } from "./bank-picker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface AddAccountFormProps {
  userId: Id<"users">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddAccountForm({ userId, onSuccess, onCancel }: AddAccountFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [step, setStep] = useState<"type" | "bank" | "details">("type");
  const [accountType, setAccountType] = useState<"savings" | "time_deposit">("savings");
  const [bankId, setBankId] = useState<Id<"banks"> | undefined>();
  const [balance, setBalance] = useState("");
  const [accountName, setAccountName] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  const createAccount = useMutation(api.savings.createAccount);

  const handleTypeSelect = (type: "savings" | "time_deposit") => {
    setAccountType(type);
    setStep("bank");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBankSelect = (id: Id<"banks">) => {
    setBankId(id);
    setStep("details");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (!bankId || !balance) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createAccount({
        userId,
        bankId,
        accountName: accountName || undefined,
        balance: parseFloat(balance),
        accountType,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create account:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("bank");
    else if (step === "bank") setStep("type");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isValid = bankId && balance && parseFloat(balance) >= 0;

  // Step 1: Select account type
  if (step === "type") {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          What type of account?
        </Text>

        <TouchableOpacity
          style={[
            styles.typeCard,
            {
              backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
              borderColor: colors.tint,
            },
          ]}
          onPress={() => handleTypeSelect("savings")}
        >
          <Text style={[styles.typeTitle, { color: colors.text }]}>
            Savings Account
          </Text>
          <Text style={[styles.typeDesc, { color: colors.icon }]}>
            Regular savings account with flexible deposits and withdrawals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeCard,
            {
              backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
              borderColor: colors.tint,
            },
          ]}
          onPress={() => handleTypeSelect("time_deposit")}
        >
          <Text style={[styles.typeTitle, { color: colors.text }]}>
            Time Deposit
          </Text>
          <Text style={[styles.typeDesc, { color: colors.icon }]}>
            Fixed-term deposit with higher interest rates
          </Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={[styles.cancelText, { color: colors.icon }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Step 2: Select bank
  if (step === "bank") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={[styles.backText, { color: colors.tint }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Select Bank</Text>
          <View style={{ width: 40 }} />
        </View>

        <BankPicker selectedId={bankId} onSelect={handleBankSelect} />
      </View>
    );
  }

  // Step 3: Enter details
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={[styles.backText, { color: colors.tint }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Account Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>
            Current Balance *
          </Text>
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
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>
            Account Name (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="e.g., Emergency Fund, Travel Savings"
            placeholderTextColor={colors.icon}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>
            Interest Rate % (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="e.g., 5.5"
            placeholderTextColor={colors.icon}
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="decimal-pad"
          />
        </View>

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
            <Text style={styles.submitText}>Add Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  typeCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  typeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 16,
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
