import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id,title,description,start_date,end_date,capacity,price,is_active").order("created_at", { ascending: false });
  return <><PageHeader title="دوره‌ها" description="مدیریت دوره‌ها و ظرفیت ثبت‌نام" action="دوره جدید" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses?.map((course) => <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-black">{course.title}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${course.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{course.is_active ? "فعال" : "غیرفعال"}</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{course.description || "بدون توضیحات"}</p><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">ظرفیت</span><b>{course.capacity ?? "نامحدود"}</b></div><div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs text-slate-400">هزینه</span><b>{Number(course.price).toLocaleString("fa-IR")}</b></div></div></article>)}</div>{!courses?.length && <div className="rounded-3xl bg-white p-12 text-center text-sm text-slate-400">هنوز دوره‌ای ثبت نشده است.</div>}</>;
}
