import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface CategoryPickerProps {
  userId?: Id<"users">;
  selectedId?: Id<"categories">;
  onSelect: (categoryId: Id<"categories">) => void;
  suggestedId?: Id<"categories">;
}

export function CategoryPicker({
  userId,
  selectedId,
  onSelect,
  suggestedId,
}: CategoryPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const categories = useQuery(api.categories.list, { userId });

  if (!categories) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category: Doc<"categories">) => {
        const isSelected = selectedId === category._id;
        const isSuggested = suggestedId === category._id && !selectedId;

        return (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.item,
              {
                backgroundColor: isSelected
                  ? category.color
                  : colorScheme === "dark"
                    ? "#2a2a2a"
                    : "#f5f5f5",
                borderColor: isSuggested ? category.color : "transparent",
                borderWidth: isSuggested ? 2 : 0,
              },
            ]}
            onPress={() => onSelect(category._id)}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.2)"
                    : category.color + "20",
                },
              ]}
            >
              <IconSymbol
                name={category.icon as any}
                size={20}
                color={isSelected ? "#fff" : category.color}
              />
            </View>
            <Text
              style={[
                styles.name,
                { color: isSelected ? "#fff" : colors.text },
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
            {isSuggested && (
              <View style={[styles.aiBadge, { backgroundColor: category.color }]}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  loading: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 90,
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  aiBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
