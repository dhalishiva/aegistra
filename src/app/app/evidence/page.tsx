import Link from "next/link";
import { Download, FileText, LockKeyhole, Trash2, Upload } from "lucide-react";
import { deleteEvidence, uploadEvidence } from "@/lib/actions";
import { getSessionContext } from "@/lib/workspace";

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function Evidence() {
  const { supabase, workspace } = await getSessionContext();

  const [systemsResult, evidenceResult] = await Promise.all([
    supabase
      .from("ai_systems")
      .select("id,name,priority_level,owner_name,review_due")
      .eq("workspace_id", workspace.id)
      .order("name"),
    supabase
      .from("evidence_items")
      .select(
        "id,ai_system_id,title,evidence_type,storage_path,file_name,mime_type,file_size,notes,valid_until,created_at"
      )
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
  ]);

  const systems = systemsResult.data ?? [];
  const evidence = evidenceResult.data ?? [];
  const systemNames = new Map(systems.map((system) => [system.id, system.name]));

  const evidenceWithLinks = await Promise.all(
    evidence.map(async (item) => {
      if (!item.storage_path) return { ...item, signedUrl: null };

      const { data } = await supabase.storage
        .from("evidence")
        .createSignedUrl(item.storage_path, 60 * 60);

      return { ...item, signedUrl: data?.signedUrl ?? null };
    })
  );

  const stats = [
    ["Registered systems", systems.length],
    ["Evidence files", evidence.length],
    ["With review date", systems.filter((system) => system.review_due).length],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="kicker">Evidence</div>
      <h1 className="mt-2 text-3xl font-bold">Assurance evidence</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Store the documents that support reviews, vendor checks, decisions and
        customer-assurance responses. Files are private to workspace members.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div className="card p-5" key={label}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <form action={uploadEvidence} className="card h-fit space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-sky-400/10 p-2 text-sky-300">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="font-bold">Upload evidence</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                PDF, PNG, JPG, TXT, CSV, Word or Excel · max 15 MB
              </p>
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              name="title"
              className="input"
              required
              placeholder="Vendor AI security assessment"
            />
          </div>

          <div>
            <label className="label">Related AI system</label>
            <select name="ai_system_id" className="input" defaultValue="">
              <option value="">General workspace evidence</option>
              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">File</label>
            <input
              name="file"
              type="file"
              required
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-sky-400/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-200"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.doc,.docx,.xls,.xlsx"
            />
          </div>

          <div>
            <label className="label">Valid until</label>
            <input name="valid_until" type="date" className="input" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              className="input min-h-24"
              placeholder="What this evidence proves, source, scope or limitations…"
            />
          </div>

          <button className="btn-primary w-full">Upload evidence</button>

          <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-slate-500">
            <LockKeyhole size={15} className="mt-0.5 shrink-0 text-sky-300" />
            Files are stored in a private Supabase bucket. Download links are
            signed and expire after one hour.
          </div>
        </form>

        <section className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Evidence library</h2>
              <p className="mt-1 text-sm text-slate-500">
                {evidence.length} file{evidence.length === 1 ? "" : "s"} stored
              </p>
            </div>
            <Link href="/app/activity" className="text-sm text-sky-300">
              View activity
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {evidenceWithLinks.length ? (
              evidenceWithLinks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="shrink-0 text-sky-300" />
                        <div className="truncate font-semibold">{item.title}</div>
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {item.file_name || "Evidence file"} ·{" "}
                        {formatBytes(item.file_size)}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {item.signedUrl && (
                        <a
                          href={item.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary gap-2 px-3 py-2 text-xs"
                        >
                          <Download size={14} />
                          Open
                        </a>
                      )}
                      <form action={deleteEvidence}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:text-red-300"
                          aria-label={`Delete ${item.title}`}
                          title="Delete evidence"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <div>
                      <span className="text-slate-600">System:</span>{" "}
                      {item.ai_system_id
                        ? systemNames.get(item.ai_system_id) || "Unknown"
                        : "General"}
                    </div>
                    <div>
                      <span className="text-slate-600">Uploaded:</span>{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-slate-600">Valid until:</span>{" "}
                      {item.valid_until || "Not set"}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-3 border-t border-white/5 pt-3 text-sm leading-6 text-slate-400">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-slate-500">
                Upload your first evidence file to start building an assurance
                trail.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
