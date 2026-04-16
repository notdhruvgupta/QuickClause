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
  // Strip trailing tabs/spaces per line so "1\t" collapses to "1".
  const lines = rawLines.map((l) => l.replace(/[\t ]+$/g, ""));

  // Stacked A: groups of 2 non-empty lines separated by blank lines.
  const groups: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (current.length) {
        groups.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length) groups.push(current);

  if (groups.length >= 2 && groups.every((g) => g.length === 2)) {
    return {
      headers: ["ID", "Value"],
      rows: groups.map((g) => [g[0].trim(), g[1].trim()]),
      format: "stacked",
    };
  }

  const nonEmpty = lines.filter((l) => l !== "");
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [], format: "empty" };
  }

  // Stacked B: alternating ID / Value rows with no blank separators.
  // Only when no line looks multi-column and odd-positioned lines are numeric.
  const anyLineIsMultiCol = nonEmpty.some(
    (l) => l.includes("\t") || /\S\s{2,}\S/.test(l)
  );
  if (
    !anyLineIsMultiCol &&
    nonEmpty.length >= 4 &&
    nonEmpty.length % 2 === 0
  ) {
    const ids: string[] = [];
    const vals: string[] = [];
    for (let i = 0; i < nonEmpty.length; i += 2) {
      ids.push(nonEmpty[i].trim());
      vals.push(nonEmpty[i + 1].trim());
    }
    const allIdsNumeric = ids.every((s) => /^\d+$/.test(s));
    if (allIdsNumeric) {
      return {
        headers: ["ID", "Value"],
        rows: ids.map((id, i) => [id, vals[i]]),
        format: "stacked",
      };
    }
  }

  // Tabular
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
