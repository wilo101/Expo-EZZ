## 2024-05-22 - API Transformation Instability
**Learning:** The `useProducts` hook transforms API data inside `queryFn`, creating new object references on every fetch (even if data is identical). This breaks React Query's referential stability and forces re-renders every 5 seconds.
**Action:** Use `React.memo` with custom comparison for list items to prevent re-renders caused by unstable data references. In the future, prefer using the `select` option in `useQuery` for data transformation to maintain referential stability.
