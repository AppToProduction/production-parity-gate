import * as core from "@actions/core";
import { relative } from "node:path";
import { runParityGate } from "./run.js";

async function run(): Promise<void> {
  try {
    const contractPath = core.getInput("contract", { required: true });
    const outputDirectory = core.getInput("output", { required: true });
    const allowFindings = core.getBooleanInput("allow-findings");
    const result = await runParityGate({ contractPath, outputDirectory });

    core.setOutput("finding-count", result.evidence.findingCount.toString());
    core.setOutput("evidence-json", relative(process.cwd(), result.evidenceJsonPath));
    core.setOutput("evidence-markdown", relative(process.cwd(), result.evidenceMarkdownPath));
    await core.summary.addRaw(result.markdown).write();

    if (result.evidence.findingCount > 0 && !allowFindings) {
      core.setFailed(`${result.evidence.findingCount} production parity finding(s) detected.`);
    } else {
      core.info(`Production parity gate: ${result.evidence.status}.`);
    }
  } catch (error: unknown) {
    core.setFailed(error instanceof Error ? error.message : "Unknown production parity gate error");
  }
}

void run();
