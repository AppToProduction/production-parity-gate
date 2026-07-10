# Architecture overview

```text
YAML contract ─┐
dotenv names   ├─> validate ─> compare ─> redact-by-design ─> JSON evidence
observed JSON  ┤                                           └> Markdown summary
Vite bundle  ──┘
```

The CLI and GitHub Action call the same `runParityGate` function. Contract and observed inputs are schema-validated. The checker reads values only to determine presence and whether a sensitive value is embedded in a client artifact. Findings retain the variable name and discard the value.

## Components

- **Loader:** resolves contract-relative paths, validates documents, and hashes the contract.
- **Checker:** evaluates both preview and production in a stable order.
- **Reporter:** writes a versioned JSON shape and a human-readable Markdown table.
- **CLI adapter:** maps outcomes to exit codes.
- **Action adapter:** maps outcomes to Action outputs, a job summary, and workflow failure.

No network calls are made. Determinism is a deliberate property: the gate evaluates the artifacts that a pipeline supplies.
