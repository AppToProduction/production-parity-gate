import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runParityGate } from "../src/run.js";

const temporaryDirectories: string[] = [];
const fixedNow = () => new Date("2026-07-10T12:00:00.000Z");

async function outputDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "parity-gate-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true })));
});

describe("runParityGate", () => {
  it("passes a matching preview and production contract", async () => {
    const result = await runParityGate({
      contractPath: resolve("fixtures/contracts/clean.contract.yml"),
      outputDirectory: await outputDirectory(),
      now: fixedNow,
    });

    expect(result.evidence.status).toBe("pass");
    expect(result.evidence.findings).toEqual([]);
    expect(JSON.parse(await readFile(result.evidenceJsonPath, "utf8"))).toEqual(result.evidence);
  });

  it("detects every modeled failure class and never serializes values", async () => {
    const result = await runParityGate({
      contractPath: resolve("fixtures/contracts/findings.contract.yml"),
      outputDirectory: await outputDirectory(),
      now: fixedNow,
    });
    const codes = new Set(result.evidence.findings.map((finding) => finding.code));
    const serialized = JSON.stringify(result.evidence);

    expect(codes).toEqual(
      new Set([
        "MISSING_SERVER_VAR",
        "PUBLIC_SECRET_NAME",
        "ORIGIN_MISMATCH",
        "CALLBACK_MISMATCH",
        "API_ENDPOINT_MISMATCH",
        "READINESS_ENDPOINT_MISMATCH",
        "CLIENT_BUNDLE_SECRET_LEAK",
      ]),
    );
    expect(result.evidence.findingCount).toBe(7);
    expect(serialized).not.toContain("fixture-intentional-client-leak-value");
    expect(serialized).not.toContain("fixture-production-session-value");
    expect(serialized).not.toContain("fixture-postgres-production-value");
    expect(result.markdown).toContain("values are never written");
  });
});
