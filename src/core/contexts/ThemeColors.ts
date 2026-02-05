import { useTheme } from "./ThemeContext";

export const useThemeColors = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return {
        // Dark Luxury: Silver & Turquoise
        primary: "#F2F2F2", // Silver Shine
        secondary: "#1C6E7A", // Deep Turquoise
        background: "#0F0F0F", // Deep Black
        surface: "#1A1A1A", // Matte Dark
        text: "#E8E8E8", // Off-white
        border: "rgba(255, 255, 255, 0.1)",
        icon: "#BFC3C7", // Muted Silver
        success: "#1C6E7A", // Turquoise for success
        error: "#ef4444"
    };
};
