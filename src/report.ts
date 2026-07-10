import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { CheckEvidence, CheckResult, Finding } from "./types.js";

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderMarkdown(evidence: CheckEvidence): string {
  const lines = [
    `# Production parity evidence: ${evidence.project}`,
    "",
    `- Status: **${evidence.status.toUpperCase()}**`,
    `- Findings: **${evidence.findingCount}**`,
    `- Contract SHA-256: \`${evidence.contractSha256}\``,
    `- Generated: \`${evidence.generatedAt}\``,
    "- Secret handling: variable names may be reported; environment values are never written.",
    "",
  ];

  if (evidence.findings.length === 0) {
    lines.push("No parity findings were detected by the declared contract.", "");
  } else {
    lines.push(
      "| Severity | Environment | Code | Target | Summary | Remediation |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const finding of evidence.findings) {
      lines.push(
        `| ${finding.severity} | ${finding.environment} | ${finding.code} | \`${escapeCell(finding.target)}\` | ${escapeCell(finding.summary)} | ${escapeCell(finding.remediation)} |`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Interpretation boundary",
    "",
    "A pass means the supplied artifacts match the declared contract for these checks. It is not a security audit, penetration test, availability guarantee, or proof that the supplied artifacts match the live deployment.",
    "",
  );
  return lines.join("\n");
}

export async function writeEvidence(
  evidence: CheckEvidence,
  outputDirectory: string,
): Promise<Omit<CheckResult, "evidence">> {
  const absoluteOutput = resolve(outputDirectory);
  await mkdir(absoluteOutput, { recursive: true });
  const evidenceJsonPath = join(absoluteOutput, "evidence.json");
  const evidenceMarkdownPath = join(absoluteOutput, "summary.md");
  const markdown = renderMarkdown(evidence);

  await writeFile(evidenceJsonPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  await writeFile(evidenceMarkdownPath, markdown, "utf8");

  return { markdown, evidenceJsonPath, evidenceMarkdownPath };
}

export function findingCounts(findings: Finding[]): Record<string, number> {
  return findings.reduce<Record<string, number>>((counts, finding) => {
    counts[finding.code] = (counts[finding.code] ?? 0) + 1;
    return counts;
  }, {});
}
