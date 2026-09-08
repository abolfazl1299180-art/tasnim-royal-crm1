import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = { lead: "سرنخ", active: "فعال", inactive: "غیرفعال", customer: "مشتری" };

export default async function ContactProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: contact }, { data: activities }, { data: followUps }, { data: registrations }, { data: payments }] = await Promise.all([
    supabase.from("contacts").select("id,first_name,last_name,phone,email,birth_date,status,source,notes,created_at").eq("id", id).maybeSingle(),
    supabase.from("contact_activities").select("id,activity_type,title,description,created_at").eq("contact_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("follow_ups").select("id,title,due_at,status,notes").eq("contact_id", id).order("due_at", { ascending: true }).limit(10),
    supabase.from("registrations").select("id,status,registered_at,notes,courses(title,start_date)").eq("contact_id", id).order("registered_at", { ascending: false }).limit(10),
    supabase.from("payments").select("id,amount,status,paid_at,method,reference").eq("contact_id", id).order("created_at", { ascending: false }).limit(10),
  ]);
  if (!contact) notFound();
  const paidTotal = payments?.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return <div>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><Link href="/contacts" className="text-sm font-bold text-amber-600">← بازگشت به بانک اطلاعات</Link><h1 className="mt-3 text-3xl font-black">{contact.first_name} {contact.last_name}</h1><p className="mt-2 text-sm text-slate-500">پرونده مخاطب</p></div><span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">{statusLabels[contact.status] || contact.status}</span></div>
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">اطلاعات تماس</h2><div className="mt-5 space-y-4 text-sm"><p><span className="text-slate-400">موبایل:</span> {contact.phone || "—"}</p><p><span className="text-slate-400">ایمیل:</span> {contact.email || "—"}</p><p><span className="text-slate-400">تولد:</span> {contact.birth_date ? new Date(contact.birth_date).toLocaleDateString("fa-IR") : "—"}</p><p><span className="text-slate-400">منبع:</span> {contact.source || "—"}</p></div>{contact.notes && <div className="mt-6 border-t pt-5"><p className="text-xs font-bold text-slate-400">یادداشت</p><p className="mt-2 text-sm leading-7">{contact.notes}</p></div>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-black">پیگیری‌ها</h2><Link href="/follow-ups" className="text-xs font-bold text-amber-600">مدیریت پیگیری‌ها</Link></div>{followUps?.length ? <div className="mt-4 space-y-3">{followUps.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><b>{item.title}</b><span className="text-xs text-slate-400">{new Date(item.due_at).toLocaleString("fa-IR")}</span></div><p className="mt-2 text-xs text-slate-500">{item.status}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-400">پیگیری‌ای ثبت نشده است.</p>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="font-black">دوره‌ها و ثبت‌نام‌ها</h2>{registrations?.length ? <div className="mt-4 space-y-3">{registrations.map((item) => <div key={item.id} className="flex justify-between rounded-2xl bg-slate-50 p-4"><div><b>{Array.isArray(item.courses) ? "دوره" : item.courses?.title || "دوره"}</b><p className="mt-1 text-xs text-slate-500">{item.status}</p></div><span className="text-xs text-slate-400">{new Date(item.registered_at).toLocaleDateString("fa-IR")}</span></div>)}</div> : <p className="mt-5 text-sm text-slate-400">ثبت‌نامی وجود ندارد.</p>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">مالی</h2><p className="mt-4 text-xs text-slate-400">پرداخت‌های قطعی</p><p className="mt-1 text-2xl font-black">{paidTotal.toLocaleString("fa-IR")} <span className="text-xs">تومان</span></p><div className="mt-4 space-y-2">{payments?.slice(0,5).map((p) => <div key={p.id} className="flex justify-between text-xs"><span>{p.status}</span><b>{Number(p.amount).toLocaleString("fa-IR")}</b></div>)}</div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3"><h2 className="font-black">آخرین فعالیت‌ها</h2>{activities?.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{activities.map((a) => <div key={a.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex justify-between"><b>{a.title}</b><span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString("fa-IR")}</span></div><p className="mt-2 text-xs text-slate-500">{a.description || a.activity_type}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</p>}</section>
    </div>
  </div>;
}
