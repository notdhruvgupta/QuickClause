"use client";

import { useMemo, useState } from "react";
import {
  parseEmailTable,
  toCsv,
  toHtmlTable,
  toTsv,
} from "@/lib/emailTable";
import CopyButton from "./CopyButton";

export default function EmailTable() {
  const [input, setInput] = useState("");

  const table = useMemo(() => parseEmailTable(input), [input]);
  const html = useMemo(() => toHtmlTable(table), [table]);
  const csv = useMemo(() => toCsv(table), [table]);
  const tsv = useMemo(() => toTsv(table), [table]);

  const colCount = table.headers.length;
  const rowCount = table.rows.length;
  const ready = colCount > 0 && rowCount > 0;

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
            {ready
              ? `Parsed ${rowCount} row${rowCount === 1 ? "" : "s"} × ${colCount} column${
                  colCount === 1 ? "" : "s"
                }.`
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
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white p-4 overflow-auto max-h-80">
            {ready ? (
              <div
                className="email-table-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-neutral-400 text-center py-8">
                Table preview will appear here.
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
