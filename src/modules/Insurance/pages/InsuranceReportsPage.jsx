import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceCostBreakdown from "../components/InsuranceCostBreakdown";
import InsuranceHeader from "../components/InsuranceHeader";
import InsuranceStatsCards from "../components/InsuranceStatsCards";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import useInsuranceReportsWorkspace from "../hooks/useInsuranceReportsWorkspace";

export default function InsuranceReportsPage() {
  const { t } = useInsuranceLocale();
  const { data, loading, error } = useInsuranceReportsWorkspace();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando reportes de seguros", "Loading insurance reports")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar reportes", "Could not load reports")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Insurance Reporting", "Insurance Reporting")}
        title={t("Analitica operativa de seguros", "Insurance operational analytics")}
        description={t("Lectura ejecutiva de costo, cobertura, dependientes y movimientos del beneficio.", "Executive readout of cost, coverage, dependents, and benefit movements.")}
      />
      <InsuranceStatsCards
        items={[
          { label: t("Costo total", "Total cost"), value: `${data.stats.currency} ${data.stats.totalCost}`, helper: t("Costo consolidado de cobertura activa.", "Consolidated cost of active coverage.") },
          { label: t("Movimientos pendientes", "Pending movements"), value: data.stats.pendingMovements, helper: t("Cambios aun no cerrados operativamente.", "Changes not yet operationally closed.") },
          { label: t("Dependientes cubiertos", "Covered dependents"), value: data.stats.coveredDependents, helper: t("Carga familiar asegurada.", "Covered family load.") },
          { label: t("Exclusiones", "Exclusions"), value: data.stats.exclusions, helper: t("Bajas o limitaciones recientes.", "Recent terminations or coverage limitations.") },
        ]}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <InsuranceCostBreakdown items={data.costByCompany} currency={data.stats.currency} title={t("Costo por compania", "Cost by company")} description={t("Donde se concentra el gasto del beneficio.", "Where benefit spend is concentrated.")} />
          <InsuranceCostBreakdown items={data.costByPlan} currency={data.stats.currency} title={t("Costo por plan", "Cost by plan")} description={t("Peso economico por producto de seguro.", "Economic weight by insurance product.")} />
        </div>
        <div className="suite-rail">
          <InsuranceCostBreakdown items={data.providerMix} currency={data.stats.currency} title={t("Mix de proveedores", "Provider mix")} description={t("Base de planes distribuidos por proveedor.", "Plan base distributed by provider.")} />
          <InsuranceCostBreakdown items={data.pendingMovements.map((item) => ({ label: item.employeeName, value: 1, count: 1 }))} currency={data.stats.currency} title={t("Pendientes por resolver", "Pending to resolve")} description={t("Casos en cola operativa o con trazabilidad abierta.", "Cases still in queue or with open traceability.")} />
        </div>
      </section>
    </main>
  );
}
