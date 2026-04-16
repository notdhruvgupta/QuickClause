"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import CopyButton from "./CopyButton";

type Snippet = {
  id: string;
  name: string;
  body: string;
  copyCount: number;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Snippets() {
  const [snippets, setSnippets] = useLocalStorage<Snippet[]>(
    "productivity.snippets",
    []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const sorted = useMemo(
    () => [...snippets].sort((a, b) => b.copyCount - a.copyCount),
    [snippets]
  );

  function startAdd() {
    setShowAdd(true);
    setEditingId(null);
    setDraftName("");
    setDraftBody("");
  }

  function startEdit(s: Snippet) {
    setEditingId(s.id);
    setShowAdd(false);
    setDraftName(s.name);
    setDraftBody(s.body);
  }

  function save() {
    const name = draftName.trim() || "Untitled snippet";
    const body = draftBody;
    if (!body.trim()) {
      cancel();
      return;
    }
    if (editingId) {
      setSnippets((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, name, body } : s))
      );
    } else {
      setSnippets((prev) => [
        ...prev,
        { id: makeId(), name, body, copyCount: 0 },
      ]);
    }
    cancel();
  }

  function cancel() {
    setShowAdd(false);
    setEditingId(null);
    setDraftName("");
    setDraftBody("");
  }

  function remove(id: string) {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  function bumpCount(id: string) {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, copyCount: s.copyCount + 1 } : s))
    );
  }

  const Editor = (
    <div className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-900/60">
      <input
        type="text"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        placeholder="Snippet name (e.g. Pending order reply)"
        className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
      />
      <textarea
        value={draftBody}
        onChange={(e) => setDraftBody(e.target.value)}
        placeholder="Paste the email content you want to reuse…"
        className="w-full h-40 resize-y rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
      />
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
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Sorted by how often you&apos;ve copied each snippet.
        </p>
        {!showAdd && !editingId && (
          <button
            type="button"
            onClick={startAdd}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            + Add snippet
          </button>
        )}
      </div>

      {showAdd && Editor}

      {sorted.length === 0 && !showAdd && (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-sm text-neutral-500">
          No snippets yet. Add frequently used email responses to speed up
          replies.
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((s) => {
          const isEditing = editingId === s.id;
          return (
            <li
              key={s.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            >
              {isEditing ? (
                <div className="p-3">{Editor}</div>
              ) : (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {s.name}
                      </h4>
                      <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {s.copyCount} {s.copyCount === 1 ? "copy" : "copies"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <CopyButton
                        value={s.body}
                        onCopy={() => bumpCount(s.id)}
                      />
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-rose-600 hover:border-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap break-words rounded-md bg-neutral-50 dark:bg-neutral-900 p-3 text-sm text-neutral-800 dark:text-neutral-200 max-h-48 overflow-auto">
{s.body}
                  </pre>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
