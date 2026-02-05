import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { cssInterop } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use NativeWind's hook for controlling the class .dark
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const [theme, setInternalTheme] = useState<Theme>((colorScheme as Theme) || "light");

    useEffect(() => {
        // Load persisted theme
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem("user-theme");
                if (savedTheme) {
                    setInternalTheme(savedTheme as Theme);
                    setColorScheme(savedTheme as ColorSchemeName);
                }
            } catch (e) {
                console.error("Failed to load theme", e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setInternalTheme(newTheme);
        setColorScheme(newTheme);
        AsyncStorage.setItem("user-theme", newTheme);
    };

    const setTheme = (newTheme: Theme) => {
        setInternalTheme(newTheme);
        setColorScheme(newTheme);
        AsyncStorage.setItem("user-theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
