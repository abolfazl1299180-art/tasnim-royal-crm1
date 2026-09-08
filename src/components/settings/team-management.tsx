"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Role = "admin" | "manager" | "sales" | "support" | "viewer";
type Profile = { id: string; username: string; full_name: string; role: Role; is_active: boolean };

const roleLabels: Record<Role, string> = { admin: "مدیر", manager: "مدیر اجرایی", sales: "فروش", support: "پشتیبانی", viewer: "مشاهده‌گر" };

export function TeamManagement({ currentUserId }: { currentUserId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    createClient().from("profiles").select("id,username,full_name,role,is_active").order("created_at").then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) setError("دریافت کاربران تیم انجام نشد.");
      setProfiles((data || []) as Profile[]);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  async function updateProfile(id: string, patch: Partial<Pick<Profile, "role" | "is_active">>) {
    setSavingId(id); setError("");
    const { data, error: updateError } = await createClient().from("profiles").update(patch).eq("id", id).select("id,username,full_name,role,is_active").maybeSingle();
    if (updateError || !data) { setError(updateError?.message || "تغییر کاربر انجام نشد."); setSavingId(null); return; }
    setProfiles((current) => current.map((profile) => profile.id === id ? data as Profile : profile));
    setSavingId(null);
  }

  if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">در حال بارگذاری کاربران…</div>;

  return (
    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="font-black">اعضای تیم</h2>
      <p className="mt-1 text-sm text-slate-500">تغییر نقش و وضعیت کاربران موجود؛ ایجاد حساب Auth از این صفحه انجام نمی‌شود.</p>
      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
      <div className="mt-5 space-y-3">
        {profiles.map((profile) => {
          const locked = profile.id === currentUserId;
          const busy = savingId === profile.id;
          return <div key={profile.id} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_180px_140px] md:items-center">
            <div><p className="font-black">{profile.full_name || profile.username}</p><p className="mt-1 text-xs text-slate-400" dir="ltr">{profile.username}</p></div>
            <label><span className="mb-1 block text-xs font-bold text-slate-400">نقش</span><select disabled={locked || busy} value={profile.role} onChange={(event) => void updateProfile(profile.id, { role: event.target.value as Role })} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="flex items-center gap-2 pt-5 text-sm font-bold"><input type="checkbox" disabled={locked || busy} checked={profile.is_active} onChange={(event) => void updateProfile(profile.id, { is_active: event.target.checked })} className="h-4 w-4" />کاربر فعال{locked && <span className="text-xs font-normal text-slate-400">(حساب فعلی)</span>}</label>
          </div>;
        })}
        {!profiles.length && <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">کاربر دیگری ثبت نشده است.</p>}
      </div>
    </section>
  );
}
