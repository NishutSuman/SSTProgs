export type Page = "dashboard" | "students" | "batches" | "grievances" | "trends" | "riskmodel" | "automation";

const ICONS: Record<Page, JSX.Element> = {
  dashboard: (
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  ),
  students: (
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  ),
  batches: (
    <path d="M4 9h4v11H4zm6-5h4v16h-4zm6 8h4v8h-4z" />
  ),
  grievances: (
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
  ),
  trends: (
    <path d="M3.5 18.5l6-6 4 4L22 8.9l-1.4-1.4-7.1 7.1-4-4L2 17l1.5 1.5z" />
  ),
  riskmodel: (
    <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-9h-2v9zM3 21h18v-2H3v2z" />
  ),
  automation: (
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  ),
};

const NAV: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "batches", label: "Batches & Subjects" },
  { key: "grievances", label: "Grievances" },
  { key: "trends", label: "Trends" },
  { key: "riskmodel", label: "Risk Model" },
  { key: "automation", label: "Automation" },
];

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white p-1">
          <img src="/sst-logo.png" alt="Scaler SST" className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="text-sm font-extrabold leading-tight text-slate-100">SSTProgs</div>
          <div className="text-[10px] text-slate-500">Scaler SST</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const active = page === n.key;
          return (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/30" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18" fill="currentColor">
                {ICONS[n.key]}
              </svg>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4 text-[11px] leading-relaxed text-slate-600">
        Risk engine + analytics + n8n automation, synced from Google Sheets.
      </div>
    </aside>
  );
}
