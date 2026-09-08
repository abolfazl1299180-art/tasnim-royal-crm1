"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Role = "admin" | "manager" | "sales" | "support" | "viewer";

const navigation: Array<{ label: string; href: string; icon: string; adminOnly?: boolean }> = [
  { label: "داشبورد", href: "/", icon: "⌂" },
  { label: "بانک اطلاعات", href: "/contacts", icon: "◎" },
  { label: "قیف فروش", href: "/pipeline", icon: "◫" },
  { label: "پیگیری‌ها", href: "/follow-ups", icon: "↻" },
  { label: "وظایف", href: "/tasks", icon: "✓" },
  { label: "دوره‌ها", href: "/courses", icon: "▣" },
  { label: "ثبت‌نام‌ها", href: "/registrations", icon: "＋" },
  { label: "پرداخت‌ها", href: "/payments", icon: "◈" },
  { label: "گزارش‌ها", href: "/reports", icon: "▤" },
  { label: "گزارش تغییرات", href: "/audit", icon: "◌" },
  { label: "تنظیمات", href: "/settings", icon: "⚙", adminOnly: true },
];

const roleLabels: Record<Role, string> = { admin: "مدیر کل", manager: "مدیر", sales: "فروش", support: "پشتیبانی", viewer: "مشاهده‌گر" };

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {open && <button aria-label="بستن منو" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 border-l border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-amber-400">ت</div>
          <div><p className="text-sm font-black">Tasnim Royal</p><p className="text-xs text-slate-400">مدیریت ارتباط با مشتری</p></div>
        </div>
        <nav className="space-y-1 p-4">
          {visibleNavigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${active ? "bg-white/10" : "bg-slate-100"}`}>{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <button onClick={signOut} className="absolute bottom-5 left-4 right-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">خروج از حساب</button>
      </aside>
      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3"><button aria-label="باز کردن منو" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-lg lg:hidden" onClick={() => setOpen(true)}>☰</button><div><p className="text-xs font-bold text-slate-400">پنل مدیریت</p><h1 className="text-lg font-black">CRM تسنیم رویال</h1></div></div>
          <div className="flex items-center gap-3"><span className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sm:inline-flex">{role ? roleLabels[role] : ""}</span><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-amber-400">ت</div></div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
