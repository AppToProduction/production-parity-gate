import { describe, expect, it } from "vitest";
import { parityContractSchema } from "../src/schema.js";

describe("parityContractSchema", () => {
  it("requires both preview and production declarations", () => {
    const parsed = parityContractSchema.safeParse({
      version: 1,
      project: "incomplete",
      publicPrefixes: ["VITE_"],
      sensitiveNamePatterns: ["SECRET"],
      environments: {},
    });

    expect(parsed.success).toBe(false);
  });
});
