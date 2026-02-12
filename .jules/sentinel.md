## 2024-02-21 - Hardcoded API Key Exposure
**Vulnerability:** Found a hardcoded JWT API key and configuration secrets in `src/core/api/apiClient.ts`.
**Learning:** React Native/Expo apps bundle client-side code, so secrets in source code are visible. Environment variables must be used and keys should be rotated if exposed.
**Prevention:** Use `process.env.EXPO_PUBLIC_` variables for public keys. Validate their existence at runtime. Add `.env` to `.gitignore`.
