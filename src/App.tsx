import { useMemo, useState } from "react";
import type { Config, StudentResult } from "./engine/types";
import { DEFAULT_CONFIG } from "./engine/config";
import { computeCohort } from "./engine/engine";
import { deriveAnalytics } from "./lib/analytics";
import { STUDENTS, GRIEVANCES } from "./lib/data";
import { Sidebar, type Page } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ConfigModal } from "./components/ConfigModal";
import { ReportView } from "./components/ReportView";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { BatchesPage } from "./pages/BatchesPage";
import { GrievancesPage } from "./pages/GrievancesPage";
import { TrendsPage } from "./pages/TrendsPage";
import { RiskModelPage } from "./pages/RiskModelPage";
import { AutomationPage } from "./pages/AutomationPage";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const cohort = useMemo(() => computeCohort(STUDENTS, config), [config]);
  const analytics = useMemo(() => deriveAnalytics(cohort), [cohort]);
  const selected = useMemo(() => (selectedId ? cohort.results.find((s) => s.id === selectedId) ?? null : null), [cohort, selectedId]);

  const openStudent = (s: StudentResult) => {
    setSelectedId(s.id);
    setPage("students");
  };

  return (
    <div>
      <div className="no-print">
        <Sidebar page={page} onNavigate={setPage} />
        <div className="ml-60">
          <Topbar total={cohort.total} onOpenConfig={() => setConfigOpen(true)} />
          <main className="px-6 py-6">
            {page === "dashboard" && <DashboardPage cohort={cohort} analytics={analytics} grievanceCount={GRIEVANCES.length} onSelectStudent={openStudent} />}
            {page === "students" && <StudentsPage cohort={cohort} selected={selected} onSelect={(s) => setSelectedId(s?.id ?? null)} />}
            {page === "batches" && <BatchesPage analytics={analytics} />}
            {page === "grievances" && <GrievancesPage cohort={cohort} onSelectStudent={openStudent} />}
            {page === "trends" && <TrendsPage cohort={cohort} analytics={analytics} />}
            {page === "riskmodel" && <RiskModelPage config={config} onChange={setConfig} onReset={() => setConfig(DEFAULT_CONFIG)} cohort={cohort} />}
            {page === "automation" && <AutomationPage cohort={cohort} onSelectStudent={openStudent} />}
          </main>
        </div>
        {configOpen && <ConfigModal cohort={cohort} onClose={() => setConfigOpen(false)} />}
      </div>

      {/* Print-only leadership report */}
      <div className="report-only">
        <ReportView cohort={cohort} analytics={analytics} grievanceCount={GRIEVANCES.length} />
      </div>
    </div>
  );
}
