import { useState } from "react";
import "../../shared/hrSuite.css";
import "../insurance.css";
import InsuranceFilters from "../components/InsuranceFilters";
import InsuranceAuditTimeline from "../components/InsuranceAuditTimeline";
import InsuranceHeader from "../components/InsuranceHeader";
import InsurancePlansTable from "../components/InsurancePlansTable";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import useInsurancePlans from "../hooks/useInsurancePlans";
import { saveInsurancePlan } from "../services/insurancePlans.service";

function createInitialForm() {
  return {
    id: "",
    companyId: "",
    name: "",
    provider: "",
    type: "",
    coverageScope: "",
    status: "active",
    effectiveFrom: "",
    effectiveTo: "",
    employerShare: 75,
    employeeShare: 25,
    baseEmployeeCost: 0,
    baseDependentCost: 0,
    allowedEmployeeTypes: [],
    allowedLevelIds: [],
    coverage: "",
    conditions: "",
    deductible: 0,
  };
}

export default function InsurancePlansPage() {
  const { t } = useInsuranceLocale();
  const { data, filters, options, loading, error, setFilter, resetFilters, reload } = useInsurancePlans();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setFeedback("");
    try {
      await saveInsurancePlan(form);
      setFeedback(t("Plan guardado correctamente.", "Plan successfully saved."));
      setForm(createInitialForm());
      reload();
    } catch (submitFailure) {
      setSubmitError(submitFailure.message);
    }
  }

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando planes", "Loading plans")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar planes", "Could not load plans")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page insurance-page">
      <InsuranceHeader
        eyebrow={t("Plan Governance", "Plan Governance")}
        title={t("Planes y proveedores", "Plans and providers")}
        description={t("Administra portafolio, vigencia, costos y condiciones de cada plan de beneficios.", "Manage portfolio, validity, costs, and conditions for every benefit plan.")}
      />
      <InsuranceFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Tabla de planes", "Plans table")}</h2>
            <InsurancePlansTable items={data.plans} onEdit={(item) => setForm(item)} />
          </section>
          <InsuranceAuditTimeline entries={data.auditLog} title={t("Auditoria de planes", "Plan audit")} />
        </div>

        <section className="suite-card">
          <h2>{form.id ? t("Editar plan", "Edit plan") : t("Crear plan", "Create plan")}</h2>
          {feedback ? <p className="insurance-feedback">{feedback}</p> : null}
          {submitError ? <p className="insurance-feedback insurance-feedback-error">{submitError}</p> : null}
          <form className="insurance-form-grid" onSubmit={handleSubmit}>
            <label><span>{t("Compania", "Company")}</span><select value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))} required><option value="">{t("Selecciona una compania", "Select a company")}</option>{options.companies.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>{t("Nombre del plan", "Plan name")}</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label>
            <label><span>{t("Proveedor", "Provider")}</span><input value={form.provider} onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))} required /></label>
            <label><span>{t("Tipo", "Type")}</span><input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} required /></label>
            <label><span>{t("Cobertura", "Coverage")}</span><input value={form.coverageScope} onChange={(event) => setForm((current) => ({ ...current, coverageScope: event.target.value }))} required /></label>
            <label><span>{t("Estado", "Status")}</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="active">{t("Activo", "Active")}</option><option value="inactive">{t("Inactivo", "Inactive")}</option></select></label>
            <label><span>{t("Inicio", "Start")}</span><input type="date" value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></label>
            <label><span>{t("Fin", "End")}</span><input type="date" value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></label>
            <label><span>{t("Costo colaborador", "Employee base cost")}</span><input type="number" value={form.baseEmployeeCost} onChange={(event) => setForm((current) => ({ ...current, baseEmployeeCost: event.target.value }))} /></label>
            <label><span>{t("Costo dependiente", "Dependent cost")}</span><input type="number" value={form.baseDependentCost} onChange={(event) => setForm((current) => ({ ...current, baseDependentCost: event.target.value }))} /></label>
            <label><span>{t("Aporte empresa %", "Employer share %")}</span><input type="number" value={form.employerShare} onChange={(event) => setForm((current) => ({ ...current, employerShare: event.target.value }))} /></label>
            <label><span>{t("Aporte empleado %", "Employee share %")}</span><input type="number" value={form.employeeShare} onChange={(event) => setForm((current) => ({ ...current, employeeShare: event.target.value }))} /></label>
            <label><span>{t("Deducible", "Deductible")}</span><input type="number" value={form.deductible} onChange={(event) => setForm((current) => ({ ...current, deductible: event.target.value }))} /></label>
            <label>
              <span>{t("Tipos de colaborador elegibles", "Eligible employee types")}</span>
              <select multiple value={form.allowedEmployeeTypes} onChange={(event) => setForm((current) => ({ ...current, allowedEmployeeTypes: [...event.target.selectedOptions].map((option) => option.value) }))}>
                {options.employeeTypes.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Niveles elegibles", "Eligible levels")}</span>
              <select multiple value={form.allowedLevelIds} onChange={(event) => setForm((current) => ({ ...current, allowedLevelIds: [...event.target.selectedOptions].map((option) => option.value) }))}>
                {options.levels.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="insurance-form-span-2"><span>{t("Detalle de cobertura", "Coverage details")}</span><textarea value={form.coverage} onChange={(event) => setForm((current) => ({ ...current, coverage: event.target.value }))} /></label>
            <label className="insurance-form-span-2"><span>{t("Condiciones", "Conditions")}</span><textarea value={form.conditions} onChange={(event) => setForm((current) => ({ ...current, conditions: event.target.value }))} /></label>
            <div className="suite-inline-actions insurance-form-span-2">
              <button className="suite-button" type="submit">{form.id ? t("Actualizar plan", "Update plan") : t("Crear plan", "Create plan")}</button>
              {form.id ? <button className="suite-button-secondary" type="button" onClick={() => setForm(createInitialForm())}>{t("Cancelar edicion", "Cancel edit")}</button> : null}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
