"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const stages=[["new","سرنخ جدید"],["contacted","تماس گرفته شد"],["qualified","واجد شرایط"],["proposal","پیشنهاد / مذاکره"],["won","برنده / مشتری"],["lost","از دست رفته"]] as const;
export function PipelineStageSelect({id,value}:{id:string;value:string}){const[saving,setSaving]=useState(false);const[error,setError]=useState("");const router=useRouter();async function changeStage(next:string){if(next===value)return;setSaving(true);setError("");const{error}=await createClient().from("contacts").update({sales_stage:next}).eq("id",id);if(error)setError("تغییر مرحله انجام نشد.");else router.refresh();setSaving(false);}return <div><select aria-label="مرحله فروش" disabled={saving} value={value||"new"} onChange={e=>void changeStage(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">{stages.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>{error&&<p className="mt-1 text-[11px] font-bold text-red-600">{error}</p>}</div>}
