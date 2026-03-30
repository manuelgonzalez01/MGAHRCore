import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useOccupationalHealthReports from "../hooks/useOccupationalHealthReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function OccupationalHealthReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useOccupationalHealthReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando analitica de salud ocupacional", "Loading occupational health analytics")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de salud ocupacional", "No occupational health report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Occupational Health Analytics", "Occupational Health Analytics")} title={t("Visitas medicas, incidentes y laboratorio", "Medical visits, incidents, and laboratory monitoring")} description={t("Conecta salud ocupacional con estructura, areas y monitoreo preventivo dentro del ecosistema HR.", "Connects occupational health with structure, areas, and preventive monitoring inside the HR ecosystem.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "locationId", "status"]} />
      <ReportsKpiCards
        items={[
          { label: t("Visitas", "Visits"), value: data.summary.visits, format: "number" },
          { label: t("Casos abiertos", "Open cases"), value: data.summary.openCases, format: "number" },
          { label: t("Labs pendientes", "Pending labs"), value: data.summary.pendingLabs, format: "number" },
          { label: t("Empleados monitoreados", "Monitored employees"), value: data.summary.monitoredEmployees, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Incidentes por area", "Incidents by area")} description={t("Lectura de concentracion operativa de casos.", "Operational readout of incident concentration.")}>
          <WorkforceDistributionTable title={t("Departamento", "Department")} rows={data.byDepartment} valueLabel={t("Incidentes", "Incidents")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Estado de visitas", "Visit status")} description={t("Distribucion del seguimiento ocupacional.", "Distribution of occupational follow-up status.")}>
          <WorkforceDistributionTable title={t("Estado", "Status")} rows={data.byVisitStatus} valueLabel={t("Volumen", "Volume")} />
        </ReportsSectionCard>
      </section>
    </main>
  );
}
