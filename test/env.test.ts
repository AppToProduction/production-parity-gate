import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/env.js";

describe("parseEnv", () => {
  it("parses common dotenv forms without evaluating input", () => {
    const parsed = parseEnv(`
# comment
export API_URL=https://example.test
TOKEN="synthetic value"
PLAIN=value # trailing comment
INVALID LINE
`);

    expect(Object.fromEntries(parsed)).toEqual({
      API_URL: "https://example.test",
      TOKEN: "synthetic value",
      PLAIN: "value",
    });
  });
});
