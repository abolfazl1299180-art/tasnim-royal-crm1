"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("tasnimroyal");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const email = `${username.trim().toLowerCase()}@tasnimroyal.ir`;
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("نام کاربری یا رمز عبور صحیح نیست.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-7 shadow-2xl md:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-black text-amber-400">ت</div>
          <p className="mt-5 text-xs font-black tracking-widest text-amber-600">TASNIM ROYAL</p>
          <h1 className="mt-2 text-2xl font-black">ورود به CRM</h1>
          <p className="mt-2 text-sm text-slate-400">پنل مدیریت ارتباط با مشتری</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">نام کاربری</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-left outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" dir="ltr" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">رمز عبور</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-left outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" dir="ltr" />
          </label>
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "در حال ورود..." : "ورود به پنل"}</button>
        </form>
      </div>
    </main>
  );
}
