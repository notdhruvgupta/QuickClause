"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import CopyButton from "./CopyButton";

export const PLACEHOLDER = "<<replace>>";

type Template = {
  id: string;
  name: string;
  body: string;
};

type Props = {
  currentClause: string;
};

const SAMPLE: Template[] = [
  {
    id: "sample",
    name: "Example — order lookup",
    body: `select o.orderno, o.externorderno, ob.obcode, ob.status, t.status, t.errordesc
from transmitdetail t
join obdelivery ob on ob.obcode = t.key1
join orders o on o.orderno = ob.orderno
where o.orderno in ${PLACEHOLDER}
and t.intcode = 'mp_pack';`,
  },
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Templates({ currentClause }: Props) {
  const [templates, setTemplates] = useLocalStorage<Template[]>(
    "productivity.templates",
    SAMPLE
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null
  );
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  );

  const filled = useMemo(() => {
    if (!selected) return "";
    if (!currentClause) return selected.body;
    return selected.body.split(PLACEHOLDER).join(currentClause);
  }, [selected, currentClause]);

  const hasPlaceholder = selected?.body.includes(PLACEHOLDER) ?? false;

  function startNew() {
    setEditing(true);
    setDraftName("");
    setDraftBody(`-- your query here\nwhere some_col in ${PLACEHOLDER}`);
    setSelectedId(null);
  }

  function startEdit() {
    if (!selected) return;
    setEditing(true);
    setDraftName(selected.name);
    setDraftBody(selected.body);
  }

  function save() {
    const name = draftName.trim() || "Untitled template";
    const body = draftBody;
    if (!body.trim()) {
      setEditing(false);
      return;
    }
    if (selected) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === selected.id ? { ...t, name, body } : t))
      );
    } else {
      const id = makeId();
      setTemplates((prev) => [...prev, { id, name, body }]);
      setSelectedId(id);
    }
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  function remove(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) {
      const remaining = templates.filter((t) => t.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Templates
          </h3>
          <button
            type="button"
            onClick={startNew}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-2 py-1 text-xs font-medium hover:opacity-90"
          >
            + New
          </button>
        </div>
        <ul className="space-y-1">
          {templates.length === 0 && (
            <li className="text-xs text-neutral-500 py-2">
              No templates yet. Create one to get started.
            </li>
          )}
          {templates.map((t) => {
            const isActive = t.id === selectedId && !editing;
            return (
              <li key={t.id}>
                <div
                  className={[
                    "group flex items-center justify-between gap-1 rounded-md border px-2.5 py-2 text-sm cursor-pointer",
                    isActive
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400",
                  ].join(" ")}
                  onClick={() => {
                    setSelectedId(t.id);
                    setEditing(false);
                  }}
                >
                  <span className="truncate">{t.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(t.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity text-xs"
                    aria-label={`Delete ${t.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="space-y-4">
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Template name"
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder={`Use ${PLACEHOLDER} where the SQL clause should be inserted.`}
              spellCheck={false}
              className="w-full h-72 resize-y rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <p className="text-xs text-neutral-500">
              Insert{" "}
              <code className="font-mono px-1 rounded bg-neutral-100 dark:bg-neutral-800">
                {PLACEHOLDER}
              </code>{" "}
              where the generated clause should go.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                className="rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selected ? (
          <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {selected.name}
                </h3>
                {!hasPlaceholder && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    no {PLACEHOLDER}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                >
                  Edit
                </button>
                <CopyButton value={filled} disabled={!filled.trim()} />
              </div>
            </div>

            <div>
              <div className="text-xs text-neutral-500 mb-1">
                {currentClause
                  ? `Replacing ${PLACEHOLDER} with the last generated clause.`
                  : `Generate a clause on the SQL Clause tab — then ${PLACEHOLDER} will be filled automatically.`}
              </div>
              <pre className="w-full min-h-48 max-h-[60vh] overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap break-words">
{filled}
              </pre>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500">
            Select or create a template to get started.
          </div>
        )}
      </section>
    </div>
  );
}
