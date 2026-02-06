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
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface BudgetFormProps {
  userId: Id<"users">;
  budget?: Doc<"budgets">;
  onSuccess?: () => void;
}

export function BudgetForm({ userId, budget, onSuccess }: BudgetFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [amount, setAmount] = useState(budget?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>(
    budget?.categoryId || undefined
  );
  const [loading, setLoading] = useState(false);

  const categories = useQuery(api.categories.list, { userId });
  const createBudget = useMutation(api.budgets.create);
  const updateBudget = useMutation(api.budgets.update);
  const deleteBudget = useMutation(api.budgets.remove);

  const currentMonth =
    new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (budget) {
        await updateBudget({
          id: budget._id,
          amount: parseFloat(amount),
        });
      } else {
        await createBudget({
          userId,
          categoryId,
          amount: parseFloat(amount),
          month: currentMonth,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save budget:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!budget) return;

    setLoading(true);
    try {
      await deleteBudget({ id: budget._id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete budget:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.amountContainer}>
        <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
        <TextInput
          style={[styles.amountInput, { color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.icon}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          autoFocus={!budget}
        />
      </View>

      {!budget && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.icon }]}>
            Budget Type
          </Text>
          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                {
                  backgroundColor:
                    !categoryId
                      ? colors.tint
                      : colorScheme === "dark"
                        ? "#2a2a2a"
                        : "#f5f5f5",
                },
              ]}
              onPress={() => setCategoryId(undefined)}
            >
              <IconSymbol
                name="wallet.pass.fill"
                size={24}
                color={!categoryId ? "#fff" : colors.icon}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: !categoryId ? "#fff" : colors.text },
                ]}
              >
                Overall
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.orText, { color: colors.icon }]}>
            or select a category
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories?.map((category: Doc<"categories">) => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor:
                      categoryId === category._id
                        ? category.color
                        : colorScheme === "dark"
                          ? "#2a2a2a"
                          : "#f5f5f5",
                  },
                ]}
                onPress={() => setCategoryId(category._id)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        categoryId === category._id
                          ? "rgba(255,255,255,0.2)"
                          : category.color + "20",
                    },
                  ]}
                >
                  <IconSymbol
                    name={category.icon as any}
                    size={20}
                    color={
                      categoryId === category._id ? "#fff" : category.color
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color:
                        categoryId === category._id ? "#fff" : colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isValid ? colors.tint : colors.icon,
            },
          ]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {budget ? "Update Budget" : "Create Budget"}
            </Text>
          )}
        </TouchableOpacity>

        {budget && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: "#ef444420" }]}
            onPress={handleDelete}
            disabled={loading}
          >
            <IconSymbol name="trash.fill" size={20} color="#ef4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  typeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 14,
  },
  categoriesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  categoryOption: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 90,
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  buttons: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
