# Repository operating guide

## Product goal

Provide a deterministic TypeScript CLI and GitHub Action that checks a declared preview/production contract and produces reviewable evidence without emitting environment values.

## Architecture

- `src/load.ts` validates YAML and observed JSON.
- `src/check.ts` performs checks against local artifacts.
- `src/report.ts` writes Markdown and JSON evidence.
- `src/cli.ts` owns CLI parsing and exit codes.
- `src/action.ts` adapts the same core to GitHub Actions.
- `fixtures/vite-app` is a synthetic React fixture; `fixtures/contracts` contains pass/fail controls.

## Commands

```text
npm ci
npm run build
npm run typecheck
npm run lint
npm test
npm run demo:clean
npm run demo:findings
npm run validate
npm run secret-scan
npm run check
```

## Secret boundary

Never add production `.env` files, tokens, cookies, credentials, customer data, or private deployment URLs. Fixtures must use visibly synthetic values. Reports may contain variable names but must never serialize variable values.

## Verification checklist

1. Run a clean `npm ci`.
2. Run `npm run check`.
3. Confirm the clean fixture has zero findings.
4. Confirm the findings fixture has seven findings, one for every modeled code.
5. Inspect the generated Markdown and JSON.
6. Confirm `dist/action/index.cjs` was rebuilt and is tracked.
7. Validate the Git worktree is clean after the commit.

## Definition of done

The TypeScript build, lint, tests, fixtures, repository validation, and secret signature scan pass; evidence is updated; no real secrets are present; and limitations remain explicit.

## High-risk files

- `src/check.ts`: could accidentally disclose values or create false confidence.
- `src/report.ts`: public evidence boundary.
- `dist/action/index.cjs`: must match source.
- `action.yml`: runtime interface used by consumers.
- `fixtures/vite-app/.env.*`: synthetic fixture values only.

## Release and rollback

Do not publish packages, create GitHub releases, or change action tags without explicit approval. Follow [`docs/operations/rollback.md`](docs/operations/rollback.md).
