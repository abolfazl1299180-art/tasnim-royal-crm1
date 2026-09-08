export function PageHeader({ title, description, action }: { title: string; description: string; action?: string }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black text-amber-600">TASNIM ROYAL CRM</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {action && <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">+ {action}</button>}
    </div>
  );
}
