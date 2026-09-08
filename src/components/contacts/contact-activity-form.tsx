"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function ContactActivityForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const client = createClient();
    const { data: { user } } = await client.auth.getUser();
    const { error } = await client.from("contact_activities").insert({
      contact_id: contactId,
      user_id: user?.id || null,
      activity_type: String(form.get("activity_type") || "note"),
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim() || null,
    });
    if (error) {
      setError("ثبت فعالیت انجام نشد. ممکن است دسترسی کافی نداشته باشید.");
      setSaving(false);
      return;
    }
    event.currentTarget.reset();
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="activity_type" defaultValue="note" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="note">یادداشت</option>
          <option value="call">تماس</option>
          <option value="meeting">جلسه</option>
          <option value="message">پیام</option>
          <option value="other">سایر</option>
        </select>
        <input name="title" required placeholder="عنوان فعالیت" className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
        <textarea name="description" rows={2} placeholder="توضیح کوتاه" className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-3" />
      </div>
      {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
      <button disabled={saving} className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:opacity-60">{saving ? "در حال ثبت..." : "ثبت فعالیت"}</button>
    </form>
  );
}
