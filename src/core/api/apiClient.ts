import axios from "axios";

const {
    EXPO_PUBLIC_BASE_URL,
    EXPO_PUBLIC_API_KEY,
    EXPO_PUBLIC_STORE_HASH,
    EXPO_PUBLIC_DOMAIN,
    EXPO_PUBLIC_LOCALE,
} = process.env;

if (!EXPO_PUBLIC_BASE_URL || !EXPO_PUBLIC_API_KEY || !EXPO_PUBLIC_STORE_HASH || !EXPO_PUBLIC_DOMAIN) {
    throw new Error("Missing required environment variables for API configuration");
}

export const API_CONFIG = {
    BASE_URL: EXPO_PUBLIC_BASE_URL,
    API_KEY: EXPO_PUBLIC_API_KEY,
    STORE_HASH: EXPO_PUBLIC_STORE_HASH,
    DOMAIN: EXPO_PUBLIC_DOMAIN,
    LOCALE: EXPO_PUBLIC_LOCALE || "en",
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
