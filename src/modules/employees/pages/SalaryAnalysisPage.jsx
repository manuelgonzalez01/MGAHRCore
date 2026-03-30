import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSalaryOverview from "../components/EmployeeSalaryOverview";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import useEmployeeCompensation from "../hooks/useEmployeeCompensation";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import { saveEmployeeSalary } from "../services/salary.service";
import { getCurrencyOptions } from "../../administration/utils/currency.options";
import { formatCurrency } from "../utils/employee.helpers";

export default function SalaryAnalysisPage() {
  const { employee, loading, refresh } = useEmployeeCompensation();
  const { dashboard } = useEmployees();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const currencyOptions = getCurrencyOptions();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);

    await saveEmployeeSalary(employee, {
      baseSalary: formData.get("baseSalary"),
      variable: formData.get("variable"),
      marketMedian: formData.get("marketMedian"),
      internalMedian: formData.get("internalMedian"),
      currency: formData.get("currency"),
      compaRatio: formData.get("compaRatio"),
      benefits: (formData.get("benefits") || "")
        .toString()
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setSaving(false);
    setFeedback(isSpanish ? "Compensacion actualizada correctamente." : "Compensation updated successfully.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando compensacion" : "Loading compensation"} description={isSpanish ? "Preparando vista salarial del colaborador." : "Preparing employee salary view."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Analisis salarial" : "Salary analysis"}
          description={isSpanish ? "Vista general de banda, base salarial y posicionamiento para todos los colaboradores." : "General view of band, base salary, and positioning across all employees."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay datos salariales para mostrar" : "No salary data to display"}
          emptyDescription={isSpanish ? "Cuando existan colaboradores activos, podras abrir el analisis individual desde aqui." : "Once active employees exist, you will be able to open the individual salary analysis from here."}
          actionLabel={isSpanish ? "Ver salario" : "View salary"}
          buildMeta={(item) => `${formatCurrency(item.salary?.baseSalary || 0, item.salary?.currency || "BOB")} | ${item.salaryBand || copy.common.pending}`}
        />
      </main>
    );
  }

  return (
    <main className="employees-page employees-page--salary">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Analisis salarial" : "Salary analysis"} description={isSpanish ? "Compensacion, comparativos y lectura ejecutiva de banda." : "Compensation, benchmarks, and executive band reading."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="salary"
            eyebrow={isSpanish ? "Inteligencia de compensacion" : "Compensation intelligence"}
            title={isSpanish ? "Lectura salarial ejecutiva" : "Executive compensation view"}
            description={isSpanish ? "Cruza salario base, banda, variable y referencias para una mirada mas seria de compensacion." : "Crosses base pay, band, variable pay, and references for a more serious compensation lens."}
            meta={[
              { label: isSpanish ? "Banda" : "Band", value: employee.salaryBand },
              { label: isSpanish ? "Base" : "Base", value: formatCurrency(employee.salary.baseSalary || 0, employee.salary.currency || "BOB") },
              { label: isSpanish ? "Mercado" : "Market", value: formatCurrency(employee.salary.marketMedian || 0, employee.salary.currency || "BOB") },
              { label: isSpanish ? "Beneficios" : "Benefits", value: employee.salary.benefits?.length || 0 },
            ]}
          />

          <EmployeeSectionCard variant="salary" title={isSpanish ? "Vista actual de compensacion" : "Current compensation view"} description={isSpanish ? "Lectura inmediata para RRHH de salario, variable y posicionamiento interno." : "Immediate HR readout of salary, variable pay, and internal positioning."}>
            <div className="employees-domain-strip employees-domain-strip--salary">
              <article className="employees-domain-chip"><span>{isSpanish ? "Salario base" : "Base salary"}</span><strong>{formatCurrency(employee.salary.baseSalary || 0, employee.salary.currency || "BOB")}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Variable" : "Variable"}</span><strong>{formatCurrency(employee.salary.variable || 0, employee.salary.currency || "BOB")}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Compa ratio" : "Compa-ratio"}</span><strong>{employee.salary.compaRatio || 0}</strong></article>
            </div>
            <EmployeeSalaryOverview salary={employee.salary} />
          </EmployeeSectionCard>

          <EmployeeSectionCard variant="salary" title={isSpanish ? "Historial salarial" : "Salary history"} description={isSpanish ? "Trazabilidad de cambios registrados en el expediente." : "Traceability of changes recorded in the employee file."}>
            {employee.salary.salaryHistory?.length ? (
              <div className="employees-list">
                {employee.salary.salaryHistory.map((item, index) => (
                  <article key={`${item.effectiveDate}-${index}`} className="employees-list-item">
                    <span>{item.effectiveDate}</span>
                    <strong>{item.change || (isSpanish ? "Actualizacion" : "Update")}</strong>
                    <p className="employees-muted">
                      {item.reason || copy.common.noReason} | {isSpanish ? "Base" : "Base"} {formatCurrency(item.baseSalary || 0, employee.salary.currency || "BOB")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin historial salarial" : "No salary history"} description={isSpanish ? "Cuando registres ajustes, el historial aparecera automaticamente aqui." : "Once you register adjustments, history will appear here automatically."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="salary" title={isSpanish ? "Actualizar compensacion" : "Update compensation"} description={isSpanish ? "Captura base, variable, medianas y beneficios para un analisis mas serio." : "Capture base pay, variable pay, medians, and benefits for a stronger analysis."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Salario base" : "Base salary"}</label>
              <input type="number" min="0" name="baseSalary" defaultValue={employee.salary.baseSalary || ""} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Variable" : "Variable"}</label>
              <input type="number" min="0" name="variable" defaultValue={employee.salary.variable || ""} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Mediana mercado" : "Market median"}</label>
              <input type="number" min="0" name="marketMedian" defaultValue={employee.salary.marketMedian || ""} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Mediana interna" : "Internal median"}</label>
              <input type="number" min="0" name="internalMedian" defaultValue={employee.salary.internalMedian || ""} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Compa ratio" : "Compa-ratio"}</label>
              <input type="number" min="0" step="0.01" name="compaRatio" defaultValue={employee.salary.compaRatio || ""} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Moneda" : "Currency"}</label>
              <select name="currency" defaultValue={employee.salary.currency || "BOB"}>
                {currencyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="employees-field" style={{ gridColumn: "1 / -1" }}>
              <label>{isSpanish ? "Beneficios (separados por coma)" : "Benefits (comma separated)"}</label>
              <textarea name="benefits" defaultValue={(employee.salary.benefits || []).join(", ")} />
            </div>
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit" disabled={saving}>
                {saving ? copy.actions.processing : copy.actions.saveSalary}
              </button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
