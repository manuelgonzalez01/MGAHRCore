import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportInsightCard from "../components/ReportInsightCard";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import RotationTrendPanel from "../components/RotationTrendPanel";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useRotationReport from "../hooks/useRotationReport";
import useReportsLocale from "../hooks/useReportsLocale";

export default function RotationReportPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useRotationReport();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando rotation report", "Loading rotation report")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de rotacion", "No rotation report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Operational Reports", "Operational Reports")} title={t("Rotacion, entradas y salidas", "Turnover, entries, and exits")} description={t("Lectura de estabilidad organizacional por periodo, razones y movimiento neto.", "Organizational stability readout by period, reasons, and net movement.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "locationId", "levelId", "period"]} />
      <ReportsKpiCards
        items={[
          { label: t("Entradas", "Entries"), value: data.summary.entries, format: "number" },
          { label: t("Salidas", "Exits"), value: data.summary.exits, format: "number" },
          { label: t("Rotacion", "Turnover"), value: data.summary.turnoverRate, format: "percent" },
          { label: t("Movimiento neto", "Net movement"), value: data.summary.netMovement, format: "number" },
        ]}
      />
      <RotationTrendPanel trend={data.trend} />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Motivos de salida", "Exit reasons")} description={t("Principales drivers observados en el periodo.", "Main drivers observed in the selected period.")}>
          <WorkforceDistributionTable title={t("Motivo", "Reason")} rows={data.reasons} valueLabel={t("Impacto", "Impact")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Impacto por departamento", "Impact by department")} description={t("Donde se concentra la movilidad.", "Where workforce mobility is concentrated.")}>
          <WorkforceDistributionTable title={t("Departamento", "Department")} rows={data.byDepartment} valueLabel={t("Impacto", "Impact")} />
        </ReportsSectionCard>
      </section>
      <ReportsSectionCard title={t("Interpretacion ejecutiva", "Executive interpretation")} description={t("Lectura lista para gerencia y RRHH.", "Readout ready for management and HR.")}>
        <div className="reports-insight-grid">
          {data.insights.map((item) => (
            <ReportInsightCard key={item.title} title={item.title} description={item.description} tone={item.tone} />
          ))}
        </div>
      </ReportsSectionCard>
    </main>
  );
}
