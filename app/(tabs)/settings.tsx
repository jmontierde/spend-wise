import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from "react-native";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

const CURRENCIES = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useTheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const updateUser = useMutation(api.auth.updateUser);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const isDarkMode = colorScheme === "dark";

  const handleToggleDarkMode = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setColorScheme(value ? "dark" : "light");
  };

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;

    try {
      await updateUser({
        clerkId: user.id,
        name: name.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    if (!user) return;

    try {
      await updateUser({
        clerkId: user.id,
        currency,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCurrencyPicker(false);
    } catch (error) {
      console.error("Failed to update currency:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const currentCurrency = CURRENCIES.find(
    (c) => c.code === (currentUser?.currency || "PHP")
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>
            Profile
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setName(currentUser?.name || "");
                setEditingName(true);
              }}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBg, { backgroundColor: colors.tint + "20" }]}
                >
                  <IconSymbol name="person.fill" size={20} color={colors.tint} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    Name
                  </Text>
                  <Text style={[styles.rowValue, { color: colors.icon }]}>
                    {currentUser?.name || "Not set"}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.icon + "20" }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBg, { backgroundColor: "#3b82f620" }]}
                >
                  <IconSymbol name="envelope.fill" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    Email
                  </Text>
                  <Text style={[styles.rowValue, { color: colors.icon }]}>
                    {currentUser?.email || user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>
            Preferences
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBg, { backgroundColor: "#22c55e20" }]}
                >
                  <Text style={{ fontSize: 18 }}>{currentCurrency?.symbol}</Text>
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    Currency
                  </Text>
                  <Text style={[styles.rowValue, { color: colors.icon }]}>
                    {currentCurrency?.name}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.icon + "20" }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconBg, { backgroundColor: "#8b5cf620" }]}
                >
                  <IconSymbol
                    name={isDarkMode ? "moon.fill" : "sun.max.fill"}
                    size={20}
                    color="#8b5cf6"
                  />
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: "#e5e5e5", true: colors.tint }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.signOutButton,
              { backgroundColor: "#ef444420" },
            ]}
            onPress={handleSignOut}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.icon }]}>
          SpendWise v1.0.0
        </Text>
      </ScrollView>

      {editingName && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.icon}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e5e5e5" }]}
                onPress={() => setEditingName(false)}
              >
                <Text style={{ color: "#333" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveName}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showCurrencyPicker && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Currency
            </Text>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  currentUser?.currency === currency.code && {
                    backgroundColor: colors.tint + "20",
                  },
                ]}
                onPress={() => handleCurrencyChange(currency.code)}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>
                  {currency.symbol}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyName, { color: colors.text }]}>
                    {currency.name}
                  </Text>
                  <Text style={[styles.currencyCode, { color: colors.icon }]}>
                    {currency.code}
                  </Text>
                </View>
                {currentUser?.currency === currency.code && (
                  <IconSymbol name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#e5e5e5", marginTop: 16 }]}
              onPress={() => setShowCurrencyPicker(false)}
            >
              <Text style={{ color: "#333" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 32,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "500",
  },
  currencyCode: {
    fontSize: 13,
  },
});
