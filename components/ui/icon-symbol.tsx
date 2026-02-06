// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import {
  OpaqueColorValue,
  type StyleProp,
  type TextStyle,
} from "react-native";

type IconMapping = Record<
  string,
  ComponentProps<typeof MaterialIcons>["name"]
>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Navigation
  "house.fill": "home",
  "list.bullet": "list",
  "chart.bar.fill": "bar-chart",
  "wallet.pass.fill": "account-balance-wallet",
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",

  // Actions
  plus: "add",
  pencil: "edit",
  "trash.fill": "delete",
  checkmark: "check",

  // Categories
  "fork.knife": "restaurant",
  "car.fill": "directions-car",
  "bag.fill": "shopping-bag",
  "tv.fill": "tv",
  "bolt.fill": "bolt",
  "heart.fill": "favorite",
  airplane: "flight",
  "book.fill": "book",
  sparkles: "auto-awesome",
  "cart.fill": "shopping-cart",
  repeat: "repeat",
  "ellipsis.circle.fill": "more-horiz",

  // Charts & Insights
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.bar.doc.horizontal": "insert-chart",
  "exclamationmark.triangle.fill": "warning",
  "lightbulb.fill": "lightbulb",
  "chart.bar": "bar-chart",

  // Settings
  "person.fill": "person",
  "envelope.fill": "email",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "rectangle.portrait.and.arrow.right": "logout",

  // Misc
  receipt: "receipt",
  "wallet.pass": "account-balance-wallet",

  // Savings
  "banknote.fill": "savings",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "arrow.up.circle.fill": "arrow-upward",
  "arrow.down.circle.fill": "arrow-downward",
  "building.columns.fill": "account-balance",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: SymbolViewProps["name"];
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name as string] || "help-outline";
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={mappedName}
      style={style}
    />
  );
}
