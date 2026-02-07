## 2026-02-07 - [Unstable Object References in React Query]
**Learning:** Returning new object references (e.g., `new Date()`, `[]` literal) inside a `queryFn` mapping function defeats React Query's structural sharing if the data is theoretically "same" but structurally different due to timestamps or new array instances. This causes infinite re-render loops if `refetchInterval` is active.
**Action:** Always use stable constants (e.g., `FALLBACK_DATE`, `EMPTY_ARRAY`) for default values in data mapping functions.
