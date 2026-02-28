import axios from "axios";

export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "",
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || "",
    STORE_HASH: process.env.EXPO_PUBLIC_STORE_HASH || "",
    DOMAIN: process.env.EXPO_PUBLIC_DOMAIN || "",
    LOCALE: process.env.EXPO_PUBLIC_LOCALE || "en", // Match Flutter's defaultLocale
};

// Security: Validate required environment variables at runtime
const requiredKeys: (keyof typeof API_CONFIG)[] = ["BASE_URL", "API_KEY", "STORE_HASH", "DOMAIN"];
const missingKeys = requiredKeys.filter((key) => !API_CONFIG[key]);

if (missingKeys.length > 0) {
    console.error(`🚨 Critical Security/Config Error: Missing required environment variables: ${missingKeys.join(", ")}`);
    // In a real production app, we might throw an error here, but to avoid crashing the dev environment immediately we just log it aggressively.
    // throw new Error(`Missing required configuration: ${missingKeys.join(", ")}`);
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
