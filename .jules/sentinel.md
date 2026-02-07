## 2026-02-07 - Hardcoded User Token in API Client
**Vulnerability:** A hardcoded JWT token (likely a user session token) was found directly in `src/core/api/apiClient.ts` as `API_KEY`. This exposed a specific user's session to anyone with access to the codebase.
**Learning:** Developers might hardcode their own tokens for testing and forget to remove them. Always check configuration files for suspicious long strings.
**Prevention:** Enforce environment variable usage for all secrets. Use tools like `git-secrets` or pre-commit hooks to scan for high-entropy strings.
