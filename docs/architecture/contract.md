# Contract reference

The YAML contract has a fixed `version: 1`, a project label, public client prefixes, sensitive-name patterns, and exactly two environments: `preview` and `production`.

```yaml
version: 1
project: checkout
publicPrefixes: [VITE_]
sensitiveNamePatterns: [SECRET, TOKEN, PASSWORD, PRIVATE, API_KEY, DATABASE_URL]
environments:
  production:
    envFile: .artifacts/production.env
    requiredServerVars: [DATABASE_URL, SESSION_SECRET]
    origin: https://app.example.com
    callbackUrls: [https://app.example.com/auth/callback]
    endpoints:
      api: /api
      readiness: /readyz
    observedFile: .artifacts/production-observed.json
    clientBundle:
      directory: dist
      maxFileBytes: 2000000
```

`preview` has the same fields. All paths are resolved relative to the contract file. `observedFile` must contain the deployed metadata collected by a trusted, deployment-specific pipeline step:

```json
{
  "origin": "https://app.example.com",
  "callbackUrls": ["https://app.example.com/auth/callback"],
  "endpoints": { "api": "/api", "readiness": "/readyz" }
}
```

The current version deliberately does not fetch that metadata. This avoids quietly treating an untrusted or unauthenticated network response as deployment truth.
