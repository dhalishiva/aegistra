import { describe, expect, it } from "vitest";
import { csvEscape, isIsoDate, parseCsv, parseCsvBoolean, serializeCsv } from "../csv";
import { validateAiSystemCsvRow } from "../csv-import";

describe("parseCsv", () => {
  it("handles quotes, commas, newlines and a BOM", () => {
    const { headers, rows } = parseCsv('﻿Name,Purpose\r\n"Acme, Inc","line1\nline2"\r\n"He said ""hi""",x');
    expect(headers).toEqual(["name", "purpose"]);
    expect(rows[0]).toEqual({ name: "Acme, Inc", purpose: "line1\nline2" });
    expect(rows[1].name).toBe('He said "hi"');
  });

  it("rejects duplicate and empty headers and unterminated quotes", () => {
    expect(() => parseCsv("a,a\n1,2")).toThrow(/Duplicate/);
    expect(() => parseCsv("a,\n1,2")).toThrow(/empty column/);
    expect(() => parseCsv('a\n"oops')).toThrow(/unterminated/);
  });

  it("skips blank lines", () => {
    expect(parseCsv("a\n\n1\n\n").rows).toHaveLength(1);
  });
});

describe("csvEscape / serializeCsv", () => {
  it("quotes values that need it", () => {
    expect(csvEscape('a,"b"')).toBe('"a,""b"""');
    expect(csvEscape(null)).toBe("");
  });

  it("neutralises spreadsheet formulas", () => {
    expect(csvEscape("=HYPERLINK(\"http://evil\")")).toMatch(/^"?'=/);
    expect(csvEscape("+1+1")).toBe("'+1+1");
    expect(csvEscape("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvEscape("-2+3")).toBe("'-2+3");
  });

  it("leaves numbers and ordinary text alone", () => {
    expect(csvEscape(-5)).toBe("-5");
    expect(csvEscape("Support agent")).toBe("Support agent");
  });

  it("round-trips through parseCsv", () => {
    const text = serializeCsv(["name", "purpose"], [{ name: "A, B", purpose: 'say "x"' }]);
    expect(parseCsv(text).rows[0]).toEqual({ name: "A, B", purpose: 'say "x"' });
  });
});

describe("helpers", () => {
  it("parses booleans", () => {
    expect(parseCsvBoolean("Yes")).toBe(true);
    expect(parseCsvBoolean("0")).toBe(false);
    expect(parseCsvBoolean("", true)).toBe(true);
    expect(() => parseCsvBoolean("maybe")).toThrow();
  });

  it("validates ISO dates", () => {
    expect(isIsoDate("2026-10-03")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("03/10/2026")).toBe(false);
  });
});

describe("validateAiSystemCsvRow", () => {
  it("requires name and purpose", () => {
    expect(validateAiSystemCsvRow({ name: "", purpose: "x" }, 2).error).toBeTruthy();
    expect(validateAiSystemCsvRow({ name: "x", purpose: "" }, 2).error).toBeTruthy();
  });

  it("rejects a bad email", () => {
    expect(validateAiSystemCsvRow({ name: "x", purpose: "y", owner_email: "nope" }, 2).error).toBeTruthy();
  });

  it("accepts a minimal valid row", () => {
    expect(validateAiSystemCsvRow({ name: "x", purpose: "y" }, 2).value?.name).toBe("x");
  });
});
