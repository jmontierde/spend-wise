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
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLOR_SCHEME_KEY);
      if (saved === "dark" || saved === "light") {
        setUserColorScheme(saved);
      }
    } catch {
      // localStorage not available
    }
    setIsLoading(false);
  }, []);

  const handleSetColorScheme = useCallback((scheme: ColorSchemeName) => {
    setUserColorScheme(scheme);
    try {
      if (scheme) {
        localStorage.setItem(COLOR_SCHEME_KEY, scheme);
      } else {
        localStorage.removeItem(COLOR_SCHEME_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const colorScheme = hasHydrated
    ? (userColorScheme ?? systemColorScheme)
    : "light";

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
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (context === undefined) {
    // Fallback for components outside ThemeProvider
    return hasHydrated ? systemColorScheme : "light";
  }

  return context.colorScheme;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  const systemColorScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (context === undefined) {
    // Fallback for components outside ThemeProvider
    return {
      colorScheme: hasHydrated ? systemColorScheme : "light",
      setColorScheme: () => {},
      isLoading: false,
    };
  }

  return context;
}
