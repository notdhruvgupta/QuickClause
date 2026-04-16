"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseEmailTable,
  toCsv,
  toHtmlTable,
  toTsv,
  type EmailTable as EmailTableData,
} from "@/lib/emailTable";
import CopyButton from "./CopyButton";

export default function EmailTable() {
  const [input, setInput] = useState("");
  const [hidden, setHidden] = useState<Set<number>>(new Set());

  const table = useMemo(() => parseEmailTable(input), [input]);

  // Reset hidden columns whenever the parsed header structure changes,
  // since the old indices no longer line up.
  const headerKey = table.headers.join("\u0001");
  useEffect(() => {
    setHidden(new Set());
  }, [headerKey]);

  const effective: EmailTableData = useMemo(() => {
    if (hidden.size === 0) return table;
    const keep: number[] = [];
    for (let i = 0; i < table.headers.length; i++) {
      if (!hidden.has(i)) keep.push(i);
    }
    return {
      headers: keep.map((i) => table.headers[i]),
      rows: table.rows.map((r) => keep.map((i) => r[i] ?? "")),
    };
  }, [table, hidden]);

  const html = useMemo(() => toHtmlTable(effective), [effective]);
  const csv = useMemo(() => toCsv(effective), [effective]);
  const tsv = useMemo(() => toTsv(effective), [effective]);

  const parsedColCount = table.headers.length;
  const parsedRowCount = table.rows.length;
  const effectiveColCount = effective.headers.length;
  const ready = effectiveColCount > 0 && parsedRowCount > 0;

  function toggleCol(i: number) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Paste messy table data
            </label>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the stacked rows as copied from your tool — headers on top, then row number + values per line."
            spellCheck={false}
            className="w-full h-80 resize-y rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-xs text-neutral-500">
            {parsedColCount > 0 && parsedRowCount > 0
              ? `Parsed ${parsedRowCount} row${parsedRowCount === 1 ? "" : "s"} × ${effectiveColCount} of ${parsedColCount} column${
                  parsedColCount === 1 ? "" : "s"
                }${hidden.size > 0 ? ` (${hidden.size} hidden)` : ""}.`
              : "Waiting for parseable input…"}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Copy formatted table
            </label>
            <div className="flex items-center gap-2">
              <CopyButton
                value={tsv}
                html={html}
                label="Copy as Table"
                disabled={!ready}
              />
              <CopyButton
                value={csv}
                label="Copy CSV"
                disabled={!ready}
                className="bg-neutral-900! dark:bg-neutral-100! text-white! dark:text-neutral-900! hover:bg-neutral-800!"
              />
            </div>
          </div>

          {parsedColCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-neutral-500 mr-1">
                Columns — click to toggle:
              </span>
              {table.headers.map((h, i) => {
                const isHidden = hidden.has(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleCol(i)}
                    title={isHidden ? "Show column" : "Hide column"}
                    className={[
                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition",
                      isHidden
                        ? "border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:border-neutral-500 line-through"
                        : "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:border-neutral-400",
                    ].join(" ")}
                  >
                    <span>{h || `Column ${i + 1}`}</span>
                    <span className="text-neutral-400 text-[11px] leading-none">
                      {isHidden ? "+" : "×"}
                    </span>
                  </button>
                );
              })}
              {hidden.size > 0 && (
                <button
                  type="button"
                  onClick={() => setHidden(new Set())}
                  className="ml-2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline-offset-2 hover:underline"
                >
                  Restore all
                </button>
              )}
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white p-4 overflow-auto max-h-80">
            {ready ? (
              <div
                className="email-table-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-neutral-400 text-center py-8">
                {parsedColCount > 0
                  ? "All columns hidden. Restore one to preview."
                  : "Table preview will appear here."}
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            <strong>Copy as Table</strong> writes rich HTML to your clipboard —
            paste into Gmail, Outlook, or Word to get a formatted table.
          </p>
        </section>
      </div>

      {ready && (
        <section className="space-y-2">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            CSV preview
          </div>
          <pre className="w-full max-h-60 overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs font-mono text-neutral-900 dark:text-neutral-100 whitespace-pre">
{csv}
          </pre>
        </section>
      )}
    </div>
  );
}
