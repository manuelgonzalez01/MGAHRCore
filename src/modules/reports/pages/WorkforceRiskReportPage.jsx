import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import useWorkforceRiskReport from "../hooks/useWorkforceRiskReport";
import useReportsLocale from "../hooks/useReportsLocale";

export default function WorkforceRiskReportPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useWorkforceRiskReport();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando workforce risk", "Loading workforce risk")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de riesgo", "No risk report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Workforce Risk Report", "Workforce Risk Report")} title={t("Riesgo transversal del workforce", "Cross-workforce risk")} description={t("Vista sintetica de presion operativa, gaps documentales, readiness e impacto de cobertura.", "Synthesized view of operational pressure, documentary gaps, readiness, and coverage impact.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "locationId", "period"]} />
      <ReportsKpiCards
        items={[
          { label: "Empleados en riesgo", value: data.summary.employeesAtRisk, format: "number" },
          { label: "Cobertura pendiente", value: data.summary.pendingCoverage, format: "number" },
          { label: "Docs criticos", value: data.summary.criticalDocuments, format: "number" },
          { label: "Vacantes estrategicas", value: data.summary.openStrategicPositions, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title="Risk matrix" description="Prioridad inmediata por dominio de riesgo.">
          <div className="reports-list">
            {data.matrix.map((item) => (
              <article key={item.domain}>
                <strong>{item.domain}</strong>
                <p className="reports-muted">Incidentes: {item.value}</p>
                <span className={`reports-status ${item.severity}`}>{item.severity}</span>
              </article>
            ))}
          </div>
        </ReportsSectionCard>
        <ReportsSectionCard title="Alertas prioritarias" description="Items que justifican accion ejecutiva o de RRHH.">
          <div className="reports-list">
            {data.alerts.map((item) => (
              <article key={`${item.domain}-${item.title}`}>
                <strong>{item.title}</strong>
                <p className="reports-muted">{item.domain} | {item.detail}</p>
                <span className={`reports-status ${item.severity}`}>{item.severity}</span>
              </article>
            ))}
          </div>
        </ReportsSectionCard>
      </section>
    </main>
  );
}
