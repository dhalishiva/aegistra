import { AI_SYSTEM_CSV_HEADERS, serializeCsv } from "@/lib/csv";

export async function GET() {
  const csv = serializeCsv(AI_SYSTEM_CSV_HEADERS, []);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aegistra-ai-systems-template.csv"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
