import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportInsightCard from "../components/ReportInsightCard";
import ReportStatusBadge from "../components/ReportStatusBadge";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsQuickActions from "../components/ReportsQuickActions";
import ReportsSectionCard from "../components/ReportsSectionCard";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useReportsDashboard from "../hooks/useReportsDashboard";
import useReportsLocale from "../hooks/useReportsLocale";

export default function ReportsHomePage() {
  const { t, language } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useReportsDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando intelligence workspace", "Loading intelligence workspace")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin workspace de reportes", "No reporting workspace")} description={t("No fue posible consolidar las fuentes del ecosistema.", "It was not possible to consolidate ecosystem data sources.")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader
        eyebrow="Reporting & Workforce Intelligence"
        title="Centro ejecutivo de reportes y decisiones"
        description="Capa transversal que conecta workforce, compensacion, vacations, recruitment, development y compliance para toma de decisiones."
        badges={[
          { label: t("Headcount", "Headcount"), value: data.summary.headcount, status: "healthy" },
          { label: t("Rotacion", "Turnover"), value: `${data.summary.turnoverRate}%`, status: data.summary.turnoverRate > 10 ? "warning" : "healthy" },
          { label: t("Aprobaciones", "Approvals"), value: data.summary.pendingApprovals, status: data.summary.pendingApprovals > 2 ? "warning" : "pending" },
        ]}
      />

      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "locationId", "departmentId", "period", "module"]} />

      <ReportsKpiCards
        items={[
          { label: t("Headcount trazado", "Tracked headcount"), value: data.summary.headcount, format: "number", helper: t("Cobertura actual del universo laboral", "Current coverage of the workforce universe") },
          { label: t("Empleados activos", "Active employees"), value: data.summary.activeEmployees, format: "number", helper: t("Base operativa en estructura", "Operational base in structure") },
          { label: t("Salario promedio", "Average salary"), value: data.summary.averageSalary, format: "currency", helper: t("Lectura corporativa de compensacion", "Corporate compensation readout") },
          { label: t("Vacantes abiertas", "Open positions"), value: data.summary.openPositions, format: "number", helper: t("Presion actual del pipeline de talento", "Current pressure on the talent pipeline") },
        ]}
      />

      <section className="reports-grid">
        <div className="reports-toolbar">
          <ReportsSectionCard title={t("Dominios analiticos", "Analytic domains")} description={t("Cada vista baja a una capa operativa con foco ejecutivo y accionable.", "Each view drills down into an operational layer with executive and actionable focus.")}>
            <div className="reports-list">
              {data.domains.map((item) => (
                <article key={item.key}>
                  <div className="reports-card__head">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="reports-muted">{item.description}</p>
                    </div>
                    <ReportStatusBadge status={item.status} />
                  </div>
                  <p className="reports-muted">Valor visible: {item.value}</p>
                </article>
              ))}
            </div>
          </ReportsSectionCard>
        </div>
        <div>
          <ReportExportPanel exportState={exportState} onExport={exportReport} />
        </div>
      </section>

      <ReportsSectionCard title={t("Quick actions", "Quick actions")} description={t("Entradas directas a las vistas de decision del subsistema.", "Direct entry points into decision views across the subsystem.")}>
        <ReportsQuickActions items={data.quickActions} />
      </ReportsSectionCard>

      <ReportsSectionCard title={t("Executive insights", "Executive insights")} description={t("Lectura sintetica del estado actual del workforce y riesgos prioritarios.", "Synthesized readout of current workforce status and priority risks.")}>
        <div className="reports-insight-grid">
          {data.insights.map((item) => (
            <ReportInsightCard key={item.title} title={item.title} description={item.description} tone={item.tone} />
          ))}
        </div>
      </ReportsSectionCard>

      <ModuleConnectionsPanel moduleKey="reports" language={language} />
    </main>
  );
}
