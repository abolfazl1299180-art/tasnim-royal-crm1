"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Role = "admin" | "manager" | "sales" | "support" | "viewer";
type NavItem = { label: string; href: string; icon: string; adminOnly?: boolean };

const navigation: NavItem[] = [
  { label: "داشبورد", href: "/", icon: "⌂" },
  { label: "بانک اطلاعات", href: "/contacts", icon: "◎" },
  { label: "قیف فروش", href: "/pipeline", icon: "◫" },
  { label: "پیگیری‌ها", href: "/follow-ups", icon: "↻" },
  { label: "وظایف", href: "/tasks", icon: "✓" },
  { label: "دوره‌ها", href: "/courses", icon: "▣" },
  { label: "ثبت‌نام‌ها", href: "/registrations", icon: "＋" },
  { label: "پرداخت‌ها", href: "/payments", icon: "◈" },
  { label: "گزارش‌ها", href: "/reports", icon: "▤" },
  { label: "امکانات حرفه‌ای", href: "/advanced", icon: "✦" },
  { label: "گزارش تغییرات", href: "/audit", icon: "◌" },
  { label: "تنظیمات", href: "/settings", icon: "⚙", adminOnly: true },
];

const mobileNavigation: NavItem[] = [
  { label: "خانه", href: "/", icon: "⌂" },
  { label: "مخاطبین", href: "/contacts", icon: "◎" },
  { label: "قیف فروش", href: "/pipeline", icon: "◫" },
  { label: "پیگیری", href: "/follow-ups", icon: "↻" },
  { label: "بیشتر", href: "/advanced", icon: "✦" },
];

const roleLabels: Record<Role, string> = {
  admin: "مدیر کل",
  manager: "مدیر",
  sales: "فروش",
  support: "پشتیبانی",
  viewer: "مشاهده‌گر",
};

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await client.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profile?.role) setRole(profile.role as Role);
    });
  }, []);

  const visibleNavigation = useMemo(() => navigation.filter((item) => !item.adminOnly || role === "admin"), [role]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.06),transparent_28%),#f5f7fb] text-slate-900">
      {open && <button aria-label="بستن منو" className="crm-fade fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-40 flex w-[min(21rem,88vw)] flex-col border-l border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="crm-shimmer flex h-24 shrink-0 items-center gap-3 border-b border-slate-100 px-5 sm:px-6"><div className="crm-pulse-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-slate-950 text-xl font-black text-amber-400 shadow-lg shadow-slate-950/10">ت</div><div className="min-w-0"><p className="text-[15px] font-black tracking-tight">Tasnim Royal</p><p className="mt-0.5 truncate text-xs text-slate-400">سیستم مدیریت ارتباط با مشتری</p></div></div>
        <div className="crm-animate px-4 pt-4"><div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3"><p className="text-[10px] font-black tracking-[.18em] text-amber-700">WORKSPACE</p><p className="mt-1 text-xs font-bold text-slate-600">دسترسی سریع به بخش‌های CRM</p></div></div>
        <nav className="crm-stagger flex-1 space-y-1 overflow-y-auto p-4">
          {visibleNavigation.map((item) => { const active = isActive(pathname, item.href); return <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className={`crm-hover-lift group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold ${active ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base transition duration-300 group-hover:rotate-3 ${active ? "bg-white/10 text-amber-400" : "bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600"}`}>{item.icon}</span><span className="flex-1">{item.label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 crm-pulse-soft" />}</Link>; })}
        </nav>
        <div className="shrink-0 border-t border-slate-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><button onClick={signOut} className="crm-shimmer crm-hover-lift min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-red-100 hover:bg-red-50 hover:text-red-600">خروج از حساب</button></div>
      </aside>

      <div className="lg:pr-[21rem]">
        <header className="crm-fade sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white/88 px-3 py-3 shadow-[0_8px_30px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl sm:px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="باز کردن منو" className="crm-hover-lift flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg shadow-sm lg:hidden" onClick={() => setOpen(true)}>☰</button><div className="min-w-0"><p className="text-[10px] font-black tracking-[.16em] text-amber-600 sm:text-[11px]">TASNIM ROYAL</p><h1 className="mt-0.5 truncate text-base font-black tracking-tight sm:text-lg">CRM تسنیم رویال</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-3"><span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:inline-flex">{role ? roleLabels[role] : "در حال بارگذاری"}</span><div className="crm-pulse-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-amber-400 shadow-md shadow-slate-950/10 sm:h-11 sm:w-11">ت</div></div>
        </header>
        <main className="crm-page-enter mx-auto w-full max-w-[1400px] p-3 pb-24 sm:p-5 sm:pb-24 md:p-8 lg:pb-8">{children}</main>
      </div>
      <nav className="crm-fade fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/96 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_-20px_rgba(15,23,42,.3)] backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-5">{mobileNavigation.map((item) => { const active = isActive(pathname, item.href); return <Link key={item.label} href={item.href} className={`crm-hover-lift flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold ${active ? "text-slate-950" : "text-slate-400"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition duration-300 ${active ? "bg-slate-950 text-amber-400 shadow-md" : "bg-slate-100"}`}>{item.icon}</span><span className="truncate">{item.label}</span></Link>; })}</div></nav>
    </div>
  );
}
