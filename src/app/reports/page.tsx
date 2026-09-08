import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function ReportsPage() {
  const supabase = await createClient();
  const [contacts, followUps, tasks, payments, courses, registrations, paidRows] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
    supabase.from("payments").select("amount,status"),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("registrations").select("id", { count: "exact", head: true }).in("status", ["pending", "active"]),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);
  const paid = paidRows.data?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;
  const pendingAmount = payments.data?.filter(row => row.status === "pending" || row.status === "partial").reduce((sum, row) => sum + Number(row.amount), 0) || 0;
  const cards = [
    ["کل مخاطبین", (contacts.count ?? 0).toLocaleString("fa-IR")],
    ["پیگیری‌های باز", (followUps.count ?? 0).toLocaleString("fa-IR")],
    ["وظایف باز", (tasks.count ?? 0).toLocaleString("fa-IR")],
    ["دریافت قطعی", `${paid.toLocaleString("fa-IR")} تومان`],
    ["دوره‌های فعال", (courses.count ?? 0).toLocaleString("fa-IR")],
    ["ثبت‌نام‌های جاری", (registrations.count ?? 0).toLocaleString("fa-IR")],
    ["دریافت در انتظار", `${pendingAmount.toLocaleString("fa-IR")} تومان`],
  ];
  return <><PageHeader title="گزارش‌ها" description="نمای مدیریتی از عملکرد CRM" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></article>)}</div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">نمای مالی</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">پرداخت قطعی</span><b>{paid.toLocaleString("fa-IR")} تومان</b></div><div className="flex justify-between"><span className="text-slate-500">مبالغ در انتظار / علی‌الحساب</span><b>{pendingAmount.toLocaleString("fa-IR")} تومان</b></div></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">نمای عملیاتی</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">دوره‌های فعال</span><b>{courses.count ?? 0}</b></div><div className="flex justify-between"><span className="text-slate-500">ثبت‌نام‌های جاری</span><b>{registrations.count ?? 0}</b></div></div></section></div></>;
}
