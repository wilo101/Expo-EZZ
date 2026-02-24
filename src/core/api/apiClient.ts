import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

if (!API_KEY) {
    throw new Error("EXPO_PUBLIC_API_KEY is not defined in environment variables.");
}

export const API_CONFIG = {
    BASE_URL: "https://ezzsilver.myzammit.shop/api/v2",
    API_KEY: API_KEY,
    STORE_HASH: "ezzsilver",
    DOMAIN: "ezzsilver.myzammit.shop",
    LOCALE: "en", // Match Flutter's defaultLocale
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
