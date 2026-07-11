import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/env.js";

describe("parseEnv", () => {
  it("parses common dotenv forms without evaluating input", () => {
    const parsed = parseEnv(`
# comment
export API_URL=https://example.test
TOKEN="synthetic value"
PLAIN=value # trailing comment
ANCHOR=https://example.test/#section
HASH=alpha#beta
INVALID LINE
`);

    expect(Object.fromEntries(parsed)).toEqual({
      API_URL: "https://example.test",
      TOKEN: "synthetic value",
      PLAIN: "value",
      ANCHOR: "https://example.test/#section",
      HASH: "alpha#beta",
    });
  });

  it("strips a long whitespace-delimited comment in linear time", () => {
    const padding = " ".repeat(100_000);
    const parsed = parseEnv(`LONG=value${padding}# comment`);

    expect(parsed.get("LONG")).toBe("value");
  });
});
