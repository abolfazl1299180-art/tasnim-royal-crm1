import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const tableLabels: Record<string, string> = { contacts: "مخاطبین", follow_ups: "پیگیری‌ها", tasks: "وظایف", registrations: "ثبت‌نام‌ها", payments: "پرداخت‌ها" };
const actionLabels: Record<string, string> = { insert: "ایجاد", update: "ویرایش", delete: "حذف" };

type Audit = { id: string; table_name: string; action: string; record_id: string | null; created_at: string; profiles: { username: string; full_name: string } | { username: string; full_name: string }[] | null };

export default async function AuditPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("audit_logs").select("id,table_name,action,record_id,created_at,profiles(username,full_name)").order("created_at", { ascending: false }).limit(150);
  const rows = (data || []) as unknown as Audit[];
  return <div><div className="mb-6"><p className="text-xs font-black text-amber-600">AUDIT LOG</p><h1 className="mt-1 text-2xl font-black">تاریخچه تغییرات سیستم</h1><p className="mt-2 text-sm text-slate-500">ثبت می‌شود چه کسی و چه زمانی اطلاعات اصلی CRM را ایجاد، ویرایش یا حذف کرده است.</p></div><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">کاربر</th><th>عملیات</th><th>ماژول</th><th>شناسه رکورد</th><th>زمان</th></tr></thead><tbody>{rows.map((row) => { const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles; return <tr key={row.id} className="border-t border-slate-100"><td className="px-5 py-4 font-bold">{profile?.full_name || profile?.username || "سیستم"}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{actionLabels[row.action] || row.action}</span></td><td>{tableLabels[row.table_name] || row.table_name}</td><td className="max-w-[230px] truncate font-mono text-xs text-slate-400">{row.record_id || "—"}</td><td>{new Date(row.created_at).toLocaleString("fa-IR")}</td></tr>; })}</tbody></table></div>{!rows.length && <div className="p-12 text-center text-sm text-slate-400">هنوز رویدادی ثبت نشده است.</div>}</div><Link href="/" className="mt-5 inline-block text-sm font-bold text-amber-600">بازگشت به داشبورد ←</Link></div>;
}
