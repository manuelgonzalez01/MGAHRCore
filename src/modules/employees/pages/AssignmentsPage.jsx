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
import { addEmployeeAssignment } from "../services/assignments.service";

function createInitialAssignment(copy) {
  return {
    category: copy.language === "es" ? "Lider de proyecto" : "Project lead",
    owner: "HR Operations",
    startDate: "",
    endDate: "",
    status: "planned",
    attachments: [],
  };
}

export default function AssignmentsPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const [form, setForm] = useState(() => createInitialAssignment(copy));
  const [feedback, setFeedback] = useState("");
  const categoryOptions = isSpanish
    ? [
        "Lider de proyecto",
        "Custodia documental",
        "Responsable administrativo",
        "Back-up operativo",
        "Mentoria interna",
        "Cobertura temporal",
      ]
    : [
        "Project lead",
        "Document custodian",
        "Administrative owner",
        "Operational backup",
        "Internal mentor",
        "Temporary coverage",
      ];

  async function handleSubmit(event) {
    event.preventDefault();
    await addEmployeeAssignment(employee, form);
    setForm(createInitialAssignment(copy));
    setFeedback(isSpanish ? "Asignacion registrada correctamente." : "Assignment successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando asignaciones" : "Loading assignments"} description={isSpanish ? "Preparando responsables y compromisos del colaborador." : "Preparing owners and employee commitments."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Asignaciones organizacionales" : "Organizational assignments"}
          description={isSpanish ? "Vista general de custodias, encargos y responsables activos en la plantilla." : "General view of custodianships, assignments, and active owners across the workforce."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay asignaciones para mostrar" : "No assignments to display"}
          emptyDescription={isSpanish ? "Cuando existan asignaciones activas, podras abrir el detalle por colaborador desde aqui." : "Once active assignments exist, you will be able to open the employee detail from here."}
          actionLabel={isSpanish ? "Ver asignaciones" : "View assignments"}
          buildMeta={(item) => `${item.assignments.length} ${isSpanish ? "asignaciones" : "assignments"} | Manager ${item.manager || copy.common.managerPending}`}
        />
      </main>
    );
  }

  return (
    <main className="employees-page employees-page--assignments">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Asignaciones organizacionales" : "Organizational assignments"} description={isSpanish ? "Responsabilidades, custodias y encargos administrativos del colaborador." : "Responsibilities, custodianships, and administrative assignments for the employee."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="assignments"
            eyebrow={isSpanish ? "Asignaciones" : "Assignments"}
            title={isSpanish ? "Asignaciones y custodias activas" : "Active assignments and custodianships"}
            description={isSpanish ? "Supervisa responsabilidades temporales, encargos especiales y duenos operativos." : "Supervise temporary responsibilities, special duties, and operational owners."}
            meta={[
              { label: isSpanish ? "Activas" : "Active", value: employee.assignments.filter((item) => item.status === "active").length },
              { label: isSpanish ? "Planificadas" : "Planned", value: employee.assignments.filter((item) => item.status === "planned").length },
              { label: isSpanish ? "Completadas" : "Completed", value: employee.assignments.filter((item) => item.status === "completed").length },
              { label: "Manager", value: employee.manager || copy.common.managerPending },
            ]}
          />

          <EmployeeSectionCard variant="assignments" title={isSpanish ? "Panel operativo" : "Operational panel"} description={isSpanish ? "Consolida encargos, responsables y ventanas de ejecucion visibles para RRHH." : "Consolidates assignments, owners, and execution windows visible to HR."}>
            <div className="employees-domain-strip employees-domain-strip--assignments">
              <article className="employees-domain-chip"><span>{isSpanish ? "Activas" : "Active"}</span><strong>{employee.assignments.filter((item) => item.status === "active").length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Owners visibles" : "Visible owners"}</span><strong>{new Set(employee.assignments.map((item) => item.owner).filter(Boolean)).size}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Coberturas" : "Coverages"}</span><strong>{employee.assignments.filter((item) => item.category?.toLowerCase().includes(isSpanish ? "cobertura" : "coverage")).length}</strong></article>
            </div>
            {employee.assignments.length ? (
              <div className="employees-list">
                {employee.assignments.map((assignment) => (
                  <article key={assignment.id} className="employees-list-item">
                    <span>{assignment.category || (isSpanish ? "Asignacion" : "Assignment")}</span>
                    <strong>{assignment.owner || copy.common.noOwner}</strong>
                    <p className="employees-muted">
                      {assignment.startDate || copy.common.noDateRangeStart} {isSpanish ? "al" : "to"} {assignment.endDate || copy.common.noDateRangeEnd} | {isSpanish ? "Estado" : "Status"} {copy.status[assignment.status] || assignment.status}
                    </p>
                    <EmployeeAttachmentList attachments={assignment.attachments} compact />
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin asignaciones registradas" : "No assignments registered"} description={isSpanish ? "Usa esta vista para custodias, responsables temporales o encargos especiales." : "Use this view for custodianships, temporary owners, or special duties."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="assignments" title={isSpanish ? "Nueva asignacion" : "New assignment"} description={isSpanish ? "Registra un frente administrativo u operativo vinculado al colaborador con owner y vigencia." : "Register an administrative or operational front linked to the employee with owner and validity."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Categoria" : "Category"}</label>
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Responsable" : "Owner"}</label>
              <input
                value={form.owner}
                onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                placeholder={isSpanish ? "Ej. HR Operations, Finance Manager" : "Ex. HR Operations, Finance Manager"}
                required
              />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Fecha inicio" : "Start date"}</label>
              <input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Fecha fin" : "End date"}</label>
              <input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Estado" : "Status"}</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="planned">{copy.status.planned}</option>
                <option value="active">{copy.status.active}</option>
                <option value="completed">{copy.status.completed}</option>
              </select>
            </div>
            <EmployeeAttachmentsField
              label={isSpanish ? "Documentacion de respaldo" : "Supporting documentation"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta memorando, carta interna o respaldo operativo de la asignacion." : "Attach memo, internal letter, or operational support for the assignment."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.saveAssignment}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
