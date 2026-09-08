import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ContactSearchTable } from "@/components/contacts/contact-search-table";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, phone, status, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader title="بانک اطلاعات" description="مدیریت مخاطبین و پرونده‌های CRM" action="مخاطب جدید" actionHref="/contacts/new" />
      <ContactSearchTable contacts={contacts ?? []} />
    </>
  );
}
