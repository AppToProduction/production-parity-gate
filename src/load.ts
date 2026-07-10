import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import YAML from "yaml";
import { parityContractSchema, observedEnvironmentSchema } from "./schema.js";
import type { ObservedEnvironment, ParityContract } from "./types.js";

export interface LoadedContract {
  contract: ParityContract;
  contractDirectory: string;
  contractSha256: string;
}

export async function loadContract(contractPath: string): Promise<LoadedContract> {
  const absolutePath = resolve(contractPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed: unknown = YAML.parse(raw);
  const contract = parityContractSchema.parse(parsed) as ParityContract;

  for (const pattern of contract.sensitiveNamePatterns) {
    try {
      void new RegExp(pattern, "i");
    } catch {
      throw new Error(`Invalid sensitiveNamePatterns entry: ${pattern}`);
    }
  }

  return {
    contract,
    contractDirectory: dirname(absolutePath),
    contractSha256: createHash("sha256").update(raw).digest("hex"),
  };
}

export async function loadObserved(path: string): Promise<ObservedEnvironment> {
  const raw = await readFile(path, "utf8");
  return observedEnvironmentSchema.parse(JSON.parse(raw)) as ObservedEnvironment;
}
