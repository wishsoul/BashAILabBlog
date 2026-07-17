import { describe, expect, it } from "vitest";
import { getUi } from "../../src/i18n";

describe("shared UI copy", () => {
  it("provides a localized demo action label", () => {
    expect((getUi("zh").project as Record<string, string>).demo).toBe("演示");
  });
});
