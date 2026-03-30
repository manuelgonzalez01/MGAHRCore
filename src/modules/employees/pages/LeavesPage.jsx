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

function createInitialLeave(copy) {
  return {
    type: copy.language === "es" ? "Vacacion anual" : "Annual vacation",
    startDate: "",
    endDate: "",
    days: "1",
    status: "pending",
    attachments: [],
  };
}

export default function LeavesPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const [form, setForm] = useState(() => createInitialLeave(copy));
  const [feedback, setFeedback] = useState("");
  const leaveTypeOptions = isSpanish
    ? [
        "Vacacion anual",
        "Licencia medica",
        "Maternidad",
        "Paternidad",
        "Permiso sin goce",
        "Comision de servicio",
        "Capacitacion externa",
      ]
    : [
        "Annual vacation",
        "Medical leave",
        "Maternity leave",
        "Paternity leave",
        "Unpaid leave",
        "Business assignment",
        "External training",
      ];

  async function handleSubmit(event) {
    event.preventDefault();
    await employeesService.saveEmployee({
      ...employee,
      leaves: [{ id: `LEA-${Date.now()}`, ...form }, ...(employee.leaves || [])],
    });
    setForm(createInitialLeave(copy));
    setFeedback(isSpanish ? "Licencia registrada correctamente." : "Leave successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando licencias" : "Loading leaves"} description={isSpanish ? "Preparando ausencias, estados y duracion acumulada." : "Preparing absences, statuses, and total duration."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Licencias y ausencias" : "Leaves and absences"}
          description={isSpanish ? "Vista general del tiempo fuera, licencias y estados de toda la plantilla." : "General view of time away, leaves, and statuses across the workforce."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay ausencias para mostrar" : "No absences to display"}
          emptyDescription={isSpanish ? "Cuando existan registros de ausencias, podras abrir el detalle por colaborador desde aqui." : "Once leave records exist, you will be able to open the employee detail from here."}
          actionLabel={isSpanish ? "Ver ausencias" : "View leaves"}
          buildMeta={(item) => `${item.leaves.length} ${isSpanish ? "licencias" : "leaves"} | ${item.status === "leave" ? copy.status.leave : copy.status[item.status] || item.status}`}
        />
      </main>
    );
  }

  const approvedDays = employee.leaves
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + (Number(item.days) || 0), 0);

  return (
    <main className="employees-page employees-page--leaves">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Licencias y ausencias" : "Leaves and absences"} description={isSpanish ? "Seguimiento ejecutivo de tiempo fuera y aprobaciones." : "Executive tracking of time away and approvals."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="leaves"
            eyebrow={isSpanish ? "Gestion de ausencias" : "Leave management"}
            title={isSpanish ? "Ausencias y licencias del colaborador" : "Employee absences and leaves"}
            description={isSpanish ? "Resume volumen, dias aprobados y visibilidad ejecutiva de tiempo fuera." : "Summarizes volume, approved days, and executive visibility of time away."}
            meta={[
              { label: isSpanish ? "Registros" : "Records", value: employee.leaves.length },
              { label: isSpanish ? "Dias aprobados" : "Approved days", value: approvedDays },
              { label: isSpanish ? "Pendientes" : "Pending", value: employee.leaves.filter((item) => item.status === "pending").length },
              { label: isSpanish ? "Estado laboral" : "Employment status", value: copy.status[employee.status] || employee.status },
            ]}
          />

          <EmployeeSectionCard variant="leaves" title={isSpanish ? "Resumen de ausencias" : "Absence summary"} description={isSpanish ? "Lectura clara del volumen y estado actual de licencias del colaborador." : "Clear reading of employee leave volume and current status."}>
            <div className="employees-domain-strip employees-domain-strip--leaves">
              <article className="employees-domain-chip"><span>{isSpanish ? "Licencias registradas" : "Leaves logged"}</span><strong>{employee.leaves.length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Dias aprobados" : "Approved days"}</span><strong>{approvedDays}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Pendientes" : "Pending"}</span><strong>{employee.leaves.filter((item) => item.status === "pending").length}</strong></article>
            </div>
          </EmployeeSectionCard>

          <EmployeeSectionCard variant="leaves" title={isSpanish ? "Panel de ausencias" : "Absence panel"} description={isSpanish ? "Control por tipo de licencia, rango de fechas y estatus." : "Control by leave type, date range, and status."}>
            {employee.leaves.length ? (
              <div className="employees-list">
                {employee.leaves.map((leave) => (
                  <article key={leave.id} className="employees-list-item">
                    <span>{leave.type || (isSpanish ? "Licencia" : "Leave")}</span>
                    <strong>{leave.days || 0} {isSpanish ? "dias" : "days"}</strong>
                    <p className="employees-muted">
                      {leave.startDate || copy.common.noDateRangeStart} {isSpanish ? "al" : "to"} {leave.endDate || copy.common.noDateRangeEnd}
                    </p>
                    <EmployeeAttachmentList attachments={leave.attachments} compact />
                    <EmployeeStatusBadge status={leave.status} />
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin licencias registradas" : "No leaves registered"} description={isSpanish ? "Registra vacaciones, maternidad, enfermedad u otras ausencias formales." : "Register vacations, maternity, sickness, or other formal absences."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="leaves" title={isSpanish ? "Registrar licencia" : "Register leave"} description={isSpanish ? "Captura ausencias con duracion, tipo y estado para su control administrativo." : "Capture absences with duration, type, and status for administrative control."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Tipo" : "Type"}</label>
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} required>
                {leaveTypeOptions.map((item) => (
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
              <label>{isSpanish ? "Dias" : "Days"}</label>
              <input
                type="number"
                min="1"
                value={form.days}
                onChange={(event) => setForm((current) => ({ ...current, days: event.target.value }))}
                placeholder={isSpanish ? "Ej. 3" : "Ex. 3"}
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
              label={isSpanish ? "Documentacion de licencia" : "Leave documentation"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta certificado medico, formulario o respaldo formal de la ausencia." : "Attach medical certificate, form, or formal support for the absence."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.saveLeave}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
