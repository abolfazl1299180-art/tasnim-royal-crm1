"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: string;
  source: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = { lead: "سرنخ", active: "فعال", inactive: "غیرفعال", customer: "مشتری" };

export function ContactSearchTable({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) =>
      `${contact.first_name} ${contact.last_name} ${contact.phone ?? ""} ${contact.source ?? ""}`.toLowerCase().includes(q),
    );
  }, [contacts, query]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجوی نام، شماره تماس یا منبع..."
          className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">نام</th><th>موبایل</th><th>وضعیت</th><th>منبع</th><th>تاریخ ثبت</th></tr></thead>
          <tbody>
            {filtered.map((contact) => (
              <tr key={contact.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-4 font-bold"><Link href={`/contacts/${contact.id}`} className="hover:text-amber-600">{contact.first_name} {contact.last_name}</Link></td>
                <td>{contact.phone || "—"}</td>
                <td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{statusLabels[contact.status] || contact.status}</span></td>
                <td>{contact.source || "—"}</td>
                <td>{new Date(contact.created_at).toLocaleDateString("fa-IR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && <div className="p-12 text-center text-sm text-slate-400">نتیجه‌ای برای جستجو پیدا نشد.</div>}
    </div>
  );
}
