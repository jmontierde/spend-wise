import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMutation, useAction } from "convex/react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { CategoryPicker } from "./category-picker";
import { AccountPicker } from "./account-picker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

interface ExpenseFormProps {
  userId: Id<"users">;
  expense?: Doc<"expenses">;
  currency?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({
  userId,
  expense,
  currency = "PHP",
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [description, setDescription] = useState(expense?.description || "");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>(
    expense?.categoryId
  );
  const [date, setDate] = useState(
    expense ? new Date(expense.date) : new Date()
  );
  const [notes, setNotes] = useState(expense?.notes || "");
  const [savingsAccountId, setSavingsAccountId] = useState<
    Id<"savingsAccounts"> | undefined
  >(expense?.savingsAccountId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiCategorizing, setAiCategorizing] = useState(false);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<
    Id<"categories"> | undefined
  >();

  const createExpense = useMutation(api.expenses.create);
  const updateExpense = useMutation(api.expenses.update);
  const categorizeExpense = useAction(api.ai.categorizeExpense);

  const handleDescriptionBlur = useCallback(async () => {
    if (!description.trim() || categoryId) return;

    setAiCategorizing(true);
    try {
      const result = await categorizeExpense({
        description,
        amount: parseFloat(amount) || 0,
      });
      if (result?.categoryId) {
        setSuggestedCategoryId(result.categoryId as Id<"categories">);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("AI categorization failed:", error);
    } finally {
      setAiCategorizing(false);
    }
  }, [description, amount, categoryId, categorizeExpense]);

  const handleCategorySelect = (id: Id<"categories">) => {
    setCategoryId(id);
    setSuggestedCategoryId(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (!amount || !description || !categoryId) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (expense) {
        await updateExpense({
          id: expense._id,
          amount: parseFloat(amount),
          description,
          categoryId,
          date: date.getTime(),
          notes: notes || undefined,
        });
      } else {
        await createExpense({
          userId,
          amount: parseFloat(amount),
          description,
          categoryId,
          date: date.getTime(),
          notes: notes || undefined,
          savingsAccountId: savingsAccountId || undefined,
          aiCategorized: suggestedCategoryId === categoryId,
          aiConfidence: suggestedCategoryId === categoryId ? 0.8 : undefined,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save expense:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = amount && parseFloat(amount) > 0 && description && categoryId;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: colors.text }]}>{currencySymbol}</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.icon}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus={!expense}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>Description</Text>
          <View style={styles.descriptionRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  color: colors.text,
                  flex: 1,
                },
              ]}
              placeholder="What did you spend on?"
              placeholderTextColor={colors.icon}
              value={description}
              onChangeText={setDescription}
              onBlur={handleDescriptionBlur}
            />
            {aiCategorizing && (
              <ActivityIndicator
                size="small"
                color={colors.tint}
                style={styles.aiIndicator}
              />
            )}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>Category</Text>
          <CategoryPicker
            userId={userId}
            selectedId={categoryId}
            onSelect={handleCategorySelect}
            suggestedId={suggestedCategoryId}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>Pay From</Text>
          <AccountPicker
            userId={userId}
            selectedId={savingsAccountId}
            onSelect={setSavingsAccountId}
            currency={currency}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>Date</Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.icon}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttons}>
          {onCancel && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5" },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              {
                backgroundColor: isValid ? colors.tint : colors.icon,
                flex: onCancel ? 1 : undefined,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {expense ? "Update" : "Add Expense"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: "300",
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "600",
    minWidth: 150,
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 16,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    fontSize: 16,
    justifyContent: "center",
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiIndicator: {
    marginRight: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
