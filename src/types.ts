export const FINDING_CODES = [
  "MISSING_SERVER_VAR",
  "PUBLIC_SECRET_NAME",
  "ORIGIN_MISMATCH",
  "CALLBACK_MISMATCH",
  "API_ENDPOINT_MISMATCH",
  "READINESS_ENDPOINT_MISMATCH",
  "CLIENT_BUNDLE_SECRET_LEAK",
] as const;

export type FindingCode = (typeof FINDING_CODES)[number];
export type EnvironmentName = "preview" | "production";

export interface EndpointContract {
  api: string;
  readiness: string;
}

export interface EnvironmentContract {
  envFile: string;
  requiredServerVars: string[];
  origin: string;
  callbackUrls: string[];
  endpoints: EndpointContract;
  observedFile: string;
  clientBundle: {
    directory: string;
    maxFileBytes: number;
  };
}

export interface ParityContract {
  version: 1;
  project: string;
  publicPrefixes: string[];
  sensitiveNamePatterns: string[];
  environments: Record<EnvironmentName, EnvironmentContract>;
}

export interface ObservedEnvironment {
  origin: string;
  callbackUrls: string[];
  endpoints: EndpointContract;
}

export interface Finding {
  code: FindingCode;
  severity: "high" | "medium";
  environment: EnvironmentName;
  target: string;
  summary: string;
  remediation: string;
}

export interface CheckEvidence {
  schemaVersion: 1;
  project: string;
  contractSha256: string;
  generatedAt: string;
  status: "pass" | "findings";
  findingCount: number;
  checks: {
    environmentsChecked: EnvironmentName[];
    classesChecked: FindingCode[];
  };
  findings: Finding[];
}

export interface CheckResult {
  evidence: CheckEvidence;
  markdown: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
}
