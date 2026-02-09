## 2024-02-17 - Hardcoded API Key in API Client
**Vulnerability:** A hardcoded JWT API key was found in `src/core/api/apiClient.ts` along with store hash and domain.
**Learning:** Developers sometimes hardcode sensitive keys for convenience during development, forgetting to move them to environment variables before pushing.
**Prevention:** Use `EXPO_PUBLIC_` environment variables and `.env` files from the start. Add `.env` to `.gitignore` immediately. Use linting rules to detect potential secrets.
