import { describe, it, expect } from "vitest";
import formatTcmId from "../formatTcmId";

describe("formatTcmId utility", () => {
  it("should replace all colons with underscores in TCM IDs", () => {
    expect(formatTcmId("tcm:5-123-64")).toBe("tcm_5-123-64");
    expect(formatTcmId("ish:10-500-16")).toBe("ish_10-500-16");
  });

  it("should return the string unchanged if there are no colons", () => {
    expect(formatTcmId("tcm_5-123-64")).toBe("tcm_5-123-64");
  });

  it("should handle empty strings and falsy values safely", () => {
    expect(formatTcmId("")).toBe("");
  });
});
