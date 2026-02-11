# Sentinel Journal

## 2025-02-18 - Hardcoded API Secrets in Source Code
**Vulnerability:** A critical API key and other sensitive configuration values were hardcoded directly in `src/core/api/apiClient.ts`.
**Learning:** The previous implementation likely prioritized convenience over security, lacking a proper environment variable strategy.
**Prevention:** Always use `process.env` for sensitive values. Ensure `.env` is in `.gitignore` and `.env.example` is provided. Type definitions in `src/env.d.ts` help enforce this pattern.
