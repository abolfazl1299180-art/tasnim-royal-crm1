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
  { label: "گزارش تغییرات", href: "/audit", icon: "◌" },
  { label: "تنظیمات", href: "/settings", icon: "⚙", adminOnly: true },
];

const mobileNavigation: NavItem[] = [
  { label: "خانه", href: "/", icon: "⌂" },
  { label: "مخاطبین", href: "/contacts", icon: "◎" },
  { label: "قیف فروش", href: "/pipeline", icon: "◫" },
  { label: "پیگیری", href: "/follow-ups", icon: "↻" },
  { label: "بیشتر", href: "/tasks", icon: "⋯" },
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
      const { data: profile } = await client
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.role) setRole(profile.role as Role);
    });
  }, []);

  const visibleNavigation = useMemo(
    () => navigation.filter((item) => !item.adminOnly || role === "admin"),
    [role],
  );

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

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
        className={`fixed inset-y-0 right-0 z-40 flex w-[min(20rem,88vw)] flex-col border-l border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-5 sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-amber-400">
            ت
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">Tasnim Royal</p>
            <p className="truncate text-xs text-slate-400">مدیریت ارتباط با مشتری</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 sm:p-4">
          {visibleNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${active ? "bg-white/10" : "bg-slate-100"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={signOut}
            className="min-h-12 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
          >
            خروج از حساب
          </button>
        </div>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur sm:px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="باز کردن منو"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-lg lg:hidden"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 sm:text-xs">پنل مدیریت</p>
              <h1 className="truncate text-base font-black sm:text-lg">CRM تسنیم رویال</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sm:inline-flex">
              {role ? roleLabels[role] : ""}
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-amber-400 sm:h-11 sm:w-11">
              ت
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-3 pb-24 sm:p-4 sm:pb-24 md:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold ${active ? "text-slate-950" : "text-slate-400"}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${active ? "bg-slate-950 text-amber-400" : "bg-slate-100"}`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
