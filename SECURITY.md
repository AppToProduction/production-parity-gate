# Security policy

## Supported version

Only the current `main` branch is supported before the first published release.

## Reporting

Use GitHub private vulnerability reporting when it is available. Do not open a public issue containing a secret, environment value, customer record, private repository URL, or private deployment URL.

For ordinary defects, use the repository bug template with a synthetic reproduction.

## Data boundary

The gate reads local dotenv snapshots in memory. It emits variable names, URLs, paths, codes, and counts—not environment values. Inputs and reports remain on the runner unless the caller uploads them. Callers are responsible for protecting their contract, observed metadata, workspace, logs, and uploaded artifacts.

## Response target

Valid reports will be acknowledged as capacity allows. A fix, mitigation, or documented limitation will be prepared before public disclosure when practical.
