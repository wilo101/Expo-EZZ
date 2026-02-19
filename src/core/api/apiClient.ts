import axios from "axios";

export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    STORE_HASH: process.env.EXPO_PUBLIC_STORE_HASH,
    DOMAIN: process.env.EXPO_PUBLIC_DOMAIN,
    LOCALE: process.env.EXPO_PUBLIC_LOCALE || "en", // Match Flutter's defaultLocale
};

if (!API_CONFIG.API_KEY) {
    console.warn("⚠️ API_KEY is missing from environment variables.");
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
