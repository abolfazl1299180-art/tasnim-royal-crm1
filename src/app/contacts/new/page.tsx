"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function NewContactPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("contacts").insert({
      first_name: String(form.get("first_name") || "").trim(),
      last_name: String(form.get("last_name") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
      email: String(form.get("email") || "").trim() || null,
      status: String(form.get("status") || "lead"),
      source: String(form.get("source") || "").trim() || null,
      notes: String(form.get("notes") || "").trim() || null,
    });
    if (insertError) {
      setError("ثبت مخاطب انجام نشد. اطلاعات و دسترسی را بررسی کنید.");
      setSaving(false);
      return;
    }
    router.push("/contacts");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-7"><p className="text-xs font-black text-amber-600">TASNIM ROYAL CRM</p><h1 className="mt-1 text-2xl font-black">مخاطب جدید</h1><p className="mt-2 text-sm text-slate-500">ایجاد پرونده جدید در بانک اطلاعات</p></div>
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          {[["first_name","نام"],["last_name","نام خانوادگی"],["phone","شماره تماس"],["email","ایمیل"]].map(([name,label]) => <label key={name} className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input name={name} required={name === "first_name" || name === "last_name"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>)}
          <label className="block"><span className="mb-2 block text-sm font-bold">وضعیت</span><select name="status" defaultValue="lead" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"><option value="lead">سرنخ</option><option value="active">فعال</option><option value="inactive">غیرفعال</option><option value="customer">مشتری</option></select></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">منبع آشنایی</span><input name="source" placeholder="اینستاگرام، معرفی، سایت و..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
        </div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-bold">یادداشت</span><textarea name="notes" rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold">انصراف</button><button disabled={saving} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-60">{saving ? "در حال ثبت..." : "ثبت مخاطب"}</button></div>
      </form>
    </div>
  );
}
