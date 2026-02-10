## 2025-02-17 - Hardcoded API Key Pattern
**Vulnerability:** A hardcoded JWT was found in `src/core/api/apiClient.ts` as `API_CONFIG.API_KEY`.
**Learning:** The project lacked environment variable configuration (`.env` support was missing from `.gitignore` and `src/env.d.ts` was missing).
**Prevention:** Enforce use of `process.env.EXPO_PUBLIC_` for client-side secrets and use `.env.example` to document required keys.
