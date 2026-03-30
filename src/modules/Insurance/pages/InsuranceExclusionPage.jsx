import { useMemo, useState } from "react";
import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceEnrollmentTable from "../components/InsuranceEnrollmentTable";
import InsuranceFilters from "../components/InsuranceFilters";
import InsuranceAuditTimeline from "../components/InsuranceAuditTimeline";
import InsuranceHeader from "../components/InsuranceHeader";
import InsuranceStatusBadge from "../components/InsuranceStatusBadge";
import InsuranceWorkflowPanel from "../components/InsuranceWorkflowPanel";
import useInsuranceExclusion from "../hooks/useInsuranceExclusion";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { saveInsuranceExclusion, transitionInsuranceWorkflow } from "../services/insuranceEnrollment.service";

function createInitialForm() {
  return {
    enrollmentId: "",
    type: "exclusion",
    newPlanId: "",
    reason: "",
    effectiveDate: "",
    status: "submitted",
    comments: "",
  };
}

export default function InsuranceExclusionPage() {
  const { t } = useInsuranceLocale();
  const { data, filters, options, loading, error, setFilter, resetFilters, reload } = useInsuranceExclusion();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const enrollment = useMemo(() => data?.activeEnrollments.find((item) => item.id === form.enrollmentId) || null, [data, form.enrollmentId]);
  const selectedMovement = useMemo(() => data?.movements.find((item) => item.enrollmentId === form.enrollmentId) || null, [data, form.enrollmentId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setFeedback("");
    try {
      await saveInsuranceExclusion(form);
      setFeedback(t("Movimiento de exclusion registrado correctamente.", "Exclusion change successfully registered."));
      setForm(createInitialForm());
      reload();
    } catch (submitFailure) {
      setSubmitError(submitFailure.message);
    }
  }

  async function handleTransition(action) {
    if (!selectedMovement) {
      return;
    }

    setSubmitError("");
    setFeedback("");
    try {
      await transitionInsuranceWorkflow({
        entityId: selectedMovement.id,
        entityType: "movement",
        action,
        comment: t("Transicion ejecutada desde la bandeja de cambios.", "Transition executed from the change workspace."),
      });
      setFeedback(t("Workflow del movimiento actualizado.", "Movement workflow updated."));
      reload();
    } catch (submitFailure) {
      setSubmitError(submitFailure.message);
    }
  }

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando movimientos de seguro", "Loading insurance changes")}</h1></section></main>;
  }

  if (error) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar exclusiones", "Could not load exclusions")}</h1><p>{error.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Insurance Operations", "Insurance Operations")}
        title={t("Bajas y cambios de cobertura", "Exclusions and plan changes")}
        description={t("Controla salidas, cambios de plan, fechas efectivas y trazabilidad operativa.", "Control terminations, plan changes, effective dates, and operational traceability.")}
      />
      <InsuranceFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Afiliaciones activas con accion", "Active enrollments requiring action")}</h2>
            <InsuranceEnrollmentTable items={data.activeEnrollments} mode="changes" onAction={(item) => setForm((current) => ({ ...current, enrollmentId: item.id, newPlanId: "", comments: item.notes || "" }))} actionLabel={t("Gestionar", "Manage")} />
          </section>
          <section className="suite-card">
            <h2>{t("Historial de movimientos", "Movement trail")}</h2>
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
        </div>
        <div className="suite-grid">
        <section className="suite-card">
          <h2>{t("Registrar baja o cambio", "Register exclusion or plan change")}</h2>
          {feedback ? <p className="insurance-feedback">{feedback}</p> : null}
          {submitError ? <p className="insurance-feedback insurance-feedback-error">{submitError}</p> : null}
          <form className="insurance-form-grid" onSubmit={handleSubmit}>
            <label>
              <span>{t("Afiliacion", "Enrollment")}</span>
              <select value={form.enrollmentId} onChange={(event) => setForm((current) => ({ ...current, enrollmentId: event.target.value }))} required>
                <option value="">{t("Selecciona una afiliacion", "Select an enrollment")}</option>
                {data.activeEnrollments.map((item) => <option key={item.id} value={item.id}>{item.employeeName} - {item.planName}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Tipo de movimiento", "Movement type")}</span>
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="exclusion">{t("Baja", "Exclusion")}</option>
                <option value="plan_change">{t("Cambio de plan", "Plan change")}</option>
              </select>
            </label>
            {form.type === "plan_change" ? (
              <label>
                <span>{t("Nuevo plan", "New plan")}</span>
                <select value={form.newPlanId} onChange={(event) => setForm((current) => ({ ...current, newPlanId: event.target.value }))}>
                  <option value="">{t("Selecciona un plan", "Select a plan")}</option>
                  {data.plans.filter((plan) => !enrollment || plan.companyId === enrollment.companyId).map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>{t("Fecha efectiva", "Effective date")}</span>
              <input type="date" value={form.effectiveDate} onChange={(event) => setForm((current) => ({ ...current, effectiveDate: event.target.value }))} required />
            </label>
            <label>
              <span>{t("Motivo", "Reason")}</span>
              <input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} required />
            </label>
            <label className="insurance-form-span-2">
              <span>{t("Comentarios", "Comments")}</span>
              <textarea value={form.comments} onChange={(event) => setForm((current) => ({ ...current, comments: event.target.value }))} />
            </label>
            <div className="suite-inline-actions insurance-form-span-2">
              <button className="suite-button" type="submit">{t("Registrar movimiento", "Register movement")}</button>
            </div>
          </form>
        </section>
        <InsuranceWorkflowPanel item={selectedMovement} onTransition={handleTransition} />
        <InsuranceAuditTimeline entries={data.auditLog} title={t("Auditoria de movimientos", "Movement audit")} />
        <section className="suite-card">
          <h2>{t("Eventos de vida y cobertura", "Life and coverage events")}</h2>
          <div className="insurance-timeline">
            {data.lifecycleEvents.map((item) => (
              <article key={item.id} className="suite-list-item">
                <span>{item.effectiveDate}</span>
                <strong>{item.employeeName}</strong>
                <p className="suite-muted">{item.type} - {item.description}</p>
              </article>
            ))}
          </div>
        </section>
        </div>
      </section>
    </main>
  );
}
