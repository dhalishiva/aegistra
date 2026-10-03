import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { explainGovernancePriority } from "./scoring";
import { packStats, type AssurancePack, type PackSystem } from "./assurance";

const W = 595.28, H = 841.89, M = 48;
const INK = rgb(0.07, 0.1, 0.2), MUTED = rgb(0.4, 0.44, 0.53), LINE = rgb(0.82, 0.85, 0.9), ACCENT = rgb(0.17, 0.3, 0.95);
const LEVEL = { high: rgb(0.78, 0.15, 0.15), medium: rgb(0.78, 0.5, 0.05), low: rgb(0.1, 0.5, 0.3) } as const;

// Standard PDF fonts only cover Latin-1; anything else becomes "?" instead of crashing.
const clean = (v: unknown) => String(v ?? "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/\u2026/g, "...").replace(/\u2022/g, "-").replace(/[\r\t]+/g, " ").replace(/[^\n\x20-\x7e\xa0-\xff]/g, "?");
const label = (v: string | null | undefined) => (v ? v.replace(/_/g, " ") : "-");

export async function buildAssurancePdf(pack: AssurancePack): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`AI governance assurance pack - ${pack.workspaceName}`);
  doc.setProducer("Aegistra");
  doc.setCreator("Aegistra");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;

  const wrap = (text: string, font: PDFFont, size: number, width: number) => {
    const out: string[] = [];
    for (const para of clean(text).split("\n")) {
      let line = "";
      for (const word of para.split(" ")) {
        let w = word;
        while (font.widthOfTextAtSize(w, size) > width) { // break very long tokens (URLs)
          let cut = w.length;
          while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > width) cut--;
          if (line) { out.push(line); line = ""; }
          out.push(w.slice(0, cut)); w = w.slice(cut);
        }
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) <= width) line = test; else { if (line) out.push(line); line = w; }
      }
      out.push(line);
    }
    return out;
  };
  const ensure = (need: number) => { if (y - need < M + 14) { page = doc.addPage([W, H]); y = H - M; } };
  const text = (t: string, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; width?: number; gap?: number } = {}) => {
    const size = o.size ?? 10, font = o.font ?? regular, x = o.x ?? M, width = o.width ?? W - M - x;
    for (const l of wrap(t, font, size, width)) {
      ensure(size + 3);
      page.drawText(l, { x, y: y - size, size, font, color: o.color ?? INK });
      y -= size * 1.35;
    }
    y -= o.gap ?? 0;
  };
  const rule = () => { ensure(10); page.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.6, color: LINE }); y -= 12; };
  const heading = (t: string) => { ensure(40); y -= 8; text(t, { size: 14, font: bold, gap: 2 }); rule(); };

  // Cover
  page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: ACCENT });
  y -= 30;
  text("AI governance assurance pack", { size: 26, font: bold, gap: 6 });
  text(pack.workspaceName, { size: 16, color: ACCENT, gap: 10 });
  text(`Generated ${pack.generatedAt.toISOString().slice(0, 10)} from the Aegistra register`, { color: MUTED, gap: 14 });
  text("This pack summarises the AI systems an organisation has recorded, who owns them, when they were last reviewed and what evidence supports them. Governance-priority scores are a review-ordering signal. They are not a legal risk classification, certification or statement of regulatory compliance. The figures reflect what the workspace has entered and have not been independently verified.", { color: MUTED, gap: 10 });

  const st = packStats(pack);
  heading("Summary");
  const rows: [string, string][] = [
    ["AI systems in the register", String(st.systems)],
    ["Governance priority: high / medium / low", `${st.high} / ${st.medium} / ${st.low}`],
    ["Reviews overdue", String(st.overdue)],
    ["Systems without a named owner", String(st.noOwner)],
    ["Open actions (overdue)", `${st.openActions} (${st.overdueActions})`],
    ["Evidence items (expired)", `${st.evidence} (${st.expiredEvidence})`],
    ["Systems with no evidence attached", String(st.withoutEvidence)],
  ];
  for (const [k, v] of rows) { ensure(16); page.drawText(clean(k), { x: M, y: y - 10, size: 10, font: regular, color: INK }); page.drawText(clean(v), { x: W - M - bold.widthOfTextAtSize(clean(v), 10), y: y - 10, size: 10, font: bold, color: INK }); y -= 16; }

  // Register overview
  heading("Register overview");
  if (!pack.systems.length) text("No AI systems have been recorded yet.", { color: MUTED });
  const cols = [M, M + 190, M + 260, M + 350, M + 420];
  ensure(20);
  ["System", "Priority", "Owner", "Last review", "Next review"].forEach((h, i) => page.drawText(h, { x: cols[i], y: y - 9, size: 8.5, font: bold, color: MUTED }));
  y -= 16;
  const now = pack.generatedAt.toISOString().slice(0, 10);
  for (const s of pack.systems) {
    ensure(16);
    const lvl = (s.priority_level as keyof typeof LEVEL) in LEVEL ? (s.priority_level as keyof typeof LEVEL) : "low";
    const cut = (t: string, w: number, f = regular) => { let o = clean(t); while (o.length > 1 && f.widthOfTextAtSize(o, 9) > w) o = o.slice(0, -2); return o === clean(t) ? o : `${o}...`; };
    page.drawText(cut(s.name, 180), { x: cols[0], y: y - 9, size: 9, font: bold, color: INK });
    page.drawText(`${s.priority_score} ${lvl}`, { x: cols[1], y: y - 9, size: 9, font: bold, color: LEVEL[lvl] });
    page.drawText(cut(s.owner_name || s.owner_email || "Unassigned", 85), { x: cols[2], y: y - 9, size: 9, font: regular, color: s.owner_name || s.owner_email ? INK : LEVEL.high });
    page.drawText(s.last_reviewed ?? "Never", { x: cols[3], y: y - 9, size: 9, font: regular, color: INK });
    page.drawText(s.review_due ? (s.review_due < now ? `${s.review_due} (overdue)` : s.review_due) : "Not set", { x: cols[4], y: y - 9, size: 9, font: regular, color: s.review_due && s.review_due < now ? LEVEL.high : INK });
    y -= 15;
  }

  // Per-system detail
  const detail = (s: PackSystem) => {
    page = doc.addPage([W, H]); y = H - M;
    text(s.name, { size: 18, font: bold, gap: 2 });
    text(`${label(s.lifecycle)}  |  Provider: ${s.provider || "-"}`, { color: MUTED, gap: 6 });
    text(s.purpose, { gap: 8 });
    const ex = explainGovernancePriority({
      dataSensitivity: s.data_sensitivity as never, autonomy: s.autonomy as never, impact: s.impact as never,
      humanReview: s.human_review, publicInteraction: s.public_interaction, generatesContent: s.generates_content,
    });
    text(`Governance priority ${ex.score}/100 (${ex.level})`, { font: bold, size: 11, color: LEVEL[ex.level], gap: 2 });
    text(`Data: ${label(s.data_sensitivity)} +${ex.parts.data}   Autonomy: ${label(s.autonomy)} +${ex.parts.autonomy}   Impact: ${label(s.impact)} +${ex.parts.impact}   No human review +${ex.parts.review}   Public interaction +${ex.parts.publicInteraction}   Generates content +${ex.parts.generatesContent}`, { size: 9, color: MUTED, gap: 8 });
    text(`Owner: ${s.owner_name || "Unassigned"}${s.owner_email ? ` <${s.owner_email}>` : ""}`, { gap: 0 });
    text(`Last reviewed: ${s.last_reviewed ?? "Never"}    Next review due: ${s.review_due ?? "Not set"}`, { gap: 4 });
    if (s.notes) text(`Notes: ${s.notes}`, { color: MUTED, gap: 4 });

    const reviews = pack.reviews.filter((r) => r.ai_system_id === s.id).slice(0, 5);
    heading("Review history");
    if (!reviews.length) text("No reviews recorded.", { color: MUTED });
    for (const r of reviews) text(`${r.reviewed_at.slice(0, 10)}  ${label(r.outcome)}${r.notes ? `: ${r.notes}` : ""}`, { size: 9.5, gap: 2 });

    const actions = pack.actions.filter((a) => a.ai_system_id === s.id);
    heading("Actions");
    if (!actions.length) text("No actions recorded.", { color: MUTED });
    for (const a of actions) text(`[${label(a.status)}] ${a.title}${a.owner ? ` - ${a.owner}` : ""}${a.due_date ? ` - due ${a.due_date}` : ""}`, { size: 9.5, gap: 2 });

    const ev = pack.evidence.filter((e) => e.ai_system_id === s.id);
    heading("Evidence");
    if (!ev.length) text("No evidence attached.", { color: MUTED });
    for (const e of ev) text(`${e.title} (${label(e.evidence_type)}${e.file_name ? `, ${e.file_name}` : ""})${e.valid_until ? ` - valid until ${e.valid_until}${e.valid_until < now ? " (expired)" : ""}` : ""}`, { size: 9.5, gap: 2 });
  };
  pack.systems.forEach(detail);

  // Footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(clean(`Aegistra assurance pack - ${pack.workspaceName} - ${now}`), { x: M, y: 24, size: 8, font: regular, color: MUTED });
    const n = `Page ${i + 1} of ${pages.length}`;
    p.drawText(n, { x: W - M - regular.widthOfTextAtSize(n, 8), y: 24, size: 8, font: regular, color: MUTED });
  });
  return doc.save();
}
