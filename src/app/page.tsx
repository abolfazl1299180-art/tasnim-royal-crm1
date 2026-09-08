const modules = [
  ["بانک اطلاعات", "مدیریت مخاطبین و پرونده‌ها"],
  ["پیگیری‌ها", "پیگیری ارتباطات و سرنخ‌ها"],
  ["وظایف", "مدیریت کارهای روزانه تیم"],
  ["دوره‌ها", "دوره‌ها و ثبت‌نام‌ها"],
  ["پرداخت‌ها", "ثبت و پیگیری پرداخت‌ها"],
  ["گزارش‌ها", "گزارش‌های مدیریتی"],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-[#b08d20]">TASNIM ROYAL</p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">CRM تسنیم رویال</h1>
          <p className="mt-3 text-sm leading-7 text-gray-500">مرکز مدیریت ارتباط با مشتری، پیگیری‌ها، دوره‌ها و فعالیت‌های مجموعه</p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#d4af37]" />
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-500">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
