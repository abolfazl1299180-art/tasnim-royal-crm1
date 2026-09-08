import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("username,full_name,role,is_active").single();
  if (profile?.role !== "admin") return <div className="rounded-3xl bg-white p-12 text-center"><h1 className="text-xl font-black">دسترسی محدود است</h1><p className="mt-2 text-sm text-slate-500">تنظیمات فقط برای مدیر سیستم قابل دسترسی است.</p></div>;
  return <><PageHeader title="تنظیمات" description="مدیریت حساب، نقش‌ها و تنظیمات سیستم" /><div className="grid gap-4 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">حساب مدیر</h2><div className="mt-5 space-y-3 text-sm"><div className="rounded-2xl bg-slate-50 p-4"><span className="text-slate-400">نام کاربری</span><b className="mr-2" dir="ltr">{profile.username}</b></div><div className="rounded-2xl bg-slate-50 p-4"><span className="text-slate-400">نقش</span><b className="mr-2">{profile.role}</b></div></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black">امنیت</h2><p className="mt-3 text-sm leading-7 text-slate-500">احراز هویت با Supabase و سطح دسترسی با RLS کنترل می‌شود. رمز عبور هرگز در GitHub ذخیره نمی‌شود.</p></section></div></>;
}
