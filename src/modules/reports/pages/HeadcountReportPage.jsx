import "../../shared/hrSuite.css";
import "../reports.css";
import HeadcountSummaryPanel from "../components/HeadcountSummaryPanel";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useHeadcountReport from "../hooks/useHeadcountReport";
import useReportsLocale from "../hooks/useReportsLocale";

export default function HeadcountReportPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useHeadcountReport();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando headcount report", "Loading headcount report")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de headcount", "No headcount report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Executive Reports", "Executive Reports")} title={t("Headcount y composicion organizacional", "Headcount and organizational composition")} description={t("Distribucion ejecutiva por compania, departamento, localizacion, posicion y nivel.", "Executive distribution by company, department, location, position, and level.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "locationId", "departmentId", "positionId", "levelId", "employeeType", "status"]} />
      <ReportsKpiCards
        items={[
          { label: t("Headcount", "Headcount"), value: data.summary.headcount, format: "number" },
          { label: t("Activos", "Active"), value: data.summary.activeEmployees, format: "number" },
          { label: t("Inactivos", "Inactive"), value: data.summary.inactiveEmployees, format: "number" },
          { label: t("Tenure promedio", "Average tenure"), value: data.summary.averageTenure, helper: t("Meses promedio", "Average months"), format: "number" },
        ]}
      />
      <HeadcountSummaryPanel summary={data.summary} />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Compania", "Company")} description={t("Distribucion y acumulado por compania.", "Distribution and aggregate by company.")}>
          <WorkforceDistributionTable title={t("Compania", "Company")} rows={data.distribution.companies} valueLabel={t("Acumulado", "Accumulated")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Departamento", "Department")} description={t("Lectura de capacidad por area funcional.", "Capacity readout by functional area.")}>
          <WorkforceDistributionTable title={t("Departamento", "Department")} rows={data.distribution.departments} valueLabel={t("Acumulado", "Accumulated")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Localizacion", "Location")} description={t("Cobertura geografia y densidad por sede.", "Geographic coverage and density by site.")}>
          <WorkforceDistributionTable title={t("Localizacion", "Location")} rows={data.distribution.locations} valueLabel={t("Acumulado", "Accumulated")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Posicion y nivel", "Position and level")} description={t("Lectura detallada de estructura organizacional.", "Detailed readout of organizational structure.")}>
          <WorkforceDistributionTable title={t("Posicion", "Position")} rows={data.distribution.positions.slice(0, 8)} valueLabel={t("Acumulado", "Accumulated")} />
        </ReportsSectionCard>
      </section>
    </main>
  );
}
