"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Tag = { id: string; name: string; color: string };

export function ContactTags({ contactId }: { contactId: string }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const client = createClient();
    const [{ data: allTags }, { data: links }] = await Promise.all([
      client.from("tags").select("id,name,color").order("name"),
      client.from("contact_tags").select("tag_id").eq("contact_id", contactId),
    ]);
    setTags((allTags || []) as Tag[]);
    setSelected((links || []).map((row) => String(row.tag_id)));
  }

  useEffect(() => {
    void load();
  }, [contactId]);

  async function toggleTag(tagId: string) {
    setBusy(true); setError("");
    const client = createClient();
    if (selected.includes(tagId)) {
      const { error: removeError } = await client.from("contact_tags").delete().eq("contact_id", contactId).eq("tag_id", tagId);
      if (removeError) setError("حذف تگ انجام نشد.");
      else setSelected((current) => current.filter((id) => id !== tagId));
    } else {
      const { error: addError } = await client.from("contact_tags").insert({ contact_id: contactId, tag_id: tagId });
      if (addError) setError("افزودن تگ انجام نشد.");
      else setSelected((current) => [...current, tagId]);
    }
    setBusy(false);
  }

  async function createTag() {
    const name = newTag.trim();
    if (!name) return;
    setBusy(true); setError("");
    const client = createClient();
    const { data, error: createError } = await client.from("tags").insert({ name }).select("id,name,color").maybeSingle();
    if (createError && createError.code !== "23505") setError("ساخت تگ انجام نشد.");
    else if (data) {
      setTags((current) => [...current, data as Tag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTag("");
      await toggleTag(String(data.id));
      return;
    }
    setBusy(false);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="font-black">برچسب‌ها</h2><span className="text-xs text-slate-400">برای دسته‌بندی و فیلتر</span></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => <button type="button" key={tag.id} disabled={busy} onClick={() => void toggleTag(tag.id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${selected.includes(tag.id) ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}</button>)}
        {!tags.length && <span className="text-sm text-slate-400">هنوز برچسبی ساخته نشده است.</span>}
      </div>
      <div className="mt-5 flex gap-2">
        <input value={newTag} onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void createTag(); } }} placeholder="برچسب جدید" className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" />
        <button type="button" disabled={busy || !newTag.trim()} onClick={() => void createTag()} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">افزودن</button>
      </div>
      {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
    </section>
  );
}
