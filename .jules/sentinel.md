## 2025-02-18 - Hardcoded API Key Exposure
**Vulnerability:** The API key was hardcoded in `src/core/api/apiClient.ts` as a string literal.
**Learning:** Hardcoded secrets in source code are a major security risk as they can be easily exposed if the codebase is leaked or accessed by unauthorized personnel.
**Prevention:** Use environment variables (e.g., `EXPO_PUBLIC_` for Expo apps) to store sensitive configuration. Ensure `.env` files are added to `.gitignore`.
