"use client";

import { ChangeEvent, useActionState, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { importAiSystemsCsv } from "@/lib/csv-actions";
import { parseCsv } from "@/lib/csv";
import {
  csvImportInitialState,
  duplicateKey,
  validateCsvHeaders,
} from "@/lib/csv-import";

type Preview = {
  fileName: string;
  rowCount: number;
  sampleNames: string[];
  duplicateRows: number;
  error: string | null;
};

export function SystemsCsvTools({ canImport }: { canImport: boolean }) {
  const [state, formAction, pending] = useActionState(
    importAiSystemsCsv,
    csvImportInitialState
  );
  const [preview, setPreview] = useState<Preview | null>(null);

  async function previewFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreview(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setPreview({
        fileName: file.name,
        rowCount: 0,
        sampleNames: [],
        duplicateRows: 0,
        error: "Choose a .csv file.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPreview({
        fileName: file.name,
        rowCount: 0,
        sampleNames: [],
        duplicateRows: 0,
        error: "CSV files must be 2 MB or smaller.",
      });
      return;
    }

    try {
      const parsed = parseCsv(await file.text());
      const headerError = validateCsvHeaders(parsed.headers);
      const keys = new Set<string>();
      let duplicateRows = 0;

      for (const row of parsed.rows) {
        const name = (row.name || "").trim();
        const provider = (row.provider || "").trim();
        if (!name) continue;
        const key = duplicateKey(name, provider);
        if (keys.has(key)) duplicateRows += 1;
        else keys.add(key);
      }

      setPreview({
        fileName: file.name,
        rowCount: parsed.rows.length,
        sampleNames: parsed.rows
          .map((row) => (row.name || "").trim())
          .filter(Boolean)
          .slice(0, 3),
        duplicateRows,
        error: headerError,
      });
    } catch (error) {
      setPreview({
        fileName: file.name,
        rowCount: 0,
        sampleNames: [],
        duplicateRows: 0,
        error:
          error instanceof Error ? error.message : "Could not parse this CSV.",
      });
    }
  }

  return (
    <div className="card mt-6 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-300" />
            <h2 className="font-bold">CSV import & export</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Move an existing AI inventory into Aegistra or export the current
            register for backup and offline review.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/api/systems/template"
              className="btn-secondary gap-2 px-3 py-2 text-sm"
            >
              <Download size={15} />
              Download template
            </a>
            <a
              href="/api/systems/export"
              className="btn-secondary gap-2 px-3 py-2 text-sm"
            >
              <Download size={15} />
              Export workspace
            </a>
          </div>
        </div>

        {canImport ? (
          <form
            action={formAction}
            className="w-full max-w-xl rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div>
              <label className="label">Import CSV</label>
              <input
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
                onChange={previewFile}
                className="input file:mr-3 file:rounded-md file:border-0 file:bg-sky-400/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-200"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Up to 500 rows and 2 MB per import. Existing name + provider
                combinations are skipped.
              </p>
            </div>

            {preview && (
              <div
                className={
                  preview.error
                    ? "mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3"
                    : "mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-3"
                }
              >
                <div className="flex items-start gap-2">
                  {preview.error ? (
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-300"
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />
                  )}
                  <div className="min-w-0 text-xs leading-5">
                    <div className="truncate font-semibold text-slate-300">
                      {preview.fileName}
                    </div>
                    {preview.error ? (
                      <div className="mt-1 text-amber-200">{preview.error}</div>
                    ) : (
                      <>
                        <div className="mt-1 text-slate-500">
                          {preview.rowCount} data row
                          {preview.rowCount === 1 ? "" : "s"}
                          {preview.duplicateRows
                            ? ` · ${preview.duplicateRows} duplicate row${preview.duplicateRows === 1 ? "" : "s"} in file`
                            : ""}
                        </div>
                        {preview.sampleNames.length > 0 && (
                          <div className="mt-1 truncate text-slate-500">
                            Sample: {preview.sampleNames.join(", ")}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-200">
                {state.error}
                {state.validationErrors.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                    {state.validationErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {state.ok && (
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3 text-sm text-emerald-200">
                Imported {state.imported} system
                {state.imported === 1 ? "" : "s"}.
                {state.skippedDuplicates > 0 &&
                  ` Skipped ${state.skippedDuplicates} duplicate${state.skippedDuplicates === 1 ? "" : "s"}.`}
              </div>
            )}

            <button
              disabled={pending || !preview || Boolean(preview.error)}
              className="btn-primary mt-4 w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              {pending ? "Importing…" : "Import validated CSV"}
            </button>
          </form>
        ) : (
          <div className="max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-slate-500">
            Your Viewer role is read-only. You can export the register, but only
            owners, admins and members can import systems.
          </div>
        )}
      </div>
    </div>
  );
}
