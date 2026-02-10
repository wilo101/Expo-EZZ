## 2024-05-21 - Frequent Refetching and Object Identity
**Learning:** The application uses a 5-second `REAL_TIME_SYNC_INTERVAL` for `useProducts`. The data transformation function `mapApiProductToProduct` creates new object references on every run, even if data is unchanged. This causes frequent re-renders of the entire `FlatList` in `BrowseScreen`.
**Action:** When using aggressive polling intervals, ensure transformation functions are memoized or return stable references, and optimize list components with `React.memo` and stable callbacks to prevent unnecessary renders.
