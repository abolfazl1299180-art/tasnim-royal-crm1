"use client";

import { useState } from "react";

const navigation = [
  { label: "داشبورد", href: "/", icon: "⌂" },
  { label: "بانک اطلاعات", href: "#", icon: "◎" },
  { label: "پیگیری‌ها", href: "#", icon: "↻" },
  { label: "وظایف", href: "#", icon: "✓" },
  { label: "دوره‌ها", href: "#", icon: "▣" },
  { label: "پرداخت‌ها", href: "#", icon: "◈" },
  { label: "گزارش‌ها", href: "#", icon: "▤" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {open && (
        <button
          aria-label="بستن منو"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 border-l border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-amber-400 shadow-sm">
            ت
          </div>
          <div>
            <p className="text-sm font-black">Tasnim Royal</p>
            <p className="text-xs text-slate-400">مدیریت ارتباط با مشتری</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                index === 0
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-current/10 text-base">
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-black text-amber-900">نسخه پایه CRM</p>
          <p className="mt-1 text-[11px] leading-5 text-amber-800/70">
            ساختار سیستم مرحله‌به‌مرحله در حال تکمیل است.
          </p>
        </div>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="باز کردن منو"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-lg lg:hidden"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>
            <div>
              <p className="text-xs font-bold text-slate-400">پنل مدیریت</p>
              <h1 className="text-lg font-black">داشبورد</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 sm:block">
              جستجو
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-amber-400">
              ا
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
