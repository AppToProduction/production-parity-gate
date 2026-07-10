# Residual risks

| Risk | Consequence | Current control | Next extension |
| --- | --- | --- | --- |
| Stale observed metadata | False pass against old state | Contract hash and explicit metadata file | Signed provider adapters |
| Undeclared prefix | Public credential not classified | Configurable prefix list | Framework presets |
| Encoded or transformed value | Bundle leak not matched | Exact-value scan of built text files | Entropy and source-map-assisted analysis |
| Large/binary artifact excluded | Leak outside scan set | Configurable size cap and documented extensions | Streaming/binary scanners |
| Variable name is sensitive but value is harmless | Naming false positive | Finding includes actionable name only | Per-variable allowlist with expiry |
| Evidence artifact uploaded broadly | Operational metadata disclosure | Values omitted by design | Artifact access policy guidance |
| Compromised runner | Input values exposed outside tool | No network calls and minimal processing | Isolated ephemeral runners |

A zero-finding report is scoped to the declared inputs and implemented checks. It is not a production certification.
