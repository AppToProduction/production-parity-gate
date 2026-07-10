import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "./env.js";
import { listScannableFiles } from "./files.js";
import { loadObserved, type LoadedContract } from "./load.js";
import type {
  EnvironmentContract,
  EnvironmentName,
  Finding,
  ObservedEnvironment,
} from "./types.js";

function isSensitiveName(name: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(name));
}

function addMismatchFindings(
  findings: Finding[],
  environment: EnvironmentName,
  expected: EnvironmentContract,
  observed: ObservedEnvironment,
): void {
  if (expected.origin !== observed.origin) {
    findings.push({
      code: "ORIGIN_MISMATCH",
      severity: "high",
      environment,
      target: "origin",
      summary: `Observed origin ${observed.origin} does not match declared origin ${expected.origin}.`,
      remediation: "Align the deployment origin and provider configuration before promotion.",
    });
  }

  const missingCallbacks = expected.callbackUrls.filter(
    (callback) => !observed.callbackUrls.includes(callback),
  );
  if (missingCallbacks.length > 0) {
    findings.push({
      code: "CALLBACK_MISMATCH",
      severity: "high",
      environment,
      target: "callbackUrls",
      summary: `Missing declared callback URL(s): ${missingCallbacks.join(", ")}.`,
      remediation: "Register the exact declared callback URLs with the identity provider.",
    });
  }

  if (expected.endpoints.api !== observed.endpoints.api) {
    findings.push({
      code: "API_ENDPOINT_MISMATCH",
      severity: "high",
      environment,
      target: "endpoints.api",
      summary: `Observed API path ${observed.endpoints.api} does not match ${expected.endpoints.api}.`,
      remediation: "Align the client API base path, gateway route, and deployed server route.",
    });
  }

  if (expected.endpoints.readiness !== observed.endpoints.readiness) {
    findings.push({
      code: "READINESS_ENDPOINT_MISMATCH",
      severity: "medium",
      environment,
      target: "endpoints.readiness",
      summary: `Observed readiness path ${observed.endpoints.readiness} does not match ${expected.endpoints.readiness}.`,
      remediation: "Expose and monitor the declared readiness path in the promoted environment.",
    });
  }
}

async function findBundleLeaks(
  env: Map<string, string>,
  bundleDirectory: string,
  maxFileBytes: number,
  patterns: RegExp[],
): Promise<string[]> {
  const candidates = [...env.entries()].filter(
    ([name, value]) => value.length >= 8 && isSensitiveName(name, patterns),
  );
  if (candidates.length === 0) return [];

  const leakedNames = new Set<string>();
  for (const path of await listScannableFiles(bundleDirectory, maxFileBytes)) {
    const contents = await readFile(path, "utf8");
    for (const [name, value] of candidates) {
      if (contents.includes(value)) leakedNames.add(name);
    }
  }

  return [...leakedNames].sort();
}

export async function checkContract(loaded: LoadedContract): Promise<Finding[]> {
  const findings: Finding[] = [];
  const patterns = loaded.contract.sensitiveNamePatterns.map((pattern) => new RegExp(pattern, "i"));
  const environments: EnvironmentName[] = ["preview", "production"];

  for (const environment of environments) {
    const expected = loaded.contract.environments[environment];
    const envPath = resolve(loaded.contractDirectory, expected.envFile);
    const observedPath = resolve(loaded.contractDirectory, expected.observedFile);
    const bundleDirectory = resolve(loaded.contractDirectory, expected.clientBundle.directory);
    const env = parseEnv(await readFile(envPath, "utf8"));
    const observed = await loadObserved(observedPath);

    for (const name of expected.requiredServerVars) {
      if (!env.get(name)?.trim()) {
        findings.push({
          code: "MISSING_SERVER_VAR",
          severity: "high",
          environment,
          target: name,
          summary: `Required server variable ${name} is missing or empty.`,
          remediation: "Add the variable through the environment's secret store before promotion.",
        });
      }
    }

    for (const name of [...env.keys()].sort()) {
      const isPublic = loaded.contract.publicPrefixes.some((prefix) => name.startsWith(prefix));
      if (isPublic && isSensitiveName(name, patterns)) {
        findings.push({
          code: "PUBLIC_SECRET_NAME",
          severity: "high",
          environment,
          target: name,
          summary: `Sensitive-looking variable ${name} uses a declared public prefix.`,
          remediation: "Move this value behind a server-only variable and rotate any deployed credential.",
        });
      }
    }

    addMismatchFindings(findings, environment, expected, observed);

    for (const name of await findBundleLeaks(
      env,
      bundleDirectory,
      expected.clientBundle.maxFileBytes,
      patterns,
    )) {
      findings.push({
        code: "CLIENT_BUNDLE_SECRET_LEAK",
        severity: "high",
        environment,
        target: name,
        summary: `The built client bundle contains the value assigned to ${name}; the value is redacted.`,
        remediation: "Remove the variable from client code, rebuild, redeploy, and rotate the credential.",
      });
    }
  }

  return findings.sort((left, right) =>
    `${left.environment}:${left.code}:${left.target}`.localeCompare(
      `${right.environment}:${right.code}:${right.target}`,
    ),
  );
}
