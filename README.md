# Production Parity Gate

[![CI](https://github.com/VJO-JavaScript/production-parity-gate/actions/workflows/ci.yml/badge.svg)](https://github.com/VJO-JavaScript/production-parity-gate/actions/workflows/ci.yml)

A Node 20+ TypeScript CLI and GitHub Action that turns preview-to-production assumptions into reviewable evidence. It checks two declared environments without printing environment values.

The included failing fixture catches all seven modeled finding classes:

- a missing required server variable;
- a sensitive-looking variable with a public client prefix;
- an origin mismatch;
- a missing callback URL;
- API and readiness-path mismatches; and
- a synthetic secret value compiled into a Vite/React client bundle.

This is production-readiness tooling, **not a security audit**. It does not probe a live system, validate credential permissions, inspect a cloud account, or prove that supplied artifacts match a deployment.

## 60-second local tour

Prerequisites: Node.js 20+ and npm.

```bash
npm ci
npm run build
npm run demo:findings
```

The demonstration intentionally reports findings but returns success because it uses `--allow-findings`. Inspect:

- `runs/demo-findings/summary.md` for human review;
- `runs/demo-findings/evidence.json` for automation; and
- `fixtures/contracts/findings.contract.yml` for the declared contract.

Run the passing control with `npm run demo:clean`. Run every local quality gate with `npm run check`.

## Use the CLI

1. Copy [`fixtures/contracts/clean.contract.yml`](fixtures/contracts/clean.contract.yml) into your repository.
2. Point each environment at a local dotenv snapshot, an observed metadata JSON file, and its built client directory.
3. Store only synthetic or locally protected environment snapshots. Never commit real values.
4. Run:

```bash
node dist/cli.js check \
  --contract parity.contract.yml \
  --output parity-evidence
```

Exit code `0` means pass, `2` means findings, and `1` means invalid input or a runtime error. Add `--allow-findings` only for evaluation or non-blocking adoption.

## Use the GitHub Action

```yaml
- uses: VJO-JavaScript/production-parity-gate@main
  with:
    contract: parity.contract.yml
    output: parity-evidence

- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: production-parity-evidence
    path: parity-evidence/
```

For a production workflow, pin third-party actions—including this one—to a reviewed commit SHA. The Action writes the Markdown result to the job summary and exposes the finding count and evidence paths as outputs.

## What the contract means

Each environment declares:

- server-variable names that must be present;
- the expected origin, callbacks, API path, and readiness path;
- a local observed-metadata snapshot; and
- a built client directory to scan for values belonging to sensitive variable names.

Environment **values are read for equality checks but never emitted**. Reports may include variable names, declared URLs, endpoint paths, finding codes, and remediation guidance. See the [contract architecture](docs/architecture/contract.md) and [threat boundary](docs/architecture/threat-boundary.md).

## Evidence and operations

- [Verification evidence](docs/evidence/verification.md)
- [Architecture](docs/architecture/overview.md)
- [Rollback runbook](docs/operations/rollback.md)
- [Residual risks](docs/operations/residual-risks.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Design choices

- Deterministic local fixtures make every modeled failure reproducible without cloud credentials.
- Zod rejects incomplete contracts before checks run.
- JSON supports CI policy; Markdown supports review and incident handoff.
- The Action is bundled for Node 20 so consumers do not install dependencies at runtime.
- The Vite/React fixture demonstrates client-bundle leakage at build output, not just suspicious naming.

## License

MIT. See [`LICENSE`](LICENSE).
