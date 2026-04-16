"use client";

import { useState } from "react";
import Tabs from "@/components/Tabs";
import SqlGenerator from "@/components/SqlGenerator";
import Templates from "@/components/Templates";
import Snippets from "@/components/Snippets";
import EmailTable from "@/components/EmailTable";

const TABS = [
  { id: "sql", label: "SQL Clause" },
  { id: "templates", label: "Query Templates" },
  { id: "snippets", label: "Email Snippets" },
  { id: "table", label: "Email Table" },
];

export default function Home() {
  const [active, setActive] = useState<string>("sql");
  const [clause, setClause] = useState<string>("");

  return (
    <div className="min-h-dvh flex-1 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-indigo-600 text-white grid place-items-center text-sm font-bold">
              Q
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none">
                Quickclause
              </h1>
              <p className="text-xs text-neutral-500 leading-none mt-1">
                Paste. Pick. Copy.
              </p>
            </div>
          </div>
          {clause && active !== "sql" && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Clause ready ({clause.length} chars)
            </div>
          )}
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className={active === "sql" ? "" : "hidden"}>
          <SqlGenerator onClauseGenerated={setClause} />
        </div>
        <div className={active === "templates" ? "" : "hidden"}>
          <Templates currentClause={clause} />
        </div>
        <div className={active === "snippets" ? "" : "hidden"}>
          <Snippets />
        </div>
        <div className={active === "table" ? "" : "hidden"}>
          <EmailTable />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-6 text-xs text-neutral-500">
        Data is saved locally in your browser.
      </footer>
    </div>
  );
}
