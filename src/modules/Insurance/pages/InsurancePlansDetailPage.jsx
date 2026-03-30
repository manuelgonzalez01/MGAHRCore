import { Link, useParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceCostBreakdown from "../components/InsuranceCostBreakdown";
import InsuranceAuditTimeline from "../components/InsuranceAuditTimeline";
import InsuranceDependentsTable from "../components/InsuranceDependentsTable";
import InsuranceEnrollmentTable from "../components/InsuranceEnrollmentTable";
import InsuranceHeader from "../components/InsuranceHeader";
import InsuranceStatusBadge from "../components/InsuranceStatusBadge";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import useInsurancePlanDetail from "../hooks/useInsurancePlanDetail";

export default function InsurancePlansDetailPage() {
  const { planId } = useParams();
  const { t } = useInsuranceLocale();
  const { data, loading, error } = useInsurancePlanDetail(planId);

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando detalle del plan", "Loading plan detail")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No encontramos el plan", "Plan not found")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Plan Detail", "Plan Detail")}
        title={data.plan.name}
        description={`${data.plan.provider} - ${data.plan.coverageScope}`}
        actions={<Link className="suite-button-secondary" to="/insurance/plans">{t("Volver a planes", "Back to plans")}</Link>}
      />

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Condiciones del plan", "Plan terms")}</h2>
            <div className="insurance-detail-grid">
              <article className="suite-list-item"><span>{t("Tipo", "Type")}</span><strong>{data.plan.type}</strong></article>
              <article className="suite-list-item"><span>{t("Cobertura", "Coverage")}</span><strong>{data.plan.coverage}</strong></article>
              <article className="suite-list-item"><span>{t("Vigencia", "Validity")}</span><strong>{data.plan.effectiveFrom} - {data.plan.effectiveTo}</strong></article>
              <article className="suite-list-item"><span>{t("Participacion", "Cost split")}</span><strong>{data.plan.employerShare}% / {data.plan.employeeShare}%</strong></article>
              <article className="suite-list-item"><span>{t("Tipos elegibles", "Eligible employee types")}</span><strong>{(data.eligibility.employeeTypes || []).join(", ") || t("Todos", "All")}</strong></article>
              <article className="suite-list-item"><span>{t("Niveles elegibles", "Eligible levels")}</span><strong>{(data.eligibility.levels || []).join(", ") || t("Todos", "All")}</strong></article>
            </div>
            <p className="suite-muted">{data.plan.conditions}</p>
          </section>

          <section className="suite-card">
            <h2>{t("Afiliados del plan", "Plan enrollments")}</h2>
            <InsuranceEnrollmentTable items={data.enrollments} onAction={() => {}} actionLabel={t("Ver", "View")} />
          </section>

          <section className="suite-card">
            <h2>{t("Dependientes cubiertos", "Covered dependents")}</h2>
            <InsuranceDependentsTable items={data.dependents} />
          </section>
        </div>
        <div className="suite-rail">
          <InsuranceCostBreakdown
            currency={data.plan.companyCurrency}
            items={[
              { label: t("Costo empresa", "Company cost"), value: data.totals.employerCost, count: data.enrollments.length },
              { label: t("Costo empleado", "Employee cost"), value: data.totals.employeeCost, count: data.enrollments.length },
              { label: t("Costo total", "Total cost"), value: data.totals.totalCost, count: data.enrollments.length },
            ]}
            title={t("Breakdown financiero", "Financial breakdown")}
            description={t("Distribucion del costo actual del plan.", "Current cost distribution of the plan.")}
          />
          <section className="suite-card">
            <h2>{t("Movimientos vinculados", "Linked movements")}</h2>
            <div className="insurance-movement-list">
              {data.movements.map((item) => (
                <article className="suite-list-item" key={item.id}>
                  <span>{item.type}</span>
                  <strong>{item.employeeName}</strong>
                  <p className="suite-muted">{item.reason} - {item.effectiveDate}</p>
                  <InsuranceStatusBadge status={item.status} />
                </article>
              ))}
            </div>
          </section>
          <InsuranceAuditTimeline entries={data.auditLog} title={t("Auditoria del plan", "Plan audit")} />
          <section className="suite-card">
            <h2>{t("Trazabilidad temporal", "Temporal traceability")}</h2>
            <div className="insurance-timeline">
              {data.lifecycleEvents.map((event) => (
                <article key={event.id} className="suite-list-item">
                  <span>{event.effectiveDate}</span>
                  <strong>{event.employeeName}</strong>
                  <p className="suite-muted">{event.type} - {event.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
