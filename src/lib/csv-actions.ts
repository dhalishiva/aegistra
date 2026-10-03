"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "./workspace";
import { parseCsv } from "./csv";
import {
  type CsvImportState,
  duplicateKey,
  validateAiSystemCsvRow,
  validateCsvHeaders,
} from "./csv-import";

const planLimits: Record<string, number> = {
  free: 3,
  team: 50,
  business: 100000,
  enterprise: 100000,
};

export async function importAiSystemsCsv(
  _previousState: CsvImportState,
  formData: FormData
): Promise<CsvImportState> {
  const { supabase, user, workspace, membership } = await getSessionContext();

  if (membership.role === "viewer") {
    return {
      ok: false,
      error: "Viewers have read-only access and cannot import AI systems.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: "Choose a CSV file to import.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return {
      ok: false,
      error: "CSV files must be 2 MB or smaller.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return {
      ok: false,
      error: "Aegistra imports .csv files only.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  let parsed: ReturnType<typeof parseCsv>;

  try {
    parsed = parseCsv(await file.text());
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not parse the CSV file.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  const headerError = validateCsvHeaders(parsed.headers);
  if (headerError) {
    return {
      ok: false,
      error: headerError,
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  if (!parsed.rows.length) {
    return {
      ok: false,
      error: "The CSV file does not contain any data rows.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  if (parsed.rows.length > 500) {
    return {
      ok: false,
      error: "Import up to 500 systems at a time.",
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  const validationErrors: string[] = [];
  const validated = [];

  parsed.rows.forEach((row, index) => {
    const result = validateAiSystemCsvRow(row, index + 2);
    if (result.error) {
      validationErrors.push(result.error);
    } else if (result.value) {
      validated.push(result.value);
    }
  });

  if (validationErrors.length) {
    return {
      ok: false,
      error: `Fix ${validationErrors.length} validation error${validationErrors.length === 1 ? "" : "s"} and import again.`,
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: validationErrors.slice(0, 25),
    };
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("ai_systems")
    .select("name,provider")
    .eq("workspace_id", workspace.id)
    .limit(5000);

  if (existingError) {
    return {
      ok: false,
      error: existingError.message,
      imported: 0,
      skippedDuplicates: 0,
      validationErrors: [],
    };
  }

  const existingKeys = new Set(
    (existingRows ?? []).map((row) =>
      duplicateKey(row.name, row.provider || "")
    )
  );

  const fileKeys = new Set<string>();
  let skippedDuplicates = 0;

  const uniqueRows = validated.filter((row) => {
    const key = duplicateKey(row.name, row.provider);

    if (existingKeys.has(key) || fileKeys.has(key)) {
      skippedDuplicates += 1;
      return false;
    }

    fileKeys.add(key);
    return true;
  });

  const { count, error: countError } = await supabase
    .from("ai_systems")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  if (countError) {
    return {
      ok: false,
      error: countError.message,
      imported: 0,
      skippedDuplicates,
      validationErrors: [],
    };
  }

  const limit = planLimits[workspace.plan] ?? 3;
  const remaining = Math.max(0, limit - (count ?? 0));

  if (uniqueRows.length > remaining) {
    return {
      ok: false,
      error: `This CSV contains ${uniqueRows.length} new system${uniqueRows.length === 1 ? "" : "s"}, but your ${workspace.plan} plan has room for ${remaining} more.`,
      imported: 0,
      skippedDuplicates,
      validationErrors: [],
    };
  }

  if (!uniqueRows.length) {
    return {
      ok: true,
      error: null,
      imported: 0,
      skippedDuplicates,
      validationErrors: [],
    };
  }

  const payload = uniqueRows.map((row) => ({
    ...row,
    workspace_id: workspace.id,
    created_by: user.id,
  }));

  const { error: insertError } = await supabase.from("ai_systems").insert(payload);

  if (insertError) {
    return {
      ok: false,
      error: insertError.message,
      imported: 0,
      skippedDuplicates,
      validationErrors: [],
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/systems");
  revalidatePath("/app/activity");

  return {
    ok: true,
    error: null,
    imported: uniqueRows.length,
    skippedDuplicates,
    validationErrors: [],
  };
}
