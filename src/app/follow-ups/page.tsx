import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { FollowUpStatusSelect } from "@/components/follow-ups/follow-up-status-select";

export default async function FollowUpsPage(){
 const supabase=await createClient();
 const {data:items}=await supabase.from("follow_ups").select("id,title,due_at,status,notes,contacts(first_name,last_name)").order("due_at",{ascending:true}).limit(50);
 return <><PageHeader title="پیگیری‌ها" description="پیگیری ارتباطات و سرنخ‌های آینده" action="پیگیری جدید" actionHref="/follow-ups/new"/><div className="grid gap-4">{items?.map(item=>{const contact=Array.isArray(item.contacts)?item.contacts[0]:item.contacts;return <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-black">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{contact?`${contact.first_name||""} ${contact.last_name||""}`:"مخاطب نامشخص"}</p></div><FollowUpStatusSelect id={item.id} initialStatus={item.status}/></div><div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400"><span>{new Date(item.due_at).toLocaleString("fa-IR")}</span>{item.notes&&<span>• {item.notes}</span>}</div></article>})}</div>{!items?.length&&<div className="rounded-3xl bg-white p-12 text-center text-sm text-slate-400">پیگیری فعالی وجود ندارد.</div>}<Link href="/contacts" className="mt-6 inline-block text-sm font-bold text-amber-600">مشاهده مخاطبین ←</Link></>}
