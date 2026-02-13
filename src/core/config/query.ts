export const QUERY_CONFIG = {
    // Sync with server every 60 seconds (optimized from 5s to reduce network/battery usage)
    REAL_TIME_SYNC_INTERVAL: 60000,
    // Cache data for 5 minutes
    STALE_TIME: 1000 * 60 * 5,
};
