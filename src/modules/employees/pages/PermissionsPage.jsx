import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeStatusBadge from "../components/EmployeeStatusBadge";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import EmployeeAttachmentsField from "../components/EmployeeAttachmentsField";
import EmployeeAttachmentList from "../components/EmployeeAttachmentList";
import useEmployeeProfile from "../hooks/useEmployeeProfile";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import employeesService from "../services/employees.service";

function createInitialPermission(copy) {
  return {
    type: copy.language === "es" ? "Permiso personal" : "Personal permission",
    startDate: "",
    endDate: "",
    status: "pending",
    approver: "",
    attachments: [],
  };
}

export default function PermissionsPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const [form, setForm] = useState(() => createInitialPermission(copy));
  const [feedback, setFeedback] = useState("");
  const permissionTypeOptions = isSpanish
    ? ["Permiso personal", "Permiso medico", "Permiso por duelo", "Permiso sindical", "Permiso de representacion"]
    : ["Personal permission", "Medical permission", "Bereavement permission", "Union permission", "Representation permission"];

  async function handleSubmit(event) {
    event.preventDefault();
    await employeesService.saveEmployee({
      ...employee,
      permissions: [{ id: `PER-${Date.now()}`, ...form }, ...(employee.permissions || [])],
    });
    setForm(createInitialPermission(copy));
    setFeedback(isSpanish ? "Permiso registrado correctamente." : "Permission successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando permisos" : "Loading permissions"} description={isSpanish ? "Preparando seguimiento de solicitudes y aprobaciones." : "Preparing request and approval tracking."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Permisos y solicitudes" : "Permissions and requests"}
          description={isSpanish ? "Vista general de permisos registrados y pendientes en toda la plantilla." : "General view of logged and pending permissions across the workforce."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay permisos para mostrar" : "No permissions to display"}
          emptyDescription={isSpanish ? "Cuando existan solicitudes, podras abrir el detalle por colaborador desde aqui." : "Once requests exist, you will be able to open the employee detail from here."}
          actionLabel={isSpanish ? "Ver permisos" : "View permissions"}
          buildMeta={(item) => `${item.permissions.length} ${isSpanish ? "permisos" : "permissions"} | ${item.permissions.filter((permission) => permission.status === "pending").length} ${isSpanish ? "pendientes" : "pending"}`}
        />
      </main>
    );
  }

  const pendingPermissions = employee.permissions.filter((item) => item.status === "pending").length;

  return (
    <main className="employees-page employees-page--permissions">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Permisos" : "Permissions"} description={isSpanish ? "Solicitudes cortas, aprobaciones y trazabilidad operativa." : "Short requests, approvals, and operational traceability."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="permissions"
            eyebrow={isSpanish ? "Control de permisos" : "Permissions control"}
            title={isSpanish ? "Permisos y trazabilidad de aprobacion" : "Permissions and approval traceability"}
            description={isSpanish ? "Controla solicitudes cortas con una lectura operativa de estado, aprobador y fechas." : "Control short requests with an operational readout of status, approver, and dates."}
            meta={[
              { label: isSpanish ? "Registrados" : "Registered", value: employee.permissions.length },
              { label: isSpanish ? "Pendientes" : "Pending", value: pendingPermissions },
              { label: isSpanish ? "Aprobados" : "Approved", value: employee.permissions.filter((item) => item.status === "approved").length },
              { label: "Manager", value: employee.manager || copy.common.managerPending },
            ]}
          />

          <EmployeeSectionCard variant="permissions" title={isSpanish ? "Seguimiento de permisos" : "Permissions tracking"} description={isSpanish ? "Consolida el estado actual de las solicitudes del colaborador." : "Consolidates the current state of employee requests."}>
            <div className="employees-domain-strip employees-domain-strip--permissions">
              <article className="employees-domain-chip"><span>{isSpanish ? "Permisos registrados" : "Permissions logged"}</span><strong>{employee.permissions.length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Pendientes" : "Pending"}</span><strong>{pendingPermissions}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Aprobados" : "Approved"}</span><strong>{employee.permissions.filter((item) => item.status === "approved").length}</strong></article>
            </div>
          </EmployeeSectionCard>

          <EmployeeSectionCard variant="permissions" title={isSpanish ? "Historial de solicitudes" : "Request history"} description={isSpanish ? "Control por tipo, rango y responsable de aprobacion." : "Control by type, range, and approval owner."}>
            {employee.permissions.length ? (
              <div className="employees-list">
                {employee.permissions.map((permission) => (
                  <article key={permission.id} className="employees-list-item">
                    <span>{permission.type || (isSpanish ? "Permiso" : "Permission")}</span>
                    <strong>{permission.approver || copy.common.noApprover}</strong>
                    <p className="employees-muted">
                      {permission.startDate || copy.common.noDateRangeStart} {isSpanish ? "al" : "to"} {permission.endDate || copy.common.noDateRangeEnd}
                    </p>
                    <EmployeeAttachmentList attachments={permission.attachments} compact />
                    <EmployeeStatusBadge status={permission.status} />
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin permisos registrados" : "No permissions registered"} description={isSpanish ? "Captura aqui cada solicitud para mantener una vista clara del seguimiento." : "Capture each request here to keep a clear follow-up view."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="permissions" title={isSpanish ? "Registrar permiso" : "Register permission"} description={isSpanish ? "Alta de solicitudes breves con aprobador, fechas y estado visible." : "Add short requests with approver, dates, and visible status."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Tipo" : "Type"}</label>
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} required>
                {permissionTypeOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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
              <label>{isSpanish ? "Aprobador" : "Approver"}</label>
              <input
                value={form.approver}
                onChange={(event) => setForm((current) => ({ ...current, approver: event.target.value }))}
                placeholder={employee.manager || copy.common.noManager}
              />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Estado" : "Status"}</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="pending">{copy.status.pending}</option>
                <option value="approved">{copy.status.approved}</option>
                <option value="rejected">{copy.status.rejected}</option>
              </select>
            </div>
            <EmployeeAttachmentsField
              label={isSpanish ? "Adjuntos de solicitud" : "Request attachments"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta respaldo medico, carta interna o evidencia asociada al permiso." : "Attach medical support, internal letter, or evidence associated with the permission."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.savePermission}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
