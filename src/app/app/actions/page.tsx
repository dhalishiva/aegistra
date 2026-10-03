import { createActionItem, markActionDone } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { getSessionContext } from "@/lib/workspace";

export default async function Actions() {
  const { supabase, workspace } = await getSessionContext();

  const result = await supabase
    .from("action_items")
    .select("id,title,owner,due_date,status")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const items = result.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="kicker">Workflow</div>
      <h1 className="mt-2 text-3xl font-bold">Governance actions</h1>

      <div className="mt-7 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <form action={createActionItem} className="card h-fit space-y-4 p-5">
          <h2 className="font-bold">Add action</h2>
          <input
            name="title"
            required
            className="input"
            placeholder="Review vendor data retention terms"
          />
          <input name="owner" className="input" placeholder="Owner" />
          <input name="due_date" type="date" className="input" />
          <SubmitButton pendingLabel="Creating…" className="btn-primary w-full">Create action</SubmitButton>
        </form>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="card flex items-center justify-between p-4"
            >
              <div>
                <div
                  className={
                    item.status === "done"
                      ? "text-slate-500 line-through"
                      : "font-medium"
                  }
                >
                  {item.title}
                </div>
                <div className="text-xs text-slate-500">
                  {item.owner || "Unassigned"}
                  {item.due_date ? ` · due ${item.due_date}` : ""}
                </div>
              </div>

              {item.status !== "done" ? (
                <form action={markActionDone}>
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton pendingLabel="Saving…" className="btn-secondary text-sm">Mark done</SubmitButton>
                </form>
              ) : (
                <span className="badge text-emerald-300">Done</span>
              )}
            </div>
          ))}

          {!items.length && (
            <div className="card p-10 text-center text-slate-500">
              No actions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
