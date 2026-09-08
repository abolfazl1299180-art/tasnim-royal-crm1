import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";

const labels: Record<string, string> = {
  paid: "پرداخت‌شده",
  partial: "علی‌الحساب",
  pending: "در انتظار",
  cancelled: "لغوشده",
};

type ContactSummary = { first_name?: string; last_name?: string } | null;

export default async function PaymentsPage() {
  const s = await createClient();
  const { data: p } = await s
    .from("payments")
    .select("id,amount,status,paid_at,method,reference,contacts(first_name,last_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const total = p?.filter((x) => x.status !== "cancelled").reduce((a, x) => a + Number(x.amount), 0) || 0;

  return (
    <>
      <PageHeader title="پرداخت‌ها" description="ثبت و پیگیری وضعیت پرداخت‌ها" action="ثبت پرداخت" actionHref="/payments/new" />
      <div className="mb-5 rounded-3xl bg-slate-950 p-6 text-white">
        <p className="text-sm text-slate-400">مجموع دریافت‌های غیرلغوشده</p>
        <p className="mt-2 text-3xl font-black">{total.toLocaleString("fa-IR")} <span className="text-sm font-bold text-amber-400">تومان</span></p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">مخاطب</th><th>مبلغ</th><th>وضعیت</th><th>روش</th><th>پیگیری</th><th>تاریخ</th></tr></thead>
            <tbody>
              {p?.map((x) => {
                const contact = x.contacts as ContactSummary;
                return <tr key={x.id} className="border-t border-slate-100"><td className="px-5 py-4 font-bold">{contact ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "—" : "—"}</td><td>{Number(x.amount).toLocaleString("fa-IR")} تومان</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{labels[x.status] || x.status}</span></td><td>{x.method || "—"}</td><td>{x.reference || "—"}</td><td>{x.paid_at ? new Date(x.paid_at).toLocaleDateString("fa-IR") : "—"}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
        {!p?.length && <div className="p-12 text-center text-sm text-slate-400">پرداختی ثبت نشده است.</div>}
      </div>
    </>
  );
}
