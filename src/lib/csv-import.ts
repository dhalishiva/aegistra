import {
  AI_SYSTEM_CSV_HEADERS,
  AI_SYSTEM_EXPORT_HEADERS,
  type CsvRow,
  isIsoDate,
  parseCsvBoolean,
} from "./csv";
import { scoreGovernancePriority } from "./scoring";

const lifecycleValues = new Set(["pilot", "production", "paused", "retired"]);
const sensitivityValues = new Set(["none", "internal", "personal", "sensitive"]);
const autonomyValues = new Set(["assistive", "recommendation", "decision", "autonomous"]);
const impactValues = new Set(["low", "moderate", "high"]);

export type CsvImportState = {
  ok: boolean;
  error: string | null;
  imported: number;
  skippedDuplicates: number;
  validationErrors: string[];
};

export const csvImportInitialState: CsvImportState = {
  ok: false,
  error: null,
  imported: 0,
  skippedDuplicates: 0,
  validationErrors: [],
};

export type ValidatedAiSystemImport = {
  name: string;
  provider: string;
  purpose: string;
  owner_name: string;
  owner_email: string;
  lifecycle: "pilot" | "production" | "paused" | "retired";
  data_sensitivity: "none" | "internal" | "personal" | "sensitive";
  autonomy: "assistive" | "recommendation" | "decision" | "autonomous";
  impact: "low" | "moderate" | "high";
  human_review: boolean;
  public_interaction: boolean;
  generates_content: boolean;
  review_due: string | null;
  notes: string | null;
  priority_score: number;
  priority_level: "low" | "medium" | "high";
};

export function validateCsvHeaders(headers: string[]) {
  const allowed = new Set<string>(AI_SYSTEM_EXPORT_HEADERS);
  const unknown = headers.filter((header) => !allowed.has(header));
  if (unknown.length) {
    return `Unknown column${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}`;
  }

  const required = ["name", "purpose"];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) {
    return `Missing required column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`;
  }

  return null;
}

function emailLooksValid(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function enumValue<T extends string>(
  value: string,
  allowed: Set<string>,
  fallback: T,
  label: string
): T {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  if (!allowed.has(normalized)) {
    throw new Error(`Invalid ${label} "${value}".`);
  }
  return normalized as T;
}

export function validateAiSystemCsvRow(
  row: CsvRow,
  rowNumber: number
): { value?: ValidatedAiSystemImport; error?: string } {
  try {
    const name = (row.name || "").trim();
    const purpose = (row.purpose || "").trim();
    const provider = (row.provider || "").trim();
    const ownerName = (row.owner_name || "").trim();
    const ownerEmail = (row.owner_email || "").trim().toLowerCase();

    if (!name) throw new Error("name is required.");
    if (!purpose) throw new Error("purpose is required.");
    if (name.length > 200) throw new Error("name must be 200 characters or fewer.");
    if (provider.length > 200) throw new Error("provider must be 200 characters or fewer.");
    if (!emailLooksValid(ownerEmail)) throw new Error("owner_email is not a valid email address.");

    const lifecycle = enumValue(
      row.lifecycle || "",
      lifecycleValues,
      "production",
      "lifecycle"
    );
    const dataSensitivity = enumValue(
      row.data_sensitivity || "",
      sensitivityValues,
      "none",
      "data_sensitivity"
    );
    const autonomy = enumValue(
      row.autonomy || "",
      autonomyValues,
      "assistive",
      "autonomy"
    );
    const impact = enumValue(
      row.impact || "",
      impactValues,
      "low",
      "impact"
    );

    const humanReview = parseCsvBoolean(row.human_review || "", false);
    const publicInteraction = parseCsvBoolean(
      row.public_interaction || "",
      false
    );
    const generatesContent = parseCsvBoolean(
      row.generates_content || "",
      false
    );

    const reviewDue = (row.review_due || "").trim();
    if (reviewDue && !isIsoDate(reviewDue)) {
      throw new Error("review_due must use YYYY-MM-DD.");
    }

    const priority = scoreGovernancePriority({
      dataSensitivity,
      autonomy,
      impact,
      humanReview,
      publicInteraction,
      generatesContent,
    });

    return {
      value: {
        name,
        provider,
        purpose,
        owner_name: ownerName,
        owner_email: ownerEmail,
        lifecycle,
        data_sensitivity: dataSensitivity,
        autonomy,
        impact,
        human_review: humanReview,
        public_interaction: publicInteraction,
        generates_content: generatesContent,
        review_due: reviewDue || null,
        notes: (row.notes || "").trim() || null,
        priority_score: priority.score,
        priority_level: priority.level,
      },
    };
  } catch (error) {
    return {
      error: `Row ${rowNumber}: ${error instanceof Error ? error.message : "Invalid row."}`,
    };
  }
}

export function duplicateKey(name: string, provider: string) {
  return `${name.trim().toLowerCase()}::${provider.trim().toLowerCase()}`;
}
