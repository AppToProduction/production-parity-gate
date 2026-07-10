#!/usr/bin/env node
import { relative } from "node:path";
import { pathToFileURL } from "node:url";
import { findingCounts } from "./report.js";
import { runParityGate } from "./run.js";

interface CliOptions {
  contractPath: string;
  outputDirectory: string;
  allowFindings: boolean;
}

const HELP = `production-parity-gate

Usage:
  parity-gate check --contract <path> [--output <directory>] [--allow-findings]

Exit codes:
  0  Pass, or findings explicitly allowed
  1  Configuration/runtime error
  2  Parity findings detected
`;

function parseArguments(arguments_: string[]): CliOptions | "help" {
  if (arguments_.includes("--help") || arguments_.includes("-h")) return "help";
  if (arguments_[0] !== "check") throw new Error("Expected the 'check' command.");

  let contractPath = "";
  let outputDirectory = "parity-evidence";
  let allowFindings = false;

  for (let index = 1; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--allow-findings") {
      allowFindings = true;
    } else if (argument === "--contract") {
      contractPath = arguments_[index + 1] ?? "";
      index += 1;
    } else if (argument === "--output") {
      outputDirectory = arguments_[index + 1] ?? "";
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!contractPath) throw new Error("--contract is required.");
  if (!outputDirectory) throw new Error("--output cannot be empty.");
  return { contractPath, outputDirectory, allowFindings };
}

export async function main(arguments_: string[] = process.argv.slice(2)): Promise<number> {
  try {
    const options = parseArguments(arguments_);
    if (options === "help") {
      process.stdout.write(HELP);
      return 0;
    }

    const result = await runParityGate({
      contractPath: options.contractPath,
      outputDirectory: options.outputDirectory,
    });
    const summary = {
      status: result.evidence.status,
      findingCount: result.evidence.findingCount,
      countsByCode: findingCounts(result.evidence.findings),
      evidenceJson: relative(process.cwd(), result.evidenceJsonPath),
      evidenceMarkdown: relative(process.cwd(), result.evidenceMarkdownPath),
    };
    process.stdout.write(`${JSON.stringify(summary)}\n`);
    return result.evidence.findingCount > 0 && !options.allowFindings ? 2 : 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    process.stderr.write(`parity-gate error: ${message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
