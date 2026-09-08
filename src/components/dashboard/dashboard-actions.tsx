"use client";

import { useRouter } from "next/navigation";

const actions = [
  ["مخاطب جدید", "/contacts/new"],
  ["پیگیری جدید", "/followups/new"],
  ["وظیفه جدید", "/tasks/new"],
  ["ثبت پرداخت", "/payments/new"],
] as const;

export function DashboardActions() {
  const router = useRouter();
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {actions.map(([label, href]) => (
        <button key={href} type="button" onClick={() => router.push(href)} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold transition hover:border-amber-300 hover:bg-amber-50">
          + {label}
        </button>
      ))}
    </div>
  );
}
