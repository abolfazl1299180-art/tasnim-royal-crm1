import { AppShell } from "@/components/layout/app-shell";

const stats = [
  { label: "مخاطبین", value: "۰", hint: "کل پرونده‌ها" },
  { label: "پیگیری امروز", value: "۰", hint: "نیازمند اقدام" },
  { label: "دوره‌های فعال", value: "۰", hint: "دوره در حال برگزاری" },
  { label: "پرداخت در انتظار", value: "۰", hint: "مورد نیازمند بررسی" },
];

const modules = [
  ["بانک اطلاعات", "مدیریت مخاطبین، پرونده‌ها و سوابق ارتباطی", "مشاهده مخاطبین"],
  ["پیگیری‌ها", "پیگیری تماس‌ها، سرنخ‌ها و ارتباطات آینده", "مدیریت پیگیری‌ها"],
  ["وظایف", "کارهای روزانه تیم را ثبت و اولویت‌بندی کنید", "مشاهده وظایف"],
  ["دوره‌ها", "دوره‌ها، ظرفیت‌ها و ثبت‌نام‌ها را مدیریت کنید", "مدیریت دوره‌ها"],
  ["پرداخت‌ها", "وضعیت پرداخت‌ها و مبالغ دریافتی را دنبال کنید", "مشاهده پرداخت‌ها"],
  ["گزارش‌ها", "نمای مدیریتی از عملکرد و فعالیت‌های مجموعه", "مشاهده گزارش‌ها"],
] as const;

export default function Home() {
  return (
    <AppShell>
      <section className="mb-8 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">
            TASNIM ROYAL CRM
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">
            مدیریت یکپارچه ارتباط با مشتری
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            همه اطلاعات، پیگیری‌ها، وظایف، دوره‌ها و پرداخت‌ها را در یک محیط منظم و ساده مدیریت کنید.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
            <p className="mt-2 text-xs text-slate-400">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600">MODULES</p>
            <h3 className="mt-1 text-xl font-black">بخش‌های اصلی CRM</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(([title, description, action]) => (
            <article key={title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg font-black text-amber-600">
                {title.slice(0, 1)}
              </div>
              <h4 className="text-lg font-black">{title}</h4>
              <p className="mt-2 min-h-14 text-sm leading-7 text-slate-500">{description}</p>
              <button className="mt-5 text-sm font-black text-slate-950 transition group-hover:text-amber-600">
                {action} ←
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black">فعالیت‌های اخیر</h3>
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-400">
            هنوز فعالیتی ثبت نشده است.
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black">اقدام سریع</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {["مخاطب جدید", "پیگیری جدید", "وظیفه جدید", "ثبت پرداخت"].map((action) => (
              <button key={action} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold transition hover:border-amber-300 hover:bg-amber-50">
                + {action}
              </button>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
