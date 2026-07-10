import { checkContract } from "./check.js";
import { loadContract } from "./load.js";
import { renderMarkdown, writeEvidence } from "./report.js";
import { FINDING_CODES, type CheckEvidence, type CheckResult } from "./types.js";

export interface RunOptions {
  contractPath: string;
  outputDirectory: string;
  now?: () => Date;
}

export async function runParityGate(options: RunOptions): Promise<CheckResult> {
  const loaded = await loadContract(options.contractPath);
  const findings = await checkContract(loaded);
  const evidence: CheckEvidence = {
    schemaVersion: 1,
    project: loaded.contract.project,
    contractSha256: loaded.contractSha256,
    generatedAt: (options.now ?? (() => new Date()))().toISOString(),
    status: findings.length === 0 ? "pass" : "findings",
    findingCount: findings.length,
    checks: {
      environmentsChecked: ["preview", "production"],
      classesChecked: [...FINDING_CODES],
    },
    findings,
  };
  const output = await writeEvidence(evidence, options.outputDirectory);
  return { evidence, ...output };
}

export { renderMarkdown };
