import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase.from("contacts").select("id, first_name, last_name, phone, status, source, created_at").order("created_at", { ascending: false }).limit(50);

  return (
    <>
      <PageHeader title="بانک اطلاعات" description="مدیریت مخاطبین و پرونده‌های CRM" action="مخاطب جدید" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <input placeholder="جستجوی نام یا شماره تماس..." className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">نام</th><th>موبایل</th><th>وضعیت</th><th>منبع</th><th>تاریخ ثبت</th></tr></thead>
            <tbody>{contacts?.map((contact) => <tr key={contact.id} className="border-t border-slate-100"><td className="px-5 py-4 font-bold">{contact.first_name} {contact.last_name}</td><td>{contact.phone || "—"}</td><td>{contact.status}</td><td>{contact.source || "—"}</td><td>{new Date(contact.created_at).toLocaleDateString("fa-IR")}</td></tr>)}</tbody>
          </table>
        </div>
        {!contacts?.length && <div className="p-12 text-center text-sm text-slate-400">هنوز مخاطبی ثبت نشده است.</div>}
      </div>
    </>
  );
}
