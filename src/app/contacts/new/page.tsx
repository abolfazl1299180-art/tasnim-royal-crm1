"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { isIranianMobile, normalizeIranianMobile } from "@/lib/phone";

export default function NewContactPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("phone") || "").trim();

    if (phone && !isIranianMobile(phone)) {
      setError("شماره موبایل باید به شکل 09xxxxxxxxx یا +989xxxxxxxxx باشد.");
      setSaving(false);
      return;
    }

    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    const { data: duplicate } = phone
      ? await s.from("contacts").select("id,first_name,last_name").eq("phone_normalized", normalizeIranianMobile(phone)).maybeSingle()
      : { data: null };

    if (duplicate) {
      setError(`این شماره قبلاً برای «${duplicate.first_name} ${duplicate.last_name}» ثبت شده است.`);
      setSaving(false);
      return;
    }

    const { error } = await s.from("contacts").insert({
      first_name: String(f.get("first_name") || "").trim(),
      last_name: String(f.get("last_name") || "").trim(),
      phone: phone ? normalizeIranianMobile(phone) : null,
      email: String(f.get("email") || "").trim() || null,
      birth_date: f.get("birth_date") || null,
      status: String(f.get("status") || "lead"),
      source: String(f.get("source") || "").trim() || null,
      notes: String(f.get("notes") || "").trim() || null,
      owner_id: user?.id || null,
    });

    if (error) {
      setError(error.code === "23505" ? "این شماره موبایل قبلاً ثبت شده است." : "ثبت مخاطب انجام نشد. اطلاعات و دسترسی را بررسی کنید.");
      setSaving(false);
      return;
    }

    router.push("/contacts");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-black text-amber-600">TASNIM ROYAL CRM</p>
        <h1 className="mt-1 text-2xl font-black">مخاطب جدید</h1>
        <p className="mt-2 text-sm text-slate-500">ایجاد پرونده جدید در بانک اطلاعات</p>
      </div>
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          {[["first_name", "نام"], ["last_name", "نام خانوادگی"], ["phone", "شماره تماس"], ["email", "ایمیل"]].map(([name, label]) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-bold">{label}</span>
              <input name={name} required={name === "first_name" || name === "last_name"} inputMode={name === "phone" ? "tel" : undefined} placeholder={name === "phone" ? "09123456789" : undefined} className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-amber-400" />
            </label>
          ))}
          <label>
            <span className="mb-2 block text-sm font-bold">تاریخ تولد</span>
            <input name="birth_date" type="date" className="w-full rounded-2xl border px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">وضعیت</span>
            <select name="status" defaultValue="lead" className="w-full rounded-2xl border bg-white px-4 py-3">
              <option value="lead">سرنخ</option><option value="active">فعال</option><option value="inactive">غیرفعال</option><option value="customer">مشتری</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">منبع آشنایی</span>
            <input name="source" placeholder="اینستاگرام، معرفی، سایت و..." className="w-full rounded-2xl border px-4 py-3" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold">یادداشت</span>
          <textarea name="notes" rows={4} className="w-full rounded-2xl border px-4 py-3" />
        </label>
        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-2xl border px-5 py-3 text-sm font-bold">انصراف</button>
          <button disabled={saving} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-60">{saving ? "در حال ثبت..." : "ثبت مخاطب"}</button>
        </div>
      </form>
    </div>
  );
}
