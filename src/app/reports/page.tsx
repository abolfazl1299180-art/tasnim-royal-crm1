import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function ReportsPage() {
  const supabase = await createClient();
  const [contacts, followUps, tasks, payments] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);
  const paid = payments.data?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;
  const cards = [
    ["کل مخاطبین", contacts.count ?? 0],
    ["پیگیری‌های باز", followUps.count ?? 0],
    ["وظایف باز", tasks.count ?? 0],
    ["دریافت قطعی", `${paid.toLocaleString("fa-IR")} تومان`],
  ];
  return <><PageHeader title="گزارش‌ها" description="نمای مدیریتی از عملکرد CRM" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></article>)}</div><div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">وضعیت سیستم</h2><p className="mt-3 text-sm leading-7 text-slate-500">این بخش در ادامه با فیلترهای زمانی، نمودارها و خروجی گزارش تکمیل می‌شود.</p></div></>;
}
