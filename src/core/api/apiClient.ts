import axios from "axios";

export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "",
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || "",
    STORE_HASH: process.env.EXPO_PUBLIC_STORE_HASH || "",
    DOMAIN: process.env.EXPO_PUBLIC_DOMAIN || "",
    LOCALE: "en", // Match Flutter's defaultLocale
};

// 🛡️ Sentinel: Ensure required environment variables are present
if (!API_CONFIG.BASE_URL || !API_CONFIG.API_KEY || !API_CONFIG.STORE_HASH || !API_CONFIG.DOMAIN) {
    console.error("🚨 CRITICAL: Missing required API configuration in environment variables.");
}

const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        "X-API-KEY": API_CONFIG.API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "domain": API_CONFIG.DOMAIN,
        "locale": API_CONFIG.LOCALE,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    },
    params: {
        store_hash: API_CONFIG.STORE_HASH,
        api_key: API_CONFIG.API_KEY,
    },
    timeout: 30000,
});

export default apiClient;
