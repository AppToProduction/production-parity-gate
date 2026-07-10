# Verification evidence

The repository carries two deterministic controls:

| Control | Expected result | Purpose |
| --- | --- | --- |
| `clean.contract.yml` | zero findings | Detect accidental false positives in the modeled happy path |
| `findings.contract.yml` | seven findings | Exercise every modeled finding code |

The React fixture is built three times: clean preview, clean production, and intentionally leaky production. The leaky build embeds a visibly synthetic token so the scanner proves it examines the built client artifact.

The verification run and exact command outcomes are recorded in [`runs/2026-07-10-local/README.md`](../../runs/2026-07-10-local/README.md). CI repeats clean install, type checking, linting, builds, tests, both controls, link/YAML/JSON validation, the secret signature scan, and the packaged Action path.

Playwright is intentionally absent: the shipped product has no browser UI or network path, and the critical claim is bundle inspection. The React fixture is compiled by Vite and its emitted artifacts are inspected directly. Adding a browser download would not strengthen that claim.
