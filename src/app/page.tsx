import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";

export default async function Home() {
  const s = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [today, overdue, contacts, courses, pending, activities] = await Promise.all([
    s.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending").gte("due_at", start.toISOString()).lt("due_at", end.toISOString()),
    s.from("follow_ups").select("id", { count: "exact", head: true }).eq("status", "pending").lt("due_at", start.toISOString()),
    s.from("contacts").select("id", { count: "exact", head: true }),
    s.from("courses").select("id", { count: "exact", head: true }).eq("is_active", true),
    s.from("payments").select("amount", { count: "exact" }).eq("status", "pending"),
    s.from("contact_activities").select("id,title,activity_type,created_at,contacts(first_name,last_name)").order("created_at", { ascending: false }).limit(6),
  ]);

  const pendingAmount = pending.data?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;
  const stats = [
    ["مخاطبین", contacts.count ?? 0, "کل پرونده‌ها"],
    ["پیگیری امروز", today.count ?? 0, overdue.count ? `${overdue.count.toLocaleString("fa-IR")} پیگیری عقب‌افتاده` : "بدون پیگیری عقب‌افتاده"],
    ["دوره‌های فعال", courses.count ?? 0, "دوره در حال برگزاری"],
    ["پرداخت در انتظار", pending.count ?? 0, `${pendingAmount.toLocaleString("fa-IR")} تومان`],
  ];
  const modules = [
    ["بانک اطلاعات", "مدیریت مخاطبین، پرونده‌ها و سوابق ارتباطی", "مشاهده مخاطبین", "/contacts"],
    ["پیگیری‌ها", "پیگیری تماس‌ها، سرنخ‌ها و ارتباطات آینده", "مدیریت پیگیری‌ها", "/follow-ups"],
    ["وظایف", "کارهای روزانه تیم را ثبت و اولویت‌بندی کنید", "مشاهده وظایف", "/tasks"],
    ["دوره‌ها", "دوره‌ها، ظرفیت‌ها و ثبت‌نام‌ها را مدیریت کنید", "مدیریت دوره‌ها", "/courses"],
    ["پرداخت‌ها", "وضعیت پرداخت‌ها و مبالغ دریافتی را دنبال کنید", "مشاهده پرداخت‌ها", "/payments"],
    ["گزارش‌ها", "نمای مدیریتی از عملکرد و فعالیت‌های مجموعه", "مشاهده گزارش‌ها", "/reports"],
  ] as const;

  return (
    <div>
      <section className="mb-8 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <span className="inline-flex rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">TASNIM ROYAL CRM</span>
        <h2 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">مدیریت یکپارچه ارتباط با مشتری</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">همه اطلاعات، پیگیری‌ها، وظایف، دوره‌ها و پرداخت‌ها را در یک محیط منظم و ساده مدیریت کنید.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, hint]) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{Number(value).toLocaleString("fa-IR")}</p>
            <p className="mt-2 text-xs text-slate-400">{hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4"><p className="text-xs font-bold text-amber-600">MODULES</p><h3 className="mt-1 text-xl font-black">بخش‌های اصلی CRM</h3></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(([title, description, action, href]) => (
            <article key={title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg font-black text-amber-600">{title.slice(0, 1)}</div>
              <h4 className="text-lg font-black">{title}</h4>
              <p className="mt-2 min-h-14 text-sm leading-7 text-slate-500">{description}</p>
              <Link href={href} className="mt-5 inline-block text-sm font-black text-slate-950 transition group-hover:text-amber-600">{action} ←</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black">فعالیت‌های اخیر</h3>
          <div className="mt-5 space-y-3">
            {activities?.map((item) => {
              const contact = Array.isArray(item.contacts) ? item.contacts[0] : item.contacts;
              return (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{contact ? `${contact.first_name || ""} ${contact.last_name || ""}` : "مخاطب نامشخص"} · {new Date(item.created_at).toLocaleString("fa-IR")}</p>
                </div>
              );
            })}
            {!activities?.length && <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</div>}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-black">اقدام سریع</h3><DashboardActions/></article>
      </section>
    </div>
  );
}
