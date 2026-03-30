import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useVacationAnalytics from "../hooks/useVacationAnalytics";
import useReportsLocale from "../hooks/useReportsLocale";

export default function VacationReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useVacationAnalytics();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando analitica de ausencias", "Loading leave analytics")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de vacaciones", "No vacation report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Absenteeism & Leave Analytics", "Absenteeism & Leave Analytics")} title={t("Vacaciones, balances y patrones de ausencia", "Vacations, balances, and absence patterns")} description={t("Subsistema operativo de consumo, aprobaciones, balances y senales de absentismo.", "Operational subsystem for leave consumption, approvals, balances, and absenteeism signals.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "locationId", "period", "status"]} />
      <ReportsKpiCards
        items={[
          { label: "Dias consumidos", value: data.summary.consumedDays, format: "number" },
          { label: "Pendientes", value: data.summary.pendingApprovals, format: "number" },
          { label: "Balance medio", value: data.summary.averageBalance, format: "number" },
          { label: "Senales de ausentismo", value: data.summary.absenteeismSignals, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title="Consumo por departamento" description="Carga de tiempo fuera por area.">
          <WorkforceDistributionTable title="Departamento" rows={data.consumptionByDepartment} valueLabel="Dias" />
        </ReportsSectionCard>
        <ReportsSectionCard title="Pendientes por manager" description="Cuellos de botella en aprobacion.">
          <WorkforceDistributionTable title="Manager" rows={data.approvalsByManager} valueLabel="Solicitudes" />
        </ReportsSectionCard>
      </section>
    </main>
  );
}
