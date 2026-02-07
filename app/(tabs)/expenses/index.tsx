import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  DayExpensesModal,
  ExpenseCalendar,
} from "@/components/expense/expense-calendar";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ViewMode = "list" | "calendar";

export default function ExpensesListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Doc<"expenses">[]>(
    [],
  );
  const [showDayModal, setShowDayModal] = useState(false);

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip",
  );

  const expensesData = useQuery(
    api.expenses.list,
    currentUser ? { userId: currentUser._id, limit: 50 } : "skip",
  );

  // Build calendar data from the list data for now
  const calendarData = useMemo(() => {
    if (!expensesData?.items) return { byDay: {}, total: 0 };

    const byDay: Record<
      string,
      { total: number; count: number; expenses: typeof expensesData.items }
    > = {};
    let total = 0;

    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    ).getTime();
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();

    for (const expense of expensesData.items) {
      if (expense.date >= monthStart && expense.date <= monthEnd) {
        const date = new Date(expense.date);
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!byDay[dayKey]) {
          byDay[dayKey] = { total: 0, count: 0, expenses: [] };
        }
        byDay[dayKey].total += expense.amount;
        byDay[dayKey].count += 1;
        byDay[dayKey].expenses.push(expense);
        total += expense.amount;
      }
    }

    return { byDay, total };
  }, [expensesData?.items, currentMonth]);

  const handleDayPress = (date: Date, expenses: Doc<"expenses">[]) => {
    setSelectedDate(date);
    setSelectedExpenses(expenses);
    setShowDayModal(true);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="receipt" size={64} color={colors.icon} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No expenses yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Start tracking your spending by adding your first expense
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push("/(tabs)/expenses/add")}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCalendarEmpty = () => (
    <View style={styles.calendarEmptyContainer}>
      <IconSymbol name="calendar" size={48} color={colors.icon} />
      <Text style={[styles.calendarEmptyText, { color: colors.icon }]}>
        No expenses this month
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.viewToggle,
          { backgroundColor: colorScheme === "dark" ? "#252525" : "#f0f0f0" },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "list" && [
              styles.toggleButtonActive,
              { backgroundColor: colors.tint },
            ],
          ]}
          onPress={() => setViewMode("list")}
        >
          <IconSymbol
            name="list.bullet"
            size={18}
            color={viewMode === "list" ? "#fff" : colors.icon}
          />
          <Text
            style={[
              styles.toggleText,
              { color: viewMode === "list" ? "#fff" : colors.icon },
            ]}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "calendar" && [
              styles.toggleButtonActive,
              { backgroundColor: colors.tint },
            ],
          ]}
          onPress={() => setViewMode("calendar")}
        >
          <IconSymbol
            name="calendar"
            size={18}
            color={viewMode === "calendar" ? "#fff" : colors.icon}
          />
          <Text
            style={[
              styles.toggleText,
              { color: viewMode === "calendar" ? "#fff" : colors.icon },
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={expensesData?.items || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              currency={currentUser?.currency || "PHP"}
              onPress={() => router.push(`/(tabs)/expenses/${item._id}`)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            (!expensesData?.items || expensesData.items.length === 0) &&
              styles.emptyList,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      ) : (
        <View style={styles.calendarContainer}>
          {calendarData && Object.keys(calendarData.byDay).length > 0 ? (
            <ExpenseCalendar
              byDay={calendarData.byDay}
              currency={currentUser?.currency || "PHP"}
              onDayPress={handleDayPress}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          ) : (
            <>
              <ExpenseCalendar
                byDay={{}}
                currency={currentUser?.currency || "PHP"}
                onDayPress={handleDayPress}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
              {renderCalendarEmpty()}
            </>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push("/(tabs)/expenses/add")}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <DayExpensesModal
        visible={showDayModal}
        onClose={() => setShowDayModal(false)}
        date={selectedDate}
        expenses={selectedExpenses}
        currency={currentUser?.currency || "PHP"}
        onExpensePress={(id) => router.push(`/(tabs)/expenses/${id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarContainer: {
    flex: 1,
  },
  calendarEmptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  calendarEmptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
