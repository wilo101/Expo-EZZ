## 2025-02-08 - Hardcoded API Keys in Client Code
**Vulnerability:** A valid JWT API key was hardcoded in `src/core/api/apiClient.ts` along with other configuration details.
**Learning:** React Native apps often inline configuration, leading developers to hardcode secrets for convenience. The key was a user session token, which is critical.
**Prevention:** Use `EXPO_PUBLIC_` environment variables for configuration. Ensure `.env` is gitignored. Use `process.env.EXPO_PUBLIC_VAR` directly.
