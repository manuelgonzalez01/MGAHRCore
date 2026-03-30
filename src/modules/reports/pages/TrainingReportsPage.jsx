import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import TrainingCompliancePanel from "../components/TrainingCompliancePanel";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useTrainingReports from "../hooks/useTrainingReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function TrainingReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useTrainingReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando training analytics", "Loading training analytics")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de desarrollo", "No development report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Development Analytics", "Development Analytics")} title={t("Capacitacion, evaluacion y skills coverage", "Training, evaluations, and skills coverage")} description={t("Lectura corporativa del readiness del talento, cumplimiento de planes y senales de desarrollo.", "Corporate readout of talent readiness, plan compliance, and development signals.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "levelId", "employeeType", "status"]} />
      <ReportsKpiCards
        items={[
          { label: t("Empleados trazados", "Tracked employees"), value: data.summary.trackedEmployees, format: "number" },
          { label: t("Completion medio", "Average completion"), value: data.summary.averageCompletion, format: "percent" },
          { label: t("Planes activos", "Active plans"), value: data.summary.activePlans, format: "number" },
          { label: t("Critical gaps", "Critical gaps"), value: data.summary.criticalGaps, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Participacion por departamento", "Participation by department")} description={t("Donde se concentra el esfuerzo formativo.", "Where training effort is concentrated.")}>
          <WorkforceDistributionTable title={t("Departamento", "Department")} rows={data.participationByDepartment} valueLabel={t("Activos", "Assets")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Completion por manager", "Completion by manager")} description={t("Cumplimiento visible por jefatura.", "Visible completion by manager.")}>
          <WorkforceDistributionTable title={t("Manager", "Manager")} rows={data.completionByManager} valueLabel={t("Avance", "Completion")} />
        </ReportsSectionCard>
      </section>
      <ReportsSectionCard title={t("Talento prioritario", "Priority talent")} description={t("Personas que requieren seguimiento por gap o cumplimiento.", "Employees who require follow-up due to gaps or compliance status.")}>
        <TrainingCompliancePanel records={data.priorityEmployees} />
      </ReportsSectionCard>
    </main>
  );
}
