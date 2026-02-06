import { useColorScheme as useRNColorScheme, ColorSchemeName } from "react-native";
import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const COLOR_SCHEME_KEY = "user-color-scheme";

let globalColorScheme: ColorSchemeName = null;
let globalSetColorScheme: ((scheme: ColorSchemeName) => void) | null = null;

export function useColorScheme(): ColorSchemeName {
  const systemColorScheme = useRNColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<ColorSchemeName>(
    globalColorScheme
  );

  useEffect(() => {
    // Load saved preference
    SecureStore.getItemAsync(COLOR_SCHEME_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") {
        setUserColorScheme(saved);
        globalColorScheme = saved;
      }
    });
  }, []);

  useEffect(() => {
    globalSetColorScheme = (scheme: ColorSchemeName) => {
      setUserColorScheme(scheme);
      globalColorScheme = scheme;
      if (scheme) {
        SecureStore.setItemAsync(COLOR_SCHEME_KEY, scheme);
      } else {
        SecureStore.deleteItemAsync(COLOR_SCHEME_KEY);
      }
    };
  }, []);

  return userColorScheme ?? systemColorScheme;
}

export function setColorScheme(scheme: ColorSchemeName): void {
  if (globalSetColorScheme) {
    globalSetColorScheme(scheme);
  }
}
