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
import useLegalReports from "../hooks/useLegalReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function LegalReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useLegalReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando compliance intelligence", "Loading compliance intelligence")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte legal", "No legal report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Compliance / Risk Reporting", "Compliance / Risk Reporting")} title={t("Documentos, pendientes regulatorios y alertas", "Documents, regulatory pending items, and alerts")} description={t("Lectura de cumplimiento documental, aprobaciones criticas y empleados con expediente incompleto.", "Readout of documentary compliance, critical approvals, and employees with incomplete files.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "locationId", "status", "period"]} />
      <ReportsKpiCards
        items={[
          { label: "Docs vencidos", value: data.summary.expiredDocuments, format: "number" },
          { label: "Aprobaciones criticas", value: data.summary.pendingCriticalApprovals, format: "number" },
          { label: "Expedientes incompletos", value: data.summary.incompleteFiles, format: "number" },
          { label: "Conflictos", value: data.summary.policyConflicts, format: "number" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title="Riesgo documental" description="Documentos vencidos o en ventana critica.">
          <LegalRiskPanel records={data.expiredDocuments} />
        </ReportsSectionCard>
        <ReportsSectionCard title="Aprobaciones y alertas" description="Cola critica que puede afectar cumplimiento o control interno.">
          <LegalRiskPanel records={data.criticalApprovals} />
        </ReportsSectionCard>
      </section>
      <ReportsSectionCard title="Heatmap de riesgo" description="Dominios donde el riesgo se concentra actualmente.">
        <WorkforceDistributionTable title="Dominio" rows={data.riskByDomain.map((item) => ({ label: item.label, count: item.count, value: item.count }))} valueLabel="Incidentes" />
      </ReportsSectionCard>
    </main>
  );
}
