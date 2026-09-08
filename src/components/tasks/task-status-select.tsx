"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const options = [
  ["todo", "انجام‌نشده"],
  ["in_progress", "در حال انجام"],
  ["done", "انجام‌شده"],
  ["cancelled", "لغوشده"],
] as const;

export function TaskStatusSelect({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(value: string) {
    setStatus(value);
    setSaving(true);
    setError("");
    const { error: updateError } = await createClient().from("tasks").update({ status: value }).eq("id", id);
    if (updateError) {
      setStatus(initialStatus);
      setError("خطا");
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select value={status} disabled={saving} onChange={(e) => change(e.target.value)} aria-label="وضعیت وظیفه" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-amber-400">
        {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {error && <span className="text-[11px] font-bold text-red-600">{error}</span>}
    </div>
  );
}
