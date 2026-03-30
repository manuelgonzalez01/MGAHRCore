import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceEnrollmentTable from "../components/InsuranceEnrollmentTable";
import InsuranceFilters from "../components/InsuranceFilters";
import InsuranceAuditTimeline from "../components/InsuranceAuditTimeline";
import InsuranceHeader from "../components/InsuranceHeader";
import InsuranceWorkflowPanel from "../components/InsuranceWorkflowPanel";
import useInsuranceInclusion from "../hooks/useInsuranceInclusion";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { saveInsuranceEnrollment, transitionInsuranceWorkflow } from "../services/insuranceEnrollment.service";

function createInitialForm() {
  return {
    employeeId: "",
    planId: "",
    dependentIds: [],
    status: "active",
    effectiveDate: "",
    reason: "",
    notes: "",
  };
}

export default function InsuranceInclusionPage() {
  const { t } = useInsuranceLocale();
  const [searchParams] = useSearchParams();
  const { data, filters, options, loading, error, setFilter, resetFilters, reload } = useInsuranceInclusion();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const employeeParam = searchParams.get("employee") || "";
  const effectiveEmployeeId = form.employeeId || employeeParam;
  const selectedEmployee = useMemo(() => data?.employees.find((item) => item.id === effectiveEmployeeId) || null, [data, effectiveEmployeeId]);
  const availablePlans = useMemo(() => data?.plans.filter((plan) => !selectedEmployee || plan.companyId === selectedEmployee.companyId) || [], [data, selectedEmployee]);
  const effectivePlanId = form.planId || (selectedEmployee ? availablePlans[0]?.id || "" : "");
  const selectedEnrollment = useMemo(() => data?.enrollments.find((item) => item.id === form.id) || null, [data, form.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setFeedback("");
    try {
      await saveInsuranceEnrollment({
        ...form,
        employeeId: effectiveEmployeeId,
        planId: effectivePlanId,
      });
      setFeedback(t("Afiliacion registrada correctamente.", "Enrollment successfully registered."));
      setForm(createInitialForm());
      reload();
    } catch (submitFailure) {
      setSubmitError(submitFailure.message);
    }
  }

  async function handleTransition(action) {
    if (!selectedEnrollment) {
      return;
    }

    setSubmitError("");
    setFeedback("");
    try {
      await transitionInsuranceWorkflow({
        entityId: selectedEnrollment.id,
        entityType: "enrollment",
        action,
        comment: t("Transicion ejecutada desde Insurance.", "Transition executed from Insurance."),
      });
      setFeedback(t("Workflow actualizado correctamente.", "Workflow updated successfully."));
      reload();
    } catch (submitFailure) {
      setSubmitError(submitFailure.message);
    }
  }

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando afiliaciones", "Loading enrollments")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar inclusiones", "Could not load inclusions")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Enrollment Control", "Enrollment Control")}
        title={t("Afiliaciones y nuevos ingresos", "Enrollments and new joiners")}
        description={t("Gestiona altas, cobertura de dependientes y asignacion operativa de plan.", "Manage inclusions, dependent coverage, and operational plan assignment.")}
      />
      <InsuranceFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Colaboradores elegibles", "Eligible employees")}</h2>
            <InsuranceEnrollmentTable items={data.eligibleEmployees} onAction={(item) => setForm((current) => ({ ...current, employeeId: item.employeeId, planId: item.recommendedPlanId, dependentIds: [] }))} actionLabel={t("Afiliar", "Enroll")} />
          </section>
          <section className="suite-card">
            <h2>{t("Afiliaciones activas", "Active enrollments")}</h2>
            <InsuranceEnrollmentTable items={data.enrollments} onAction={(item) => setForm((current) => ({ ...current, employeeId: item.employeeId, planId: item.planId, dependentIds: item.dependentIds || [], effectiveDate: item.effectiveDate, notes: item.notes || "", id: item.id }))} actionLabel={t("Editar", "Edit")} />
          </section>
        </div>
        <div className="suite-grid">
        <section className="suite-card">
          <h2>{t("Registrar afiliacion", "Register enrollment")}</h2>
          {feedback ? <p className="insurance-feedback">{feedback}</p> : null}
          {submitError ? <p className="insurance-feedback insurance-feedback-error">{submitError}</p> : null}
          <form className="insurance-form-grid" onSubmit={handleSubmit}>
            <label>
              <span>{t("Colaborador", "Employee")}</span>
              <select value={effectiveEmployeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value, dependentIds: [] }))} required>
                <option value="">{t("Selecciona un colaborador", "Select an employee")}</option>
                {data.eligibleEmployees.concat(data.enrollments).map((item) => <option key={item.employeeId || item.id} value={item.employeeId}>{item.employeeName}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Plan", "Plan")}</span>
              <select value={effectivePlanId} onChange={(event) => setForm((current) => ({ ...current, planId: event.target.value }))} required>
                <option value="">{t("Selecciona un plan", "Select a plan")}</option>
                {availablePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Fecha efectiva", "Effective date")}</span>
              <input type="date" value={form.effectiveDate} onChange={(event) => setForm((current) => ({ ...current, effectiveDate: event.target.value }))} required />
            </label>
            <label>
              <span>{t("Estado", "Status")}</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">{t("Activo", "Active")}</option>
                <option value="pending">{t("Pendiente", "Pending")}</option>
              </select>
            </label>
            <label className="insurance-form-span-2">
              <span>{t("Dependientes cubiertos", "Covered dependents")}</span>
              <select multiple value={form.dependentIds} onChange={(event) => setForm((current) => ({ ...current, dependentIds: [...event.target.selectedOptions].map((option) => option.value) }))}>
                {(selectedEmployee?.dependents || []).map((dependent) => <option key={dependent.id} value={dependent.id}>{dependent.name} - {dependent.relationship}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Motivo", "Reason")}</span>
              <input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
            </label>
            <label className="insurance-form-span-2">
              <span>{t("Notas", "Notes")}</span>
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <div className="suite-inline-actions insurance-form-span-2">
              <button className="suite-button" type="submit">{t("Guardar afiliacion", "Save enrollment")}</button>
            </div>
          </form>
        </section>
        <InsuranceWorkflowPanel item={selectedEnrollment} onTransition={handleTransition} />
        <InsuranceAuditTimeline entries={data.auditLog} title={t("Auditoria de afiliaciones", "Enrollment audit")} />
        <section className="suite-card">
          <h2>{t("Eventos de vida relevantes", "Relevant life events")}</h2>
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
