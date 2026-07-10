# Rollback runbook

## Consumer rollback

1. Pin the last known-good commit SHA in the calling workflow.
2. Re-run the workflow and retain both evidence artifacts.
3. Compare `schemaVersion`, contract hash, finding codes, and counts.
4. Open a synthetic reproduction if behavior changed unexpectedly.

Do not suppress a new finding with `allow-findings` unless the owning team records the exception and expiry.

## Maintainer rollback

1. Reproduce with `npm ci && npm run check`.
2. Revert the smallest faulty source change; do not rewrite published history.
3. Rebuild `dist/action/index.cjs`.
4. Re-run the complete check and inspect both evidence reports.
5. Publish a corrective commit only after review.

Package publication, releases, tags used by customers, and production deployment require explicit maintainer approval.
