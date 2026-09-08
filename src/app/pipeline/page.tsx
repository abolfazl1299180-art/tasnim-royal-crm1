import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PipelineStageSelect } from "@/components/pipeline/pipeline-stage-select";

const stages = [
  ["new", "سرنخ جدید"],
  ["contacted", "تماس گرفته شد"],
  ["qualified", "واجد شرایط"],
  ["proposal", "پیشنهاد / مذاکره"],
  ["won", "برنده / مشتری"],
  ["lost", "از دست رفته"],
] as const;

type Contact = { id: string; first_name: string; last_name: string; phone: string | null; source: string | null; sales_stage: string };

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("contacts").select("id,first_name,last_name,phone,source,sales_stage").order("created_at", { ascending: false }).limit(300);
  const contacts = (data || []) as Contact[];
  const grouped = Object.fromEntries(stages.map(([key]) => [key, contacts.filter((contact) => contact.sales_stage === key)])) as Record<string, Contact[]>;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black text-amber-600">SALES PIPELINE</p><h1 className="mt-1 text-2xl font-black">قیف فروش</h1><p className="mt-2 text-sm text-slate-500">جابه‌جایی سرنخ‌ها از شروع ارتباط تا تبدیل یا از دست رفتن.</p></div><Link href="/contacts/new" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">مخاطب جدید</Link></div>
      <div className="grid gap-4 overflow-x-auto lg:grid-cols-3 xl:grid-cols-6">
        {stages.map(([key, label]) => <section key={key} className="min-w-[250px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black">{label}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{(grouped[key]?.length || 0).toLocaleString("fa-IR")}</span></div><div className="mt-4 space-y-3">{grouped[key]?.map((contact) => <article key={contact.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><Link href={`/contacts/${contact.id}`} className="font-black hover:text-amber-600">{contact.first_name} {contact.last_name}</Link><p className="mt-1 text-xs text-slate-500" dir="ltr">{contact.phone || "بدون شماره"}</p>{contact.source && <p className="mt-1 text-xs text-slate-400">منبع: {contact.source}</p>}<PipelineStageSelect id={contact.id} value={contact.sales_stage} /></article>)}{!grouped[key]?.length && <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">مخاطبی در این مرحله نیست.</p>}</div></section>)}
      </div>
    </div>
  );
}
