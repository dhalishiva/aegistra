export const AI_SYSTEM_CSV_HEADERS = [
  "name",
  "provider",
  "purpose",
  "owner_name",
  "owner_email",
  "lifecycle",
  "data_sensitivity",
  "autonomy",
  "impact",
  "human_review",
  "public_interaction",
  "generates_content",
  "review_due",
  "notes",
] as const;

export const AI_SYSTEM_EXPORT_HEADERS = [
  ...AI_SYSTEM_CSV_HEADERS,
  "priority_score",
  "priority_level",
  "last_reviewed",
] as const;

export type AiSystemCsvHeader = (typeof AI_SYSTEM_CSV_HEADERS)[number];

export type CsvRow = Record<string, string>;

function normalizeNewlines(input: string) {
  return input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function parseCsv(input: string): { headers: string[]; rows: CsvRow[] } {
  const text = normalizeNewlines(input);
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      if (row.some((value) => value.trim() !== "")) records.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.");

  row.push(field);
  if (row.some((value) => value.trim() !== "")) records.push(row);

  if (!records.length) return { headers: [], rows: [] };

  const headers = records[0].map((header) => header.trim().toLowerCase());

  if (headers.some((header) => !header)) {
    throw new Error("CSV contains an empty column header.");
  }

  const seen = new Set<string>();
  for (const header of headers) {
    if (seen.has(header)) throw new Error(`Duplicate CSV column: ${header}`);
    seen.add(header);
  }

  const rows = records.slice(1).map((values) => {
    const result: CsvRow = {};
    headers.forEach((header, index) => {
      result[header] = values[index]?.trim() ?? "";
    });
    return result;
  });

  return { headers, rows };
}

export function csvEscape(value: unknown) {
  let stringValue = value == null ? "" : String(value);
  // Spreadsheet formula injection: a text cell starting with = + - @ can run as a formula in Excel or Sheets.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(stringValue)) stringValue = `'${stringValue}`;
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function serializeCsv(headers: readonly string[], rows: Record<string, unknown>[]) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\r\n");
}

export function parseCsvBoolean(value: string, defaultValue = false) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  throw new Error(`Invalid boolean value "${value}". Use true/false, yes/no, or 1/0.`);
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
