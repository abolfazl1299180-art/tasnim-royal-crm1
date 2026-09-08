"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function ContactTags({ contactId }: { contactId: string }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const client = createClient();

    Promise.all([
      client.from("tags").select("id,name,color").order("name"),
      client
        .from("contact_tags")
        .select("tag_id")
        .eq("contact_id", contactId),
    ]).then(([tagsResult, linksResult]) => {
      if (cancelled) return;
      setTags((tagsResult.data ?? []) as Tag[]);
      setSelected(
        (linksResult.data ?? []).map((row) => String(row.tag_id)),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [contactId]);

  async function toggleTag(tagId: string) {
    setBusy(true);
    setError("");
    const client = createClient();

    if (selected.includes(tagId)) {
      const { error: deleteError } = await client
        .from("contact_tags")
        .delete()
        .eq("contact_id", contactId)
        .eq("tag_id", tagId);

      if (deleteError) {
        setError("حذف تگ انجام نشد.");
      } else {
        setSelected((current) => current.filter((id) => id !== tagId));
      }
    } else {
      const { error: insertError } = await client
        .from("contact_tags")
        .insert({ contact_id: contactId, tag_id: tagId });

      if (insertError) {
        setError("افزودن تگ انجام نشد.");
      } else {
        setSelected((current) => [...current, tagId]);
      }
    }

    setBusy(false);
  }

  async function createTag() {
    const name = newTag.trim();
    if (!name) return;

    setBusy(true);
    setError("");
    const client = createClient();

    let tag: Tag | null = null;
    const { data, error: insertError } = await client
      .from("tags")
      .insert({ name })
      .select("id,name,color")
      .maybeSingle();

    if (data) {
      tag = data as Tag;
    } else if (insertError?.code === "23505") {
      const { data: existing } = await client
        .from("tags")
        .select("id,name,color")
        .eq("name", name)
        .maybeSingle();
      if (existing) tag = existing as Tag;
    } else {
      setError("ساخت تگ انجام نشد.");
      setBusy(false);
      return;
    }

    if (tag) {
      const currentTag = tag;
      setTags((current) => {
        if (current.some((item) => item.id === currentTag.id)) return current;
        return [...current, currentTag].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      const { error: linkError } = await client
        .from("contact_tags")
        .upsert(
          { contact_id: contactId, tag_id: currentTag.id },
          { onConflict: "contact_id,tag_id", ignoreDuplicates: true },
        );

      if (linkError) {
        setError("تگ ساخته شد اما به این مخاطب وصل نشد.");
      } else {
        setSelected((current) =>
          current.includes(currentTag.id) ? current : [...current, currentTag.id],
        );
        setNewTag("");
      }
    }

    setBusy(false);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-black">برچسب‌ها</h2>
        <span className="text-xs text-slate-400">دسته‌بندی سریع مخاطب</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            disabled={busy}
            onClick={() => void toggleTag(tag.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              selected.includes(tag.id)
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {tag.name}
          </button>
        ))}
        {!tags.length && (
          <span className="text-sm text-slate-400">
            هنوز برچسبی ساخته نشده است.
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          placeholder="برچسب جدید"
          className="min-w-0 flex-1 rounded-2xl border px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={busy || !newTag.trim()}
          onClick={() => void createTag()}
          className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
        >
          افزودن
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs font-bold text-red-600">{error}</p>
      )}
    </section>
  );
}
