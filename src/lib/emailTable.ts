export type EmailTable = {
  headers: string[];
  rows: string[][];
};

const ROW_MARKER = /^\d+$/;

function normalizeValue(raw: string): string {
  let v = raw.trim();
  // Homoglyphs sometimes used to obscure NULL in copied data.
  v = v.replace(/[\u039D\u041D]/g, "N"); // Greek Nu, Cyrillic En
  v = v.replace(/[\u22C3]/g, "U"); // N-ary Union
  // ISO datetime: 2026-04-15T17:36:15 -> 2026-04-15 17:36:15
  v = v.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)$/,
    "$1 $2"
  );
  return v;
}

export function parseEmailTable(input: string): EmailTable {
  if (!input || !input.trim()) return { headers: [], rows: [] };

  const raw = input.replace(/\r\n?/g, "\n").split("\n");
  const cleaned = raw
    .map((l) => l.replace(/^\s+|\s+$/g, ""))
    .filter((l) => l.length > 0);
  if (cleaned.length === 0) return { headers: [], rows: [] };

  // Prefer marker-based parsing: find the first line that is a pure positive integer.
  const markerIdx = cleaned.findIndex((l) => ROW_MARKER.test(l));

  if (markerIdx > 0) {
    const headers = cleaned.slice(0, markerIdx);
    const H = headers.length;
    const data = cleaned.slice(markerIdx);
    const rows: string[][] = [];
    for (let i = 0; i < data.length; i += H + 1) {
      const chunk = data.slice(i, i + H + 1);
      if (chunk.length <= 1) break;
      const values = chunk.slice(1).map(normalizeValue);
      while (values.length < H) values.push("");
      rows.push(values);
    }
    return { headers, rows };
  }

  // Fallback: single-column list
  return {
    headers: ["Value"],
    rows: cleaned.map((v) => [normalizeValue(v)]),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TABLE_STYLE =
  "border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#111827;border:1px solid #d1d5db;";
const TH_STYLE =
  "text-align:left;padding:8px 12px;border:1px solid #d1d5db;background:#f3f4f6;font-weight:600;color:#111827;white-space:nowrap;";
const TD_STYLE =
  "text-align:left;padding:8px 12px;border:1px solid #d1d5db;color:#1f2937;white-space:nowrap;";
const ROW_EVEN = "background:#ffffff;";
const ROW_ODD = "background:#f9fafb;";

export function toHtmlTable(t: EmailTable): string {
  if (t.headers.length === 0) return "";
  const headRow = `<tr>${t.headers
    .map((h) => `<th style="${TH_STYLE}">${escapeHtml(h)}</th>`)
    .join("")}</tr>`;
  const bodyRows = t.rows
    .map((r, i) => {
      const cells = r
        .map((c) => `<td style="${TD_STYLE}">${escapeHtml(c)}</td>`)
        .join("");
      return `<tr style="${i % 2 === 0 ? ROW_EVEN : ROW_ODD}">${cells}</tr>`;
    })
    .join("");
  return `<table cellpadding="0" cellspacing="0" border="0" style="${TABLE_STYLE}"><thead>${headRow}</thead><tbody>${bodyRows}</tbody></table>`;
}

export function toCsv(t: EmailTable): string {
  const q = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const lines = [t.headers.map(q).join(",")];
  for (const r of t.rows) lines.push(r.map(q).join(","));
  return lines.join("\n");
}

export function toTsv(t: EmailTable): string {
  const lines = [t.headers.join("\t")];
  for (const r of t.rows) lines.push(r.join("\t"));
  return lines.join("\n");
}
