"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Course = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  price: number;
  is_active: boolean;
};

export function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const capacityValue = String(form.get("capacity") || "").trim();
    const priceValue = Number(form.get("price") || 0);
    const start = String(form.get("start_date") || "") || null;
    const end = String(form.get("end_date") || "") || null;

    if (start && end && end < start) {
      setError("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await createClient()
      .from("courses")
      .update({
        title: String(form.get("title") || "").trim(),
        description: String(form.get("description") || "").trim() || null,
        start_date: start,
        end_date: end,
        capacity: capacityValue ? Number(capacityValue) : null,
        price: priceValue,
        is_active: form.get("is_active") === "true",
      })
      .eq("id", course.id);

    if (updateError) {
      setError("ویرایش دوره انجام نشد. ممکن است دسترسی کافی نداشته باشید.");
      setSaving(false);
      return;
    }

    router.push("/courses");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black">ویرایش دوره</h1>
      <p className="mt-2 text-sm text-slate-500">اطلاعات و ظرفیت دوره را به‌روزرسانی کنید.</p>
      <form onSubmit={submit} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-bold">عنوان دوره</span>
            <input name="title" defaultValue={course.title} required className="w-full rounded-2xl border p-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">توضیحات</span>
            <textarea name="description" defaultValue={course.description || ""} rows={3} className="w-full rounded-2xl border p-3" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">شروع</span>
              <input name="start_date" type="date" defaultValue={course.start_date || ""} className="w-full rounded-2xl border p-3" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">پایان</span>
              <input name="end_date" type="date" defaultValue={course.end_date || ""} className="w-full rounded-2xl border p-3" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">ظرفیت</span>
              <input name="capacity" type="number" min="1" defaultValue={course.capacity ?? ""} className="w-full rounded-2xl border p-3" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">هزینه (تومان)</span>
              <input name="price" type="number" min="0" required defaultValue={Number(course.price)} className="w-full rounded-2xl border p-3" />
            </label>
          </div>
          <label>
            <span className="mb-2 block text-sm font-bold">وضعیت</span>
            <select name="is_active" defaultValue={course.is_active ? "true" : "false"} className="w-full rounded-2xl border p-3">
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </label>
        </div>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-2xl border px-5 py-3 font-bold">انصراف</button>
          <button disabled={saving} className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white">{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
        </div>
      </form>
    </div>
  );
}
