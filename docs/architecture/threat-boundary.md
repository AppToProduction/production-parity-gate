# Threat boundary

## Covered

- Missing declared server-variable names.
- Sensitive-looking names in declared public namespaces.
- Declared versus observed origins, callbacks, API paths, and readiness paths.
- Exact sensitive values from the supplied environment snapshot appearing in supplied text bundle artifacts.
- Evidence generation without serializing values.

## Not covered

- Credential validity, scope, rotation history, or provider-side configuration.
- Runtime access control, authorization, RLS, dependency vulnerabilities, malware, or source-code review.
- Network reachability, DNS, TLS, latency, readiness semantics, or live endpoint behavior.
- Minified/encoded/hashed secret transformations that do not retain the exact value.
- Files larger than `maxFileBytes`, binary formats, server bundles, source maps excluded by the caller, or undeclared public prefixes.
- Proof that local snapshots came from the claimed environment.

The tool is a promotion guard for declared artifacts. It should complement provider-native policy, secret scanning, tests, observability, and human review.
