"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const stages = [
  ["new", "سرنخ جدید"],
  ["contacted", "تماس گرفته شد"],
  ["qualified", "واجد شرایط"],
  ["proposal", "پیشنهاد / مذاکره"],
  ["won", "برنده / مشتری"],
  ["lost", "از دست رفته"],
] as const;

export function PipelineStageSelect({ id, value }: { id: string; value: string }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function changeStage(next: string) {
    if (next === value) return;
    setSaving(true);
    const { error } = await createClient().from("contacts").update({ sales_stage: next }).eq("id", id);
    setSaving(false);
    if (!error) router.refresh();
  }

  return <select aria-label="مرحله فروش" disabled={saving} value={value} onChange={(event) => void changeStage(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><option value="new">سرنخ جدید</option>{stages.slice(1).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>;
}
