import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useRecruitmentReports from "../hooks/useRecruitmentReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function RecruitmentReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useRecruitmentReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando recruitment intelligence", "Loading recruitment intelligence")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte de recruitment", "No recruitment report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Recruitment Analytics", "Recruitment Analytics")} title={t("Pipeline, conversion y source effectiveness", "Pipeline, conversion, and source effectiveness")} description={t("Lectura premium del funnel de seleccion conectada con posiciones, departamentos y cobertura.", "Premium readout of the hiring funnel connected to positions, departments, and coverage.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "positionId", "levelId", "period"]} />
      <ReportsKpiCards
        items={[
          { label: "Vacantes abiertas", value: data.summary.openPositions, format: "number" },
          { label: "Candidatos activos", value: data.summary.activeCandidates, format: "number" },
          { label: "Time to hire", value: data.summary.timeToHireDays, format: "number", helper: "Dias promedio" },
          { label: "Oferta conversion", value: data.summary.offerConversion, format: "percent" },
        ]}
      />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title="Pipeline por etapa" description="Volumen de pipeline actual.">
          <WorkforceDistributionTable title="Etapa" rows={data.pipeline} valueLabel="Volumen" />
        </ReportsSectionCard>
        <ReportsSectionCard title="Source effectiveness" description="Canales con mejor respuesta y score.">
          <WorkforceDistributionTable title="Fuente" rows={data.sourceEffectiveness} valueLabel="Score acumulado" />
        </ReportsSectionCard>
      </section>
    </main>
  );
}
