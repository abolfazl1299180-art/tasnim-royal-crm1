"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600">!</div>
        <p className="mt-5 text-xs font-black text-amber-600">TASNIM ROYAL CRM</p>
        <h1 className="mt-2 text-2xl font-black">خطایی رخ داد</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">در پردازش این صفحه مشکلی پیش آمد. می‌توانید دوباره تلاش کنید.</p>
        <button onClick={() => reset()} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">تلاش دوباره</button>
      </div>
    </main>
  );
}
