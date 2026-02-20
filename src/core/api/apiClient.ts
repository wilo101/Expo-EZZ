import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const STORE_HASH = process.env.EXPO_PUBLIC_STORE_HASH;
const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const LOCALE = process.env.EXPO_PUBLIC_LOCALE || "en";

if (!API_KEY || !API_URL || !STORE_HASH || !DOMAIN) {
    console.error("Missing required environment variables!");
    // We might not want to throw immediately if we want to avoid crashing the whole bundle execution just for import,
    // but for an API client it's probably better to fail fast.
    // However, throwing at module level can break the app startup completely with a red screen.
    // Let's keep the throw for safety as per Sentinel guidelines "Fail securely".
    throw new Error("Missing required environment variables (EXPO_PUBLIC_API_KEY, EXPO_PUBLIC_API_URL, EXPO_PUBLIC_STORE_HASH, EXPO_PUBLIC_DOMAIN)");
}

export const API_CONFIG = {
    BASE_URL: API_URL,
    API_KEY: API_KEY,
    STORE_HASH: STORE_HASH,
    DOMAIN: DOMAIN,
    LOCALE: LOCALE,
};

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

// Interceptor to handle errors globally or add auth tokens if needed
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error("❌ API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
