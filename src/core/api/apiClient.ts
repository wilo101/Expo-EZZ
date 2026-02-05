import axios from "axios";

export const API_CONFIG = {
    BASE_URL: "https://ezzsilver.myzammit.shop/api/v2",
    API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMTU5MTIsInR5cGUiOiJ1c2VyIiwiY29tcGFueV9pZCI6MTYzODQsImlhdCI6MTc2NTIzNDY4MX0.dE1Xk6aNzU82cSGMm4zrQma9WrJ5gU9RM4SqS5WPP_o",
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
