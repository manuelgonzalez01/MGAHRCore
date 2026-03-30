import { Link, useLocation } from "react-router-dom";
import EmployeeSectionCard from "./EmployeeSectionCard";
import EmployeeEmptyState from "./EmployeeEmptyState";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

function summarizeModule(pathname, employees, isSpanish) {
  const pathKey = pathname.split("/").filter(Boolean).at(-1) || "employees";

  const metrics = {
    documents: {
      total: employees.reduce((acc, employee) => acc + (employee.documents?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.documents || []).filter((item) => item.status !== "approved").length,
        0,
      ),
      totalLabel: isSpanish ? "Documentos" : "Documents",
      secondaryLabel: isSpanish ? "Pendientes" : "Pending",
    },
    dependents: {
      total: employees.reduce((acc, employee) => acc + (employee.dependents?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.dependents || []).filter((item) => item.beneficiary === "Si").length,
        0,
      ),
      totalLabel: isSpanish ? "Dependientes" : "Dependents",
      secondaryLabel: isSpanish ? "Beneficiarios" : "Beneficiaries",
    },
    assignments: {
      total: employees.reduce((acc, employee) => acc + (employee.assignments?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.assignments || []).filter((item) => item.status === "active").length,
        0,
      ),
      totalLabel: isSpanish ? "Asignaciones" : "Assignments",
      secondaryLabel: isSpanish ? "Activas" : "Active",
    },
    studies: {
      total: employees.reduce((acc, employee) => acc + (employee.studies?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.studies || []).filter((item) => item.status === "completed").length,
        0,
      ),
      totalLabel: isSpanish ? "Registros" : "Records",
      secondaryLabel: isSpanish ? "Completados" : "Completed",
    },
    experience: {
      total: employees.reduce((acc, employee) => acc + (employee.experience?.length || 0), 0),
      secondary: employees.filter((employee) => (employee.experience || []).length > 0).length,
      totalLabel: isSpanish ? "Trayectorias" : "Journeys",
      secondaryLabel: isSpanish ? "Con historial" : "With history",
    },
    permissions: {
      total: employees.reduce((acc, employee) => acc + (employee.permissions?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.permissions || []).filter((item) => item.status === "pending").length,
        0,
      ),
      totalLabel: isSpanish ? "Permisos" : "Permissions",
      secondaryLabel: isSpanish ? "Pendientes" : "Pending",
    },
    leaves: {
      total: employees.reduce((acc, employee) => acc + (employee.leaves?.length || 0), 0),
      secondary: employees.reduce(
        (acc, employee) => acc + (employee.leaves || []).reduce((sum, item) => sum + (Number(item.days) || 0), 0),
        0,
      ),
      totalLabel: isSpanish ? "Licencias" : "Leaves",
      secondaryLabel: isSpanish ? "Dias" : "Days",
    },
    "salary-analysis": {
      total: employees.filter((employee) => Number(employee.salary?.baseSalary) > 0).length,
      secondary: Math.round(
        employees.reduce((acc, employee) => acc + (Number(employee.salary?.compaRatio) || 0), 0)
          / Math.max(employees.length, 1),
      ),
      totalLabel: isSpanish ? "Con salario base" : "With base salary",
      secondaryLabel: isSpanish ? "Compa ratio" : "Compa-ratio",
      formatSecondary: (value) => `${value}%`,
    },
  };

  const selected = metrics[pathKey] || {
    total: employees.length,
    secondary: employees.filter((employee) => employee.status === "active").length,
    totalLabel: isSpanish ? "Colaboradores" : "Employees",
    secondaryLabel: isSpanish ? "Activos" : "Active",
  };

  return {
    ...selected,
    totalEmployees: employees.length,
  };
}

export default function EmployeeModuleOverview({
  title,
  description,
  employees = [],
  emptyTitle,
  emptyDescription,
  actionLabel,
  buildMeta,
}) {
  const { pathname } = useLocation();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const summary = summarizeModule(pathname, employees, isSpanish);

  return (
    <EmployeeSectionCard title={title} description={description}>
      {employees.length ? (
        <section className="employees-overview-hero">
          <div className="employees-overview-copy">
            <span className="employees-eyebrow">
              {isSpanish ? "Vista general del modulo" : "Module overview"}
            </span>
            <h3>{isSpanish ? "Lectura ejecutiva de toda la plantilla" : "Executive readout across the workforce"}</h3>
            <p className="employees-muted">
              {isSpanish
                ? "Entra a cada colaborador desde esta bandeja general y luego continua en su expediente individual sin perder contexto."
                : "Open each employee from this general tray and then continue into the individual file without losing context."}
            </p>
          </div>
          <div className="employees-overview-metrics">
            <article className="employees-overview-metric">
              <span>{summary.totalLabel}</span>
              <strong>{summary.total}</strong>
            </article>
            <article className="employees-overview-metric">
              <span>{summary.secondaryLabel}</span>
              <strong>{summary.formatSecondary ? summary.formatSecondary(summary.secondary) : summary.secondary}</strong>
            </article>
            <article className="employees-overview-metric">
              <span>{isSpanish ? "Colaboradores visibles" : "Visible employees"}</span>
              <strong>{summary.totalEmployees}</strong>
            </article>
          </div>
        </section>
      ) : null}
      {employees.length ? (
        <div className="employees-list">
          {employees.map((employee) => (
            <article key={employee.id} className="employees-list-item">
              <div className="employees-list-item__head">
                <div>
                  <span>{employee.department}</span>
                  <strong>{employee.name}</strong>
                </div>
                <span className="employees-badge neutral">{copy.status[employee.status] || employee.status || copy.common.pending}</span>
              </div>
              <p className="employees-muted">{employee.position} | {employee.location}</p>
              {buildMeta ? <p className="employees-muted">{buildMeta(employee)}</p> : null}
              <div className="employees-list-item__meta">
                <span>{employee.company}</span>
                <span>{employee.levelName || copy.common.noLevel}</span>
                <span>{employee.recruitmentSource?.origin || copy.common.manual}</span>
              </div>
              <div className="employees-inline-actions">
                <Link className="employees-button" to={`${pathname}?employee=${employee.id}`}>
                  {actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmployeeEmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </EmployeeSectionCard>
  );
}
