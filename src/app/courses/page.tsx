import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,description,start_date,end_date,capacity,price,is_active")
    .order("created_at", { ascending: false });

  const courseIds = courses?.map((course) => course.id) ?? [];
  const { data: registrations } = courseIds.length
    ? await supabase
        .from("registrations")
        .select("course_id,status")
        .in("course_id", courseIds)
        .in("status", ["pending", "active"])
    : { data: [] as { course_id: string; status: string }[] };

  const enrollmentCounts = new Map<string, number>();
  registrations?.forEach((registration) => {
    enrollmentCounts.set(
      registration.course_id,
      (enrollmentCounts.get(registration.course_id) ?? 0) + 1,
    );
  });

  return (
    <>
      <PageHeader
        title="دوره‌ها"
        description="مدیریت دوره‌ها، ظرفیت و ثبت‌نام‌های جاری"
        action="دوره جدید"
        actionHref="/courses/new"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses?.map((course) => {
          const enrolled = enrollmentCounts.get(course.id) ?? 0;
          const capacity = course.capacity;
          const isFull = capacity !== null && enrolled >= capacity;
          const remaining = capacity === null ? null : Math.max(capacity - enrolled, 0);

          return (
            <article
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black">{course.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    course.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {course.is_active ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {course.description || "بدون توضیحات"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="block text-xs text-slate-400">ثبت‌نام جاری</span>
                  <b>{enrolled.toLocaleString("fa-IR")}</b>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="block text-xs text-slate-400">ظرفیت</span>
                  <b>
                    {capacity === null
                      ? "نامحدود"
                      : `${capacity.toLocaleString("fa-IR")} نفر`}
                  </b>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm">
                <span className="block text-xs text-slate-400">وضعیت ظرفیت</span>
                <b className={isFull ? "text-red-600" : "text-slate-900"}>
                  {capacity === null
                    ? "ظرفیت باز"
                    : isFull
                      ? "تکمیل ظرفیت"
                      : `${remaining?.toLocaleString("fa-IR")} جای خالی`}
                </b>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="block text-xs text-slate-400">هزینه</span>
                  <b>{Number(course.price).toLocaleString("fa-IR")} تومان</b>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="block text-xs text-slate-400">تاریخ</span>
                  <b>
                    {course.start_date
                      ? new Date(course.start_date).toLocaleDateString("fa-IR")
                      : "—"}
                  </b>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/registrations/new?course=${course.id}`}
                  className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
                >
                  ثبت‌نام
                </Link>
                <Link
                  href="/registrations"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50"
                >
                  لیست
                </Link>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                {course.start_date
                  ? new Date(course.start_date).toLocaleDateString("fa-IR")
                  : ""}
                {course.end_date
                  ? ` تا ${new Date(course.end_date).toLocaleDateString("fa-IR")}`
                  : ""}
              </div>
            </article>
          );
        })}
      </div>
      {!courses?.length && (
        <div className="rounded-3xl bg-white p-12 text-center text-sm text-slate-400">
          هنوز دوره‌ای ثبت نشده است.
        </div>
      )}
    </>
  );
}
