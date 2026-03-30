import EmployeeSectionCard from "./EmployeeSectionCard";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import { formatDate } from "../utils/employee.helpers";

export default function EmployeeOrgContextCard({ employee }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  return (
    <EmployeeSectionCard
      variant="assignments"
      title={isSpanish ? "Contexto organizacional" : "Organizational context"}
      description={isSpanish ? "Lectura estructural del colaborador dentro de la arquitectura administrativa." : "Structural readout of the employee inside the administrative architecture."}
    >
      <div className="employees-mini-grid">
        <article className="employees-list-item">
          <span>{isSpanish ? "Compania" : "Company"}</span>
          <strong>{employee.company}</strong>
          <p className="employees-muted">{employee.legalEntity || employee.businessUnit}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Departamento" : "Department"}</span>
          <strong>{employee.department}</strong>
          <p className="employees-muted">{employee.position}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Nivel / posicion" : "Level / position"}</span>
          <strong>{employee.levelName || copy.common.noLevel}</strong>
          <p className="employees-muted">{employee.position}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Supervisor" : "Supervisor"}</span>
          <strong>{employee.manager || copy.common.managerPending}</strong>
          <p className="employees-muted">{employee.reportsToPositionName || copy.common.noData}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Localizacion" : "Location"}</span>
          <strong>{employee.location}</strong>
          <p className="employees-muted">{employee.payrollGroup || copy.common.noData}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Fecha de antiguedad" : "Seniority date"}</span>
          <strong>{formatDate(employee.contract?.seniorityDate || employee.startDate, copy.locale)}</strong>
          <p className="employees-muted">{employee.costCenter}</p>
        </article>
      </div>
    </EmployeeSectionCard>
  );
}
