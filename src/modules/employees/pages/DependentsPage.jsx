import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import EmployeeAttachmentsField from "../components/EmployeeAttachmentsField";
import EmployeeAttachmentList from "../components/EmployeeAttachmentList";
import useEmployeeProfile from "../hooks/useEmployeeProfile";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import { addEmployeeDependent } from "../services/dependents.service";

function createInitialDependent(copy) {
  return {
    name: "",
    relationship: copy.language === "es" ? "Conyuge" : "Spouse",
    birthDate: "",
    beneficiary: "No",
    attachments: [],
  };
}

export default function DependentsPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const [form, setForm] = useState(() => createInitialDependent(copy));
  const [feedback, setFeedback] = useState("");
  const relationshipOptions = isSpanish
    ? [
        "Conyuge",
        "Hijo/a",
        "Padre",
        "Madre",
        "Hermano/a",
        "Tutor legal",
        "Otro familiar",
      ]
    : [
        "Spouse",
        "Child",
        "Father",
        "Mother",
        "Sibling",
        "Legal guardian",
        "Other family member",
      ];

  async function handleSubmit(event) {
    event.preventDefault();
    await addEmployeeDependent(employee, form);
    setForm(createInitialDependent(copy));
    setFeedback(isSpanish ? "Dependiente registrado correctamente." : "Dependent successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando dependientes" : "Loading dependents"} description={isSpanish ? "Preparando informacion familiar y de beneficiarios." : "Preparing family and beneficiary information."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Dependientes y beneficiarios" : "Dependents and beneficiaries"}
          description={isSpanish ? "Vista general del grupo familiar y cobertura asociada a todos los colaboradores." : "General view of family records and linked coverage across all employees."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay dependientes para mostrar" : "No dependents to display"}
          emptyDescription={isSpanish ? "Cuando existan registros familiares, podras entrar al detalle por colaborador desde aqui." : "Once family records exist, you will be able to open each employee detail from here."}
          actionLabel={isSpanish ? "Ver dependientes" : "View dependents"}
          buildMeta={(item) => `${item.dependents.length} ${isSpanish ? "dependientes" : "dependents"} | ${item.company}`}
        />
      </main>
    );
  }

  const beneficiaries = employee.dependents.filter((item) => item.beneficiary === "Si").length;

  return (
    <main className="employees-page">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Dependientes y beneficiarios" : "Dependents and beneficiaries"} description={isSpanish ? "Vista familiar y de cobertura asociada al colaborador." : "Family and coverage view linked to the employee."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            eyebrow={isSpanish ? "Cobertura familiar" : "Family coverage"}
            title={isSpanish ? "Mapa familiar y de beneficiarios" : "Family and beneficiary map"}
            description={isSpanish ? "Employees concentra cobertura, dependientes y personas marcadas como beneficiarias." : "Employees concentrates coverage, dependents, and people marked as beneficiaries."}
            meta={[
              { label: isSpanish ? "Dependientes" : "Dependents", value: employee.dependents.length },
              { label: isSpanish ? "Beneficiarios" : "Beneficiaries", value: beneficiaries },
              { label: isSpanish ? "Compania" : "Company", value: employee.company },
              { label: isSpanish ? "Seguro" : "Insurance", value: employee.salary?.benefits?.includes("Seguro premium") ? (isSpanish ? "Premium" : "Premium") : (isSpanish ? "Activo" : "Active") },
            ]}
          />

          <EmployeeSectionCard title={isSpanish ? "Cobertura actual" : "Current coverage"} description={isSpanish ? "Lectura ejecutiva de dependientes registrados y personas marcadas como beneficiarias." : "Executive readout of registered dependents and designated beneficiaries."}>
            <div className="employees-kpi-grid">
              <article className="employees-kpi"><span>{isSpanish ? "Dependientes" : "Dependents"}</span><strong>{employee.dependents.length}</strong></article>
              <article className="employees-kpi"><span>{isSpanish ? "Beneficiarios" : "Beneficiaries"}</span><strong>{beneficiaries}</strong></article>
            </div>
          </EmployeeSectionCard>

          <EmployeeSectionCard title={isSpanish ? "Grupo familiar" : "Family group"} description={isSpanish ? "Registro organizado para uso administrativo, beneficios y seguros." : "Organized record for administrative use, benefits, and insurance."}>
            {employee.dependents.length ? (
              <div className="employees-list">
                {employee.dependents.map((dependent) => (
                  <article key={dependent.id} className="employees-list-item">
                    <span>{dependent.relationship || (isSpanish ? "Relacion" : "Relationship")}</span>
                    <strong>{dependent.name}</strong>
                    <p className="employees-muted">
                      {isSpanish ? "Nacimiento" : "Birth"} {dependent.birthDate || copy.common.noBirthDate} | {isSpanish ? "Beneficiario" : "Beneficiary"} {dependent.beneficiary === "Si" ? copy.common.yes : copy.common.no}
                    </p>
                    <EmployeeAttachmentList attachments={dependent.attachments} compact />
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin dependientes registrados" : "No dependents registered"} description={isSpanish ? "Agrega familiares, hijos o beneficiarios para completar la vista personal." : "Add family members, children, or beneficiaries to complete the personal view."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard title={isSpanish ? "Registrar dependiente" : "Register dependent"} description={isSpanish ? "Captura informacion familiar util para beneficios, seguros y administracion de personal." : "Capture family information for benefits, insurance, and workforce administration."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Nombre completo" : "Full name"}</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Relacion" : "Relationship"}</label>
              <select value={form.relationship} onChange={(event) => setForm((current) => ({ ...current, relationship: event.target.value }))} required>
                {relationshipOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Fecha de nacimiento" : "Birth date"}</label>
              <input type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Beneficiario" : "Beneficiary"}</label>
              <select value={form.beneficiary} onChange={(event) => setForm((current) => ({ ...current, beneficiary: event.target.value }))}>
                <option value="No">{copy.common.no}</option>
                <option value="Si">{copy.common.yes}</option>
              </select>
            </div>
            <EmployeeAttachmentsField
              label={isSpanish ? "Documentacion de respaldo" : "Supporting documentation"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta certificados de nacimiento, carnet o respaldo de beneficiario si aplica." : "Attach birth certificates, ID files, or beneficiary support when applicable."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.saveDependent}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
