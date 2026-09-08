import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ContactSearchTable } from "@/components/contacts/contact-search-table";

const statuses = new Set(["lead", "active", "inactive", "customer"]);
const stages = new Set(["new", "contacted", "qualified", "proposal", "won", "lost"]);
function safeSearch(value: string) { return value.trim().replace(/[^\p{L}\p{N}\s+@._-]/gu, "").slice(0, 80); }

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; stage?: string; page?: string }> }) {
  const params = await searchParams;
  const q = safeSearch(params.q || "");
  const status = statuses.has(params.status || "") ? params.status! : "";
  const stage = stages.has(params.stage || "") ? params.stage! : "";
  const parsedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 30;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClient();
  let query = supabase.from("contacts").select("id,first_name,last_name,phone,status,source,sales_stage,created_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (q) query = query.or([`first_name.ilike.%${q}%`,`last_name.ilike.%${q}%`,`phone.ilike.%${q}%`,`source.ilike.%${q}%`].join(","));
  if (status) query = query.eq("status", status);
  if (stage) query = query.eq("sales_stage", stage);
  const { data: contacts, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return <><PageHeader title="بانک اطلاعات" description="مدیریت مخاطبین، فیلتر و جستجوی سریع پرونده‌ها" action="مخاطب جدید" actionHref="/contacts/new" /><ContactSearchTable contacts={(contacts ?? []) as Array<{id:string;first_name:string;last_name:string;phone:string|null;status:string;source:string|null;sales_stage:string;created_at:string}>} query={q} status={status} stage={stage} page={Math.min(page,totalPages)} totalPages={totalPages} total={total} /></>;
}
