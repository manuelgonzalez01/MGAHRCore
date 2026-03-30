import "../../shared/hrSuite.css";
import "../reports.css";
import LegalRiskPanel from "../components/LegalRiskPanel";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useInsuranceReports from "../hooks/useInsuranceReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function InsuranceReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useInsuranceReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando analitica de seguros", "Loading insurance analytics")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de seguros", "No insurance report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Insurance Analytics", "Insurance Analytics")} title={t("Cobertura, inclusiones y exclusiones", "Coverage, inclusions, and exclusions")} description={t("Integra dependientes, cobertura activa y alertas de exclusion dentro de la capa analitica corporativa.", "Integrates dependents, active coverage, and exclusion alerts within the corporate analytics layer.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "employeeType", "status"]} />
      <ReportsKpiCards
        items={[
          { label: t("Planes activos", "Active plans"), value: data.summary.activePlans, format: "number" },
          { label: t("Colaboradores cubiertos", "Covered employees"), value: data.summary.coveredEmployees, format: "number" },
          { label: t("Dependientes cubiertos", "Covered dependents"), value: data.summary.coveredDependents, format: "number" },
          { label: t("Exclusiones", "Exclusions"), value: data.summary.exclusions, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Cobertura por plan", "Coverage by plan")} description={t("Distribucion actual de afiliacion.", "Current affiliation distribution.")}>
          <WorkforceDistributionTable title={t("Plan", "Plan")} rows={data.byPlan} valueLabel={t("Volumen", "Volume")} />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Cobertura por compania", "Coverage by company")} description={t("Lectura multiempresa de beneficio activo.", "Multi-company view of active coverage.")}>
          <WorkforceDistributionTable title={t("Compania", "Company")} rows={data.byCompany} valueLabel={t("Volumen", "Volume")} />
        </ReportsSectionCard>
      </section>
      <ReportsSectionCard title={t("Exclusiones y bloqueos", "Exclusions and blockers")} description={t("Casos donde la cobertura no se activa o queda limitada.", "Cases where coverage cannot be activated or remains limited.")}>
        <LegalRiskPanel records={data.exclusions} />
      </ReportsSectionCard>
    </main>
  );
}
