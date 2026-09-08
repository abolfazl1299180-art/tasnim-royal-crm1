import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { RegistrationStatusSelect } from "@/components/registrations/registration-status-select";

export default async function RegistrationsPage() {
  const supabase = await createClient();
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, contact_id, status, registered_at, notes, contacts(first_name,last_name), courses(title)")
    .order("registered_at", { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader
        title="ثبت‌نام‌ها"
        description="مدیریت ثبت‌نام مخاطبین در دوره‌ها"
        action="ثبت‌نام جدید"
        actionHref="/registrations/new"
      />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-right text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">مخاطب</th>
                <th>دوره</th>
                <th>وضعیت</th>
                <th>تاریخ ثبت</th>
                <th>یادداشت</th>
              </tr>
            </thead>
            <tbody>
              {registrations?.map((registration) => {
                const contact = Array.isArray(registration.contacts)
                  ? registration.contacts[0]
                  : registration.contacts;
                const course = Array.isArray(registration.courses)
                  ? registration.courses[0]
                  : registration.courses;

                return (
                  <tr key={registration.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold">
                      {contact ? (
                        <Link
                          href={`/contacts/${registration.contact_id}`}
                          className="hover:text-amber-600"
                        >
                          {contact.first_name} {contact.last_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{course?.title || "—"}</td>
                    <td>
                      <RegistrationStatusSelect
                        id={registration.id}
                        initialStatus={registration.status}
                      />
                    </td>
                    <td>
                      {registration.registered_at
                        ? new Date(registration.registered_at).toLocaleDateString("fa-IR")
                        : "—"}
                    </td>
                    <td className="max-w-[280px] truncate">{registration.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!registrations?.length && (
          <div className="p-12 text-center text-sm text-slate-400">
            هنوز ثبت‌نامی ثبت نشده است.
          </div>
        )}
      </div>
    </>
  );
}
