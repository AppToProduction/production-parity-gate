import { z } from "zod";

const endpointSchema = z.object({
  api: z.string().min(1),
  readiness: z.string().min(1),
});

const environmentSchema = z.object({
  envFile: z.string().min(1),
  requiredServerVars: z.array(z.string().regex(/^[A-Z][A-Z0-9_]*$/)).min(1),
  origin: z.string().url(),
  callbackUrls: z.array(z.string().url()).min(1),
  endpoints: endpointSchema,
  observedFile: z.string().min(1),
  clientBundle: z.object({
    directory: z.string().min(1),
    maxFileBytes: z.number().int().positive().max(20_000_000).default(2_000_000),
  }),
});

export const parityContractSchema = z.object({
  version: z.literal(1),
  project: z.string().min(1),
  publicPrefixes: z.array(z.string().min(1)).min(1),
  sensitiveNamePatterns: z.array(z.string().min(1)).min(1),
  environments: z.object({
    preview: environmentSchema,
    production: environmentSchema,
  }),
});

export const observedEnvironmentSchema = z.object({
  origin: z.string().url(),
  callbackUrls: z.array(z.string().url()),
  endpoints: endpointSchema,
});
