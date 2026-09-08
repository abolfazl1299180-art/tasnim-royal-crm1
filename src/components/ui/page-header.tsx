"use client";

import Link from "next/link";

export function PageHeader({ title, description, action, actionHref }: { title: string; description: string; action?: string; actionHref?: string }) {
  return (
    <div className="mb-7 flex flex-col gap-4 rounded-[1.7rem] border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,.35)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-[.2em] text-amber-600">TASNIM ROYAL CRM</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-800">
          + {action}
        </Link>
      )}
    </div>
  );
}
