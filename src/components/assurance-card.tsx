import { FileDown, FileSpreadsheet } from "lucide-react";

const datasets = [
  ["register", "Register"],
  ["reviews", "Reviews"],
  ["actions", "Actions"],
  ["evidence", "Evidence"],
] as const;

export function AssuranceCard() {
  return (
    <section className="card mt-7 p-5">
      <h2 className="font-bold">Assurance pack</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
        One document for customers, auditors or your board: the register, priorities, owners, review history, open
        actions and evidence for every AI system. Download the PDF to share, or the CSV files to work with the data.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href="/api/assurance?format=pdf" className="btn-primary gap-2" download>
          <FileDown size={16} aria-hidden="true" />
          Download PDF
        </a>
        <span className="text-xs text-slate-500">or CSV:</span>
        {datasets.map(([key, name]) => (
          <a key={key} href={`/api/assurance?format=csv&dataset=${key}`} className="btn-secondary gap-2 px-3 py-2 text-sm" download>
            <FileSpreadsheet size={14} aria-hidden="true" />
            {name}
          </a>
        ))}
      </div>
    </section>
  );
}
