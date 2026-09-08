"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Contact = { id: string; first_name: string; last_name: string };
type Registration = { id: string; status: string; registered_at: string; course_title: string };

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContact = searchParams.get("contact") || "";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contactId, setContactId] = useState(preselectedContact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .from("contacts")
      .select("id,first_name,last_name")
      .order("first_name")
      .limit(500)
      .then(({ data }) => setContacts(data || []));
  }, []);

  useEffect(() => {
    if (!contactId) {
      setRegistrations([]);
      return;
    }

    let cancelled = false;
    createClient()
      .from("registrations")
      .select("id,status,registered_at,courses(title)")
      .eq("contact_id", contactId)
      .order("registered_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data || []) as Array<{
          id: string;
          status: string;
          registered_at: string;
          courses: { title: string } | { title: string }[] | null;
        }>;
        setRegistrations(
          rows.map((row) => ({
            id: row.id,
            status: row.status,
            registered_at: row.registered_at,
            course_title: Array.isArray(row.courses)
              ? row.courses[0]?.title || "بدون نام دوره"
              : row.courses?.title || "بدون نام دوره",
          })),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [contactId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("payments").insert({
      contact_id: f.get("contact_id") || null,
      registration_id: f.get("registration_id") || null,
      amount: Number(f.get("amount")),
      status: f.get("status"),
      paid_at: f.get("paid_at") || null,
      method: String(f.get("method") || "").trim() || null,
      reference: String(f.get("reference") || "").trim() || null,
      notes: String(f.get("notes") || "").trim() || null,
      created_by: user?.id || null,
    });

    if (error) {
      setError(error.code === "23514" ? "مخاطب و ثبت‌نام انتخاب‌شده با هم سازگار نیستند." : "ثبت پرداخت انجام نشد. ممکن است دسترسی کافی نداشته باشید.");
      setSaving(false);
      return;
    }

    router.push("/payments");
    router.refresh();
  }

  const statusLabel: Record<string, string> = {
    pending: "در انتظار",
    active: "فعال",
    completed: "تکمیل‌شده",
    cancelled: "لغوشده",
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold">مخاطب</span>
          <select name="contact_id" value={contactId} onChange={(e) => setContactId(e.target.value)} className="w-full rounded-2xl border p-3">
            <option value="">بدون مخاطب</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">ثبت‌نام مرتبط</span>
          <select name="registration_id" disabled={!contactId} className="w-full rounded-2xl border p-3 disabled:bg-slate-50">
            <option value="">بدون ثبت‌نام مرتبط</option>
            {registrations.map((r) => <option key={r.id} value={r.id}>{r.course_title} — {statusLabel[r.status] || r.status}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">مبلغ (تومان)</span>
          <input name="amount" type="number" min="1" required className="w-full rounded-2xl border p-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">وضعیت</span>
          <select name="status" defaultValue="paid" className="w-full rounded-2xl border p-3">
            <option value="paid">پرداخت‌شده</option>
            <option value="partial">علی‌الحساب</option>
            <option value="pending">در انتظار</option>
            <option value="cancelled">لغوشده</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">تاریخ پرداخت</span>
          <input name="paid_at" type="datetime-local" className="w-full rounded-2xl border p-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">روش پرداخت</span>
          <input name="method" placeholder="کارت، نقدی، انتقال و..." className="w-full rounded-2xl border p-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">شماره پیگیری</span>
          <input name="reference" className="w-full rounded-2xl border p-3" />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold">یادداشت</span>
        <textarea name="notes" rows={3} className="w-full rounded-2xl border p-3" />
      </label>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-2xl border px-5 py-3 font-bold">انصراف</button>
        <button disabled={saving} className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white">{saving ? "در حال ثبت..." : "ثبت پرداخت"}</button>
      </div>
    </form>
  );
}

export default function NewPaymentPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black">ثبت پرداخت</h1>
      <p className="mt-2 text-sm text-slate-500">ثبت دریافت و مشخصات تراکنش</p>
      <Suspense fallback={<div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">در حال آماده‌سازی فرم…</div>}>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
