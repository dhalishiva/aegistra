import { createClient } from "@/lib/supabase-server";
import { serializeCsv } from "@/lib/csv";
import { loadAssurancePack, packCsvRows, type CsvDataset } from "@/lib/assurance";
import { buildAssurancePdf } from "@/lib/assurance-pdf";

export const runtime = "nodejs";

const DATASETS: CsvDataset[] = ["register", "reviews", "actions", "evidence"];

function slug(v: string) {
  return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "workspace";
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Authentication required", { status: 401 });

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace:workspaces(id,name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const ws = Array.isArray(membership?.workspace) ? membership?.workspace[0] : membership?.workspace;
  if (!ws) return new Response("Workspace not found", { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "pdf";
  const dataset = (url.searchParams.get("dataset") ?? "register") as CsvDataset;
  if (format === "csv" && !DATASETS.includes(dataset)) return new Response("Unknown dataset", { status: 400 });

  const pack = await loadAssurancePack(supabase, ws);
  if (!pack) return new Response("Could not build the assurance pack", { status: 500 });

  const date = pack.generatedAt.toISOString().slice(0, 10);
  const base = `${slug(ws.name)}-aegistra-assurance`;
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

  if (format === "csv") {
    const { headers: cols, rows } = packCsvRows(pack, dataset);
    return new Response(`﻿${serializeCsv(cols, rows)}`, {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}-${dataset}-${date}.csv"` },
    });
  }

  const pdf = await buildAssurancePdf(pack);
  return new Response(Buffer.from(pdf), {
    headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${base}-${date}.pdf"` },
  });
}
