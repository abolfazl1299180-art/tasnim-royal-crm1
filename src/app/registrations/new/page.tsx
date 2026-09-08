"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Contact = { id: string; first_name: string; last_name: string };
type Course = { id: string; title: string; price: number };

function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourse = searchParams.get("course") || "";
  const preselectedContact = searchParams.get("contact") || "";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = createClient();
    Promise.all([
      s.from("contacts").select("id,first_name,last_name").order("first_name").limit(500),
      s.from("courses").select("id,title,price").eq("is_active", true).order("title"),
    ]).then(([a, b]) => {
      setContacts(a.data || []);
      setCourses((b.data || []) as Course[]);
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().from("registrations").insert({
      course_id: f.get("course_id"),
      contact_id: f.get("contact_id"),
      status: f.get("status"),
      notes: String(f.get("notes") || "").trim() || null,
    });

    if (error) {
      if (error.code === "23505") setError("این مخاطب قبلاً در این دوره ثبت‌نام شده است.");
      else if (error.code === "23514") setError("ظرفیت این دوره تکمیل شده است.");
      else setError("ثبت‌نام انجام نشد.");
      setSaving(false);
      return;
    }

    router.push("/registrations");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <label>
          <span className="mb-2 block text-sm font-bold">مخاطب</span>
          <select name="contact_id" required defaultValue={preselectedContact} className="w-full rounded-2xl border p-3">
            <option value="">انتخاب مخاطب</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">دوره</span>
          <select name="course_id" required defaultValue={preselectedCourse} className="w-full rounded-2xl border p-3">
            <option value="">انتخاب دوره</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title} — {Number(c.price).toLocaleString("fa-IR")} تومان</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">وضعیت</span>
          <select name="status" defaultValue="pending" className="w-full rounded-2xl border p-3">
            <option value="pending">در انتظار</option>
            <option value="active">فعال</option>
            <option value="completed">تکمیل‌شده</option>
            <option value="cancelled">لغوشده</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">یادداشت</span>
          <textarea name="notes" rows={3} className="w-full rounded-2xl border p-3" />
        </label>
      </div>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-2xl border px-5 py-3 font-bold">انصراف</button>
        <button disabled={saving} className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white">{saving ? "در حال ثبت..." : "ثبت‌نام"}</button>
      </div>
    </form>
  );
}

export default function NewRegistrationPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black">ثبت‌نام جدید</h1>
      <p className="mt-2 text-sm text-slate-500">اتصال یک مخاطب به یک دوره</p>
      <Suspense fallback={<div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">در حال آماده‌سازی فرم…</div>}>
        <RegistrationForm />
      </Suspense>
    </div>
  );
}
