import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/utils/format-currency";
import { Doc } from "@/convex/_generated/dataModel";

type DayData = {
  total: number;
  count: number;
  expenses: Doc<"expenses">[];
};

type ExpenseCalendarProps = {
  byDay: Record<string, DayData>;
  currency: string;
  onDayPress: (date: Date, expenses: Doc<"expenses">[]) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
};

export function ExpenseCalendar({
  byDay,
  currency,
  onDayPress,
  currentMonth,
  onMonthChange,
}: ExpenseCalendarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMaxSpending = () => {
    let max = 0;
    Object.values(byDay).forEach((day) => {
      if (day.total > max) max = day.total;
    });
    return max;
  };

  const maxSpending = getMaxSpending();

  const getIntensity = (amount: number) => {
    if (maxSpending === 0) return 0;
    return Math.min(amount / maxSpending, 1);
  };

  const getDayData = (date: Date): DayData | null => {
    const key = format(date, "yyyy-MM-dd");
    return byDay[key] || null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <IconSymbol name="chevron.right" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={[styles.weekDayText, { color: colors.icon }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const dayData = getDayData(day);
          const intensity = dayData ? getIntensity(dayData.total) : 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.otherMonthDay,
              ]}
              onPress={() => {
                if (dayData && dayData.expenses.length > 0) {
                  onDayPress(day, dayData.expenses);
                }
              }}
              disabled={!dayData || dayData.expenses.length === 0}
            >
              <View
                style={[
                  styles.dayContent,
                  isToday && [styles.todayCell, { borderColor: colors.tint }],
                  dayData && {
                    backgroundColor: `rgba(239, 68, 68, ${0.15 + intensity * 0.55})`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isCurrentMonth ? colors.text : colors.icon },
                    isToday && { color: colors.tint, fontWeight: "700" },
                  ]}
                >
                  {format(day, "d")}
                </Text>
                {dayData && (
                  <Text
                    style={[
                      styles.dayAmount,
                      { color: isCurrentMonth ? "#dc2626" : colors.icon },
                    ]}
                    numberOfLines={1}
                  >
                    {formatCurrency(dayData.total, currency, true)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.legend,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        <Text style={[styles.legendText, { color: colors.icon }]}>
          Spending intensity:
        </Text>
        <View style={styles.legendScale}>
          <View style={[styles.legendBox, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]} />
          <View style={[styles.legendBox, { backgroundColor: "rgba(239, 68, 68, 0.35)" }]} />
          <View style={[styles.legendBox, { backgroundColor: "rgba(239, 68, 68, 0.55)" }]} />
          <View style={[styles.legendBox, { backgroundColor: "rgba(239, 68, 68, 0.70)" }]} />
        </View>
        <Text style={[styles.legendText, { color: colors.icon }]}>High</Text>
      </View>
    </View>
  );
}

type DayExpensesModalProps = {
  visible: boolean;
  onClose: () => void;
  date: Date | null;
  expenses: Doc<"expenses">[];
  currency: string;
  onExpensePress: (id: string) => void;
};

export function DayExpensesModal({
  visible,
  onClose,
  date,
  expenses,
  currency,
  onExpensePress,
}: DayExpensesModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          ]}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {date ? format(date, "EEEE, MMMM d") : ""}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.icon }]}>
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""} •{" "}
                {formatCurrency(totalAmount, currency)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.expensesList}>
            {expenses.map((expense) => (
              <TouchableOpacity
                key={expense._id}
                style={[
                  styles.expenseItem,
                  { backgroundColor: colorScheme === "dark" ? "#252525" : "#f9f9f9" },
                ]}
                onPress={() => {
                  onClose();
                  onExpensePress(expense._id);
                }}
              >
                <View style={styles.expenseInfo}>
                  <Text
                    style={[styles.expenseDescription, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {expense.description}
                  </Text>
                  <Text style={[styles.expenseTime, { color: colors.icon }]}>
                    {format(new Date(expense.date), "h:mm a")}
                  </Text>
                </View>
                <Text style={[styles.expenseAmount, { color: "#dc2626" }]}>
                  -{formatCurrency(expense.amount, currency)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  weekDaysRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    padding: 2,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  dayContent: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  todayCell: {
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayAmount: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
  },
  legendScale: {
    flexDirection: "row",
    gap: 4,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  expensesList: {
    padding: 16,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "500",
  },
  expenseTime: {
    fontSize: 13,
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
