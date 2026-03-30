import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceCostBreakdown from "../components/InsuranceCostBreakdown";
import InsuranceHeader from "../components/InsuranceHeader";
import InsuranceStatsCards from "../components/InsuranceStatsCards";
import InsuranceStatusBadge from "../components/InsuranceStatusBadge";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useInsuranceDashboard from "../hooks/useInsuranceDashboard";
import useInsuranceLocale from "../hooks/useInsuranceLocale";

export default function InsuranceHomePage() {
  const { t, language } = useInsuranceLocale();
  const { data, loading, error } = useInsuranceDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando seguros y beneficios", "Loading insurance and benefits")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar Insurance", "Could not load Insurance")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Insurance & Benefits", "Insurance & Benefits")}
        title={t("Centro operativo de seguros", "Insurance operations hub")}
        description={t("Consolida planes, afiliaciones, dependientes, costos y movimientos de cobertura desde una vista ejecutiva y operativa.", "Consolidates plans, enrollments, dependents, costs, and coverage movements in an executive and operational workspace.")}
        badges={[
          { label: t("Planes activos", "Active plans"), value: data.stats.activePlans, tone: "info" },
          { label: t("Movimientos pendientes", "Pending changes"), value: data.stats.pendingMovements, tone: "warning" },
        ]}
        actions={(
          <>
            <Link className="suite-button-secondary" to="/insurance/plans">{t("Planes", "Plans")}</Link>
            <Link className="suite-button-secondary" to="/insurance/inclusion">{t("Afiliaciones", "Enrollments")}</Link>
            <Link className="suite-button" to="/insurance/reports">{t("Analitica", "Analytics")}</Link>
          </>
        )}
      />

      <InsuranceStatsCards
        items={[
          { label: t("Colaboradores cubiertos", "Covered employees"), value: data.stats.coveredEmployees, helper: t("Afiliaciones activas consolidadas.", "Active enrollments consolidated.") },
          { label: t("Dependientes cubiertos", "Covered dependents"), value: data.stats.coveredDependents, helper: t("Dependientes actualmente incluidos en poliza.", "Dependents currently covered in plans.") },
          { label: t("Costo empresa", "Company cost"), value: `${data.stats.currency} ${data.stats.companyCost}`, helper: t("Participacion asumida por la empresa.", "Employer share across active enrollments.") },
          { label: t("Costo empleado", "Employee cost"), value: `${data.stats.currency} ${data.stats.employeeCost}`, helper: t("Aporte del colaborador en el beneficio.", "Employee share across benefit plans.") },
        ]}
      />

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="suite-card-head">
              <div>
                <h2>{t("Portafolio de planes", "Plan portfolio")}</h2>
                <p className="suite-muted">{t("Lectura resumida de tipos, proveedor y cobertura vigente.", "Summary of plan type, provider, and current scope.")}</p>
              </div>
              <Link className="suite-button-secondary" to="/insurance/plans">{t("Gestionar", "Manage")}</Link>
            </div>
            <div className="insurance-plan-grid">
              {data.plansCatalog.map((item) => (
                <article key={item.id} className="suite-list-item">
                  <span>{item.provider}</span>
                  <strong>{item.name}</strong>
                  <p className="suite-muted">{item.coverage} · {item.premium}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="suite-card">
            <div className="suite-card-head">
              <div>
                <h2>{t("Movimientos recientes", "Recent movements")}</h2>
                <p className="suite-muted">{t("Altas, bajas y cambios operativos mas recientes.", "Most recent inclusions, exclusions, and plan changes.")}</p>
              </div>
              <Link className="suite-button-secondary" to="/insurance/exclusion">{t("Gestionar cambios", "Manage changes")}</Link>
            </div>
            <div className="insurance-movement-list">
              {data.movements.map((item) => (
                <article key={item.id} className="suite-list-item">
                  <span>{item.type}</span>
                  <strong>{item.employeeName}</strong>
                  <p className="suite-muted">{item.reason} · {item.effectiveDate}</p>
                  <InsuranceStatusBadge status={item.status} />
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="suite-rail">
          <InsuranceCostBreakdown items={data.costByCompany} currency={data.stats.currency} title={t("Costo por compania", "Cost by company")} description={t("Distribucion multiempresa del costo total.", "Cross-company distribution of total coverage cost.")} />
          <InsuranceCostBreakdown items={data.costByPlan} currency={data.stats.currency} title={t("Costo por plan", "Cost by plan")} description={t("Que planes concentran mayor gasto y volumen.", "Which plans concentrate the highest spend and volume.")} />
        </div>
      </section>
      <ModuleConnectionsPanel moduleKey="insurance" language={language} />
    </main>
  );
}
