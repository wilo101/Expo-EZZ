import * as SecureStore from "expo-secure-store";

const KEYS = {
    AUTH_TOKEN: "ezz_silver_auth_token",
    USER_ID: "ezz_silver_user_id",
    USER_METADATA: "ezz_silver_user_metadata",
};

export const SecureStorage = {
    async setToken(token: string) {
        await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
    },

    async getToken() {
        return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    },

    async setUserId(id: string) {
        await SecureStore.setItemAsync(KEYS.USER_ID, id);
    },

    async getUserId() {
        return await SecureStore.getItemAsync(KEYS.USER_ID);
    },

    async setUserMetadata(metadata: any) {
        await SecureStore.setItemAsync(KEYS.USER_METADATA, JSON.stringify(metadata));
    },

    async getUserMetadata() {
        const metadata = await SecureStore.getItemAsync(KEYS.USER_METADATA);
        return metadata ? JSON.parse(metadata) : null;
    },

    async clearSession() {
        await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(KEYS.USER_ID);
        await SecureStore.deleteItemAsync(KEYS.USER_METADATA);
    },
};
