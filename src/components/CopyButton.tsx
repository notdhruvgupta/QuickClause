"use client";

import { useState } from "react";

type Props = {
  value: string;
  html?: string;
  label?: string;
  onCopy?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function CopyButton({
  value,
  html,
  label = "Copy",
  onCopy,
  disabled,
  className = "",
}: Props) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function copy() {
    if (disabled || !value) return;
    try {
      const canRich =
        !!html &&
        typeof ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function";

      if (canRich) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html!], { type: "text/html" }),
            "text/plain": new Blob([value], { type: "text/plain" }),
          }),
        ]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setState("ok");
      onCopy?.();
    } catch {
      setState("err");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const color =
    state === "ok"
      ? "bg-emerald-600 text-white"
      : state === "err"
      ? "bg-rose-600 text-white"
      : "bg-indigo-600 text-white hover:bg-indigo-500";

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      className={`${base} ${color} ${className}`}
    >
      {state === "ok" ? "Copied" : state === "err" ? "Failed" : label}
    </button>
  );
}
