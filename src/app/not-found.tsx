import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-amber-400">ت</div>
        <p className="mt-5 text-xs font-black text-amber-600">TASNIM ROYAL CRM</p>
        <h1 className="mt-2 text-2xl font-black">صفحه پیدا نشد</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">آدرسی که وارد کرده‌اید وجود ندارد یا حذف شده است.</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">بازگشت به داشبورد</Link>
      </div>
    </main>
  );
}
