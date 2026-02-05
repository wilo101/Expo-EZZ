import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProviderProps } from "@tanstack/react-query-persist-client";

// cache for 24 hours
const STALE_TIME = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: STALE_TIME,
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (formerly cacheTime)
        },
    },
});

const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 3000, // Throttle to every 3 seconds
});

export const persistOptions = {
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    buster: "v1", // Increment this to force cache invalidation on updates
};
