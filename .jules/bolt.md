## 2024-05-23 - Aggressive Polling
**Learning:** React Query `refetchInterval` overrides `staleTime`. Setting it to 5s causes massive over-fetching regardless of data freshness.
**Action:** Default to `staleTime` for freshness. Only use `refetchInterval` for critical real-time data, and keep it reasonable (e.g. 60s+).
