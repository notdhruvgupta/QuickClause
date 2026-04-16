export type ParsedTable = {
  headers: string[];
  rows: string[][];
  format: "tabular" | "stacked" | "single" | "empty";
};

export function parseInput(input: string): ParsedTable {
  if (!input || !input.trim()) {
    return { headers: [], rows: [], format: "empty" };
  }

  const rawLines = input.replace(/\r\n?/g, "\n").split("\n");

  // Detect stacked format: groups of 2 non-empty lines separated by blank lines.
  const groups: string[][] = [];
  let current: string[] = [];
  for (const line of rawLines) {
    if (line.trim() === "") {
      if (current.length) {
        groups.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length) groups.push(current);

  const isStacked =
    groups.length >= 2 && groups.every((g) => g.length === 2);

  if (isStacked) {
    return {
      headers: ["ID", "Value"],
      rows: groups.map((g) => [g[0].trim(), g[1].trim()]),
      format: "stacked",
    };
  }

  const nonEmpty = rawLines.filter((l) => l.trim() !== "");
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [], format: "empty" };
  }

  const hasTabs = nonEmpty.some((l) => l.includes("\t"));
  const splitLine = (line: string): string[] => {
    if (hasTabs) return line.split("\t").map((s) => s.trim());
    return line
      .split(/\s{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const parsed = nonEmpty.map(splitLine);
  const maxCols = Math.max(...parsed.map((r) => r.length));

  if (maxCols <= 1) {
    return {
      headers: ["Value"],
      rows: nonEmpty.map((l) => [l.trim()]),
      format: "single",
    };
  }

  const normalized = parsed.map((r) => {
    const padded = r.slice();
    while (padded.length < maxCols) padded.push("");
    return padded;
  });

  const headers = normalized[0].map((h, i) => h || `Column ${i + 1}`);
  const rows = normalized.slice(1);
  return { headers, rows, format: "tabular" };
}

export function columnValues(table: ParsedTable, colIndex: number): string[] {
  return table.rows
    .map((r) => (r[colIndex] ?? "").trim())
    .filter((v) => v.length > 0);
}

export function toSqlClause(values: string[]): string {
  const cleaned = values
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map((v) => `"${v.replace(/"/g, '""')}"`);
  return `(${cleaned.join(",")})`;
}
