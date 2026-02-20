## 2024-05-23 - Hardcoded API Key in Source Code

**Vulnerability:** A hardcoded API Key (JWT) and other configuration secrets were found in `src/core/api/apiClient.ts`.
**Learning:** Hardcoding secrets in source code makes them easily accessible to anyone with access to the codebase or the compiled application. Even client-side keys should be managed via environment variables to allow for easy rotation and configuration changes without code edits.
**Prevention:** Always use environment variables (e.g., `.env` files with `EXPO_PUBLIC_` prefix in Expo) to manage secrets and ensure `.env` files are added to `.gitignore`.
