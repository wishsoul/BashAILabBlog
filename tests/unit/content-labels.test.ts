import { describe, expect, it } from "vitest";
import { displayContentLabel } from "../../src/lib/content-labels";

describe("content label presentation", () => {
  it("localizes the canonical WordGrill platform only for Chinese display", () => {
    expect(displayContentLabel("zh", "iOS and macOS")).toBe("iOS 和 macOS");
    expect(displayContentLabel("en", "iOS and macOS")).toBe("iOS and macOS");
  });
});
