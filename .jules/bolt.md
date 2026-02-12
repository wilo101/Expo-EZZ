## 2025-05-18 - Stable List Rendering with React Query Polling
**Learning:** The application uses a 5-second polling interval for `react-query` (`REAL_TIME_SYNC_INTERVAL`). Since the data transformation (`mapApiProductToProduct`) creates new object references on every fetch, list items re-render frequently even if the data content hasn't changed.
**Action:** Use `React.memo` with a custom comparison function (checking `id`, `updatedAt`, etc.) for list item components like `ProductCard` to prevent unnecessary re-renders caused by reference instability.
