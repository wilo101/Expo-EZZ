
## 2025-02-28 - Hardcoded API Key and Leaky Logs in Axios Client
**Vulnerability:** The API key, base URL, and store hash were hardcoded directly in `src/core/api/apiClient.ts`. In addition, an Axios response interceptor was logging full error responses which could expose sensitive data.
**Learning:** Hardcoded credentials risk being exposed via version control, and overly verbose error logging can cause data leaks in client-side applications.
**Prevention:** Always use environment variables (e.g., `EXPO_PUBLIC_*` for Expo) to inject secrets at build time, and avoid logging full request/response bodies in production-ready interceptors. Ensure `.env.example` is maintained to document required variables.
