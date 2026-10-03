import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "../safe-redirect";

describe("safeRedirectPath", () => {
  it("allows same-site paths", () => {
    expect(safeRedirectPath("/app/systems?x=1", "/app")).toBe("/app/systems?x=1");
    expect(safeRedirectPath("/invite/abc", "/app")).toBe("/invite/abc");
  });

  it.each([
    "//evil.example",
    "https://evil.example",
    "http://evil.example/app",
    "/\\evil.example",
    "javascript:alert(1)",
    "app",
    "",
    "/app\nSet-Cookie: x=1",
  ])("rejects %j", (value) => {
    expect(safeRedirectPath(value, "/fallback")).toBe("/fallback");
  });

  it("falls back for null and undefined", () => {
    expect(safeRedirectPath(null, "/onboarding")).toBe("/onboarding");
    expect(safeRedirectPath(undefined, "/onboarding")).toBe("/onboarding");
  });
});
