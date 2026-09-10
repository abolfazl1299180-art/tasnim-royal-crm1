import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";

type Activity = { id: string; title: string; activity_type: string; created_at: string; contacts: { first_name: string | null; last_name: string | null } | { first_name: string | null; last_name: string | null }[] | null };

export default async function Home() {
  const s = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [today, overdue, contacts, courses, pending, activitiesResponse] = await Promise.all([
    s.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending").gte("due_at", start.toISOString()).lt("due_at", end.toISOString()),
    s.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending").lt("due_at", start.toISOString()),
    s.from("contacts").select("id", { count: "exact", head: true }),
    s.from("courses").select("id", { count: "exact", head: true }).eq("is_active", true),
    s.from("payments").select("amount", { count: "exact" }).eq("status", "pending"),
    s.from("contact_activities").select("id,title,activity_type,created_at,contacts(first_name,last_name)").order("created_at", { ascending: false }).limit(6),
  ]);

  const activities = (activitiesResponse.data || []) as unknown as Activity[];
  const pendingAmount = pending.data?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;
  const stats = [
    ["مخاطبین", contacts.count ?? 0, "کل پرونده‌ها", "◎"],
    ["پیگیری امروز", today.count ?? 0, overdue.count ? `${overdue.count.toLocaleString("fa-IR")} پیگیری عقب‌افتاده` : "بدون پیگیری عقب‌افتاده", "↻"],
    ["دوره‌های فعال", courses.count ?? 0, "دوره در حال برگزاری", "▣"],
    ["پرداخت در انتظار", pending.count ?? 0, `${pendingAmount.toLocaleString("fa-IR")} تومان`, "◈"],
  ];
  const modules = [
    ["بانک اطلاعات", "مدیریت مخاطبین، پرونده‌ها و سوابق ارتباطی", "مشاهده مخاطبین", "/contacts", "◎"],
    ["قیف فروش", "سرنخ‌ها را از اولین تماس تا مشتری شدن مدیریت کنید", "مشاهده قیف فروش", "/pipeline", "◫"],
    ["پیگیری‌ها", "تماس‌ها و ارتباطات آینده را منظم و قابل پیگیری نگه دارید", "مدیریت پیگیری‌ها", "/follow-ups", "↻"],
    ["وظایف", "کارهای روزانه تیم را ثبت و اولویت‌بندی کنید", "مشاهده وظایف", "/tasks", "✓"],
    ["دوره‌ها", "دوره‌ها، ظرفیت‌ها و ثبت‌نام‌ها را مدیریت کنید", "مدیریت دوره‌ها", "/courses", "▣"],
    ["پرداخت‌ها", "وضعیت پرداخت‌ها و مبالغ دریافتی را دنبال کنید", "مشاهده پرداخت‌ها", "/payments", "◈"],
  ] as const;

  return (
    <div className="crm-page-enter space-y-7">
      <section className="crm-shimmer relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_20px_60px_-25px_rgba(15,23,42,.45)] md:p-9">
        <div className="crm-float absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="crm-float absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl [animation-delay:1.3s]" />
        <div className="relative crm-animate">
          <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-black tracking-[.18em] text-amber-300">TASNIM ROYAL CRM</span><span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold text-slate-300">پنل مدیریت</span></div>
          <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight md:text-4xl">همه‌چیز برای مدیریت مشتری، فروش و پیگیری در یکجا</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">داشبورد روزانه‌ات را سریع ببین، روی کارهای مهم تمرکز کن و بدون رفت‌وآمد بین چند سیستم تیم را جلو ببر.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/contacts/new" className="crm-shimmer rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 hover:bg-amber-300">+ افزودن مخاطب</Link><Link href="/pipeline" className="crm-shimmer rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:-translate-y-0.5 hover:bg-white/10">مشاهده قیف فروش</Link></div>
        </div>
      </section>

      <section className="crm-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, hint, icon]) => <article key={label} className="crm-hover-lift crm-glow group rounded-[1.6rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_-22px_rgba(15,23,42,.35)]"><div className="flex items-start justify-between"><div className="crm-pulse-soft flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg text-amber-400">{icon}</div><span className="text-[11px] font-bold text-slate-400">KPI</span></div><p className="mt-5 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{Number(value).toLocaleString("fa-IR")}</p><p className="mt-2 text-xs text-slate-400">{hint}</p></article>)}
      </section>

      <section>
        <div className="crm-animate mb-4 flex items-end justify-between"><div><p className="text-[11px] font-black tracking-[.2em] text-amber-600">WORKSPACE</p><h3 className="mt-1 text-2xl font-black tracking-tight">دسترسی سریع</h3></div><Link href="/reports" className="text-xs font-black text-slate-500 hover:text-amber-600">گزارش‌ها ←</Link></div>
        <div className="crm-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map(([title, description, action, href, icon]) => <Link href={href} key={title} className="crm-hover-lift crm-glow group rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-22px_rgba(15,23,42,.3)] hover:border-amber-200"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-lg font-black text-amber-700 transition duration-300 group-hover:rotate-3 group-hover:scale-105">{icon}</div><span className="text-xl text-slate-200 transition duration-300 group-hover:-translate-x-1 group-hover:text-amber-500">←</span></div><h4 className="mt-5 text-lg font-black">{title}</h4><p className="mt-2 min-h-14 text-sm leading-7 text-slate-500">{description}</p><p className="mt-5 text-sm font-black text-slate-950 transition group-hover:translate-x-0.5 group-hover:text-amber-600">{action}</p></Link>)}</div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><article className="crm-hover-lift crm-glow rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-22px_rgba(15,23,42,.3)]"><div className="flex items-center justify-between"><div><p className="text-[11px] font-black tracking-[.18em] text-slate-400">TIMELINE</p><h3 className="mt-1 text-xl font-black">فعالیت‌های اخیر</h3></div><Link href="/contacts" className="text-xs font-black text-slate-500 hover:text-amber-600">مشاهده بانک اطلاعات ←</Link></div><div className="mt-5 space-y-3">{activities.map((item, index) => { const contact = Array.isArray(item.contacts) ? item.contacts[0] : item.contacts; return <div key={item.id} className="crm-fade flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md" style={{ animationDelay: `${index * 70}ms` }}><div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-white text-center pt-2 text-sm font-black text-amber-600 shadow-sm">•</div><div className="min-w-0"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{contact ? `${contact.first_name || ""} ${contact.last_name || ""}` : "مخاطب نامشخص"} · {new Date(item.created_at).toLocaleString("fa-IR")}</p></div></div>; })}{!activities.length && <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</div>}</div></article><article className="crm-hover-lift crm-glow rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_-22px_rgba(15,23,42,.3)]"><p className="text-[11px] font-black tracking-[.18em] text-amber-600">QUICK ACTIONS</p><h3 className="mt-1 text-xl font-black">اقدام سریع</h3><div className="mt-5"><DashboardActions/></div></article></section>
    </div>
  );
}
