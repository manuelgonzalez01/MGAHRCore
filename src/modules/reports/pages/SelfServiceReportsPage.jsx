import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useReportsLocale from "../hooks/useReportsLocale";
import useSelfServiceReports from "../hooks/useSelfServiceReports";

export default function SelfServiceReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useSelfServiceReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando analitica de autoservicio", "Loading self-service analytics")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de autoservicio", "No self-service report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Self-Service Analytics", "Self-Service Analytics")} title={t("Solicitudes y aprobaciones visibles al colaborador", "Employee-visible requests and approvals")} description={t("Conecta autoservicio con permisos, licencias, aprobaciones y balance visible para el empleado.", "Connects self-service with permissions, leaves, approvals, and visible employee balance.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "status"]} />
      <ReportsKpiCards
        items={[
          { label: t("Solicitudes pendientes", "Pending requests"), value: data.summary.pendingRequests, format: "number" },
          { label: t("Solicitudes aprobadas", "Approved requests"), value: data.summary.approvedRequests, format: "number" },
          { label: t("Aprobaciones visibles", "Visible approvals"), value: data.summary.visibleApprovals, format: "number" },
          { label: t("Balance vacacional visible", "Visible vacation balance"), value: data.summary.vacationBalance, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Solicitudes por tipo", "Requests by type")} description={t("Permisos y licencias consumidos desde autoservicio.", "Permissions and leave requests consumed through self-service.")}>
          <WorkforceDistributionTable title={t("Tipo", "Type")} rows={data.byType} valueLabel={t("Volumen", "Volume")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Cola de aprobaciones", "Approval queue")} description={t("Solicitudes pendientes visibles desde el punto de vista del colaborador.", "Pending items visible from the employee-facing experience.")}>
          <div className="reports-list">
            {data.approvalQueue.map((item) => (
              <article key={item.id}>
                <strong>{item.type}</strong>
                <p className="reports-muted">{item.requester} | {item.currentLevel}</p>
              </article>
            ))}
          </div>
        </ReportsSectionCard>
      </section>
    </main>
  );
}
