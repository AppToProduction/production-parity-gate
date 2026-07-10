# Production parity evidence: checkout-findings-fixture

- Status: **FINDINGS**
- Findings: **7**
- Contract SHA-256: `b96b3ae435f8340cc2a136d48298107f9a507c26601dd453fdbf58f2f12d355f`
- Generated: `2026-07-10T21:03:06.699Z`
- Secret handling: variable names may be reported; environment values are never written.

| Severity | Environment | Code | Target | Summary | Remediation |
| --- | --- | --- | --- | --- | --- |
| high | production | API_ENDPOINT_MISMATCH | `endpoints.api` | Observed API path /api/v2 does not match /api. | Align the client API base path, gateway route, and deployed server route. |
| high | production | CALLBACK_MISMATCH | `callbackUrls` | Missing declared callback URL(s): https://app.example.test/auth/callback. | Register the exact declared callback URLs with the identity provider. |
| high | production | CLIENT_BUNDLE_SECRET_LEAK | `VITE_INTERNAL_API_TOKEN` | The built client bundle contains the value assigned to VITE_INTERNAL_API_TOKEN; the value is redacted. | Remove the variable from client code, rebuild, redeploy, and rotate the credential. |
| high | production | MISSING_SERVER_VAR | `STRIPE_WEBHOOK_SECRET` | Required server variable STRIPE_WEBHOOK_SECRET is missing or empty. | Add the variable through the environment's secret store before promotion. |
| high | production | ORIGIN_MISMATCH | `origin` | Observed origin https://preview.example.test does not match declared origin https://app.example.test. | Align the deployment origin and provider configuration before promotion. |
| high | production | PUBLIC_SECRET_NAME | `VITE_INTERNAL_API_TOKEN` | Sensitive-looking variable VITE_INTERNAL_API_TOKEN uses a declared public prefix. | Move this value behind a server-only variable and rotate any deployed credential. |
| medium | production | READINESS_ENDPOINT_MISMATCH | `endpoints.readiness` | Observed readiness path /health does not match /readyz. | Expose and monitor the declared readiness path in the promoted environment. |

## Interpretation boundary

A pass means the supplied artifacts match the declared contract for these checks. It is not a security audit, penetration test, availability guarantee, or proof that the supplied artifacts match the live deployment.
