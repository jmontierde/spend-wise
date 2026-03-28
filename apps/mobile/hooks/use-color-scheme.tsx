import {
  useColorScheme as useRNColorScheme,
  ColorSchemeName,
} from "react-native";
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

const COLOR_SCHEME_KEY = "user-color-scheme";

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const systemColorScheme = useRNColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<ColorSchemeName>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(COLOR_SCHEME_KEY)
      .then((saved) => {
        if (saved === "dark" || saved === "light") {
          setUserColorScheme(saved);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSetColorScheme = useCallback((scheme: ColorSchemeName) => {
    setUserColorScheme(scheme);
    if (scheme) {
      SecureStore.setItemAsync(COLOR_SCHEME_KEY, scheme);
    } else {
      SecureStore.deleteItemAsync(COLOR_SCHEME_KEY);
    }
  }, []);

  const colorScheme = userColorScheme ?? systemColorScheme;

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        setColorScheme: handleSetColorScheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeName {
  const context = useContext(ThemeContext);
  const systemColorScheme = useRNColorScheme();

  if (context === undefined) {
    // Fallback for components outside ThemeProvider (shouldn't happen in normal usage)
    return systemColorScheme;
  }

  return context.colorScheme;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  const systemColorScheme = useRNColorScheme();

  if (context === undefined) {
    // Fallback for components outside ThemeProvider
    return {
      colorScheme: systemColorScheme,
      setColorScheme: () => {},
      isLoading: false,
    };
  }

  return context;
}
