// Bank logo mappings - add your logo images to assets/images/banks/
// File naming convention: bank-name.png (lowercase, hyphenated)

import { ImageSourcePropType } from "react-native";

// Map of bank short names to their logo images
// Add your bank logo images to assets/images/banks/ folder
export const BANK_LOGOS: Record<string, ImageSourcePropType> = {
  // Digital Banks
  Maya: require("@/assets/images/banks/maya.png"),
  Tonik: require("@/assets/images/banks/tonik.png"),
  GoTyme: require("@/assets/images/banks/gotyme.png"),
  UDigital: require("@/assets/images/banks/udigital.png"),
  CIMB: require("@/assets/images/banks/cimb.png"),
  ING: require("@/assets/images/banks/ing.png"),
  SeaBank: require("@/assets/images/banks/seabank.png"),
  OwnBank: require("@/assets/images/banks/ownbank.png"),
  NetBank: require("@/assets/images/banks/netbank.png"),
  UNO: require("@/assets/images/banks/uno.png"),

  // Traditional Banks
  BPI: require("@/assets/images/banks/bpi.png"),
  BDO: require("@/assets/images/banks/bdo.png"),
  Metrobank: require("@/assets/images/banks/metrobank.png"),
  SecBank: require("@/assets/images/banks/secbank.png"),
  Landbank: require("@/assets/images/banks/landbank.png"),
  PNB: require("@/assets/images/banks/pnb.png"),
  RCBC: require("@/assets/images/banks/rcbc.png"),
  Chinabank: require("@/assets/images/banks/chinabank.png"),
  EastWest: require("@/assets/images/banks/eastwest.png"),
  UnionBank: require("@/assets/images/banks/unionbank.png"),

  // E-Wallets
  GCash: require("@/assets/images/banks/gcash.png"),
  PayMaya: require("@/assets/images/banks/paymaya.png"),
  GrabPay: require("@/assets/images/banks/grabpay.png"),
  ShopeePay: require("@/assets/images/banks/shopeepay.png"),
};

// Helper to get bank logo by short name
export function getBankLogo(shortName: string): ImageSourcePropType | null {
  return BANK_LOGOS[shortName] || null;
}
