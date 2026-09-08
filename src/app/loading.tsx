export default function Loading() {
  return (
    <main className="flex min-h-[40vh] items-center justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-amber-400">ت</div>
        <p className="mt-4 text-sm font-bold text-slate-500">در حال بارگذاری پنل…</p>
      </div>
    </main>
  );
}
