"use client";

import { useMemo, useState } from "react";
import { columnValues, parseInput, toSqlClause } from "@/lib/parser";
import CopyButton from "./CopyButton";

type Props = {
  onClauseGenerated: (clause: string) => void;
};

export default function SqlGenerator({ onClauseGenerated }: Props) {
  const [input, setInput] = useState("");
  const [colIndex, setColIndex] = useState(0);

  const table = useMemo(() => parseInput(input), [input]);

  const safeColIndex =
    table.headers.length === 0
      ? 0
      : Math.min(colIndex, table.headers.length - 1);

  const values = useMemo(
    () => columnValues(table, safeColIndex),
    [table, safeColIndex]
  );

  const clause = useMemo(() => toSqlClause(values), [values]);

  const formatLabel: Record<typeof table.format, string> = {
    empty: "Paste data to begin",
    tabular: "Tabular data detected",
    stacked: "Stacked pairs detected",
    single: "Single column detected",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Paste your data
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
          placeholder="Paste tab-separated rows, CSV-like tables, or stacked key/value pairs here…"
          spellCheck={false}
          className="w-full h-80 resize-y rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <p className="text-xs text-neutral-500">{formatLabel[table.format]}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            SQL clause
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">
              {values.length} value{values.length === 1 ? "" : "s"}
            </span>
            <CopyButton
              value={clause}
              disabled={values.length === 0}
              onCopy={() => onClauseGenerated(clause)}
            />
          </div>
        </div>
        <pre className="w-full min-h-32 max-h-80 overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap break-all">
{values.length === 0 ? "(no values)" : clause}
        </pre>

        {table.headers.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Choose a column
            </div>
            <div className="flex flex-wrap gap-1.5">
              {table.headers.map((h, i) => {
                const isActive = i === safeColIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColIndex(i)}
                    className={[
                      "rounded-md px-2.5 py-1 text-xs font-medium border",
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400",
                    ].join(" ")}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {table.rows.length > 0 && (
        <section className="lg:col-span-2 space-y-2">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Preview ({table.rows.length} row{table.rows.length === 1 ? "" : "s"})
          </div>
          <div className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 max-h-80">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 sticky top-0">
                <tr>
                  {table.headers.map((h, i) => (
                    <th
                      key={i}
                      onClick={() => setColIndex(i)}
                      className={[
                        "text-left font-medium px-3 py-2 whitespace-nowrap cursor-pointer select-none",
                        i === safeColIndex
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "",
                      ].join(" ")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, ri) => (
                  <tr
                    key={ri}
                    className="border-t border-neutral-100 dark:border-neutral-800 odd:bg-white dark:odd:bg-neutral-950 even:bg-neutral-50 dark:even:bg-neutral-900/60"
                  >
                    {table.headers.map((_, ci) => (
                      <td
                        key={ci}
                        className={[
                          "px-3 py-1.5 font-mono whitespace-nowrap",
                          ci === safeColIndex
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-neutral-800 dark:text-neutral-200",
                        ].join(" ")}
                      >
                        {r[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
