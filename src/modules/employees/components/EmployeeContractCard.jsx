import EmployeeSectionCard from "./EmployeeSectionCard";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import { formatDate } from "../utils/employee.helpers";

export default function EmployeeContractCard({ employee }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const contract = employee.contract || {};

  return (
    <EmployeeSectionCard
      variant="salary"
      title={isSpanish ? "Contrato y relacion laboral" : "Contract and employment relationship"}
      description={isSpanish ? "Capa contractual para operacion, cumplimiento y trazabilidad administrativa." : "Contractual layer for operations, compliance, and administrative traceability."}
    >
      <div className="employees-list">
        <article className="employees-list-item">
          <span>{isSpanish ? "Tipo de contrato" : "Contract type"}</span>
          <strong>{contract.contractType || employee.contractType}</strong>
          <p className="employees-muted">{contract.workMode || employee.workMode} | {employee.status}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Inicio / prueba" : "Start / probation"}</span>
          <strong>{formatDate(contract.startDate || employee.startDate, copy.locale)}</strong>
          <p className="employees-muted">
            {isSpanish ? "Fin de prueba" : "Probation end"} {formatDate(contract.probationEndDate, copy.locale)}
          </p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Entidad legal" : "Legal entity"}</span>
          <strong>{contract.legalEntity || employee.company}</strong>
          <p className="employees-muted">{contract.laborRegime || (isSpanish ? "Regimen general" : "General regime")}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Grupo de pago" : "Payroll group"}</span>
          <strong>{contract.payrollGroup || employee.payrollGroup || copy.common.noData}</strong>
          <p className="employees-muted">{employee.email || copy.common.noEmail}</p>
        </article>
      </div>
    </EmployeeSectionCard>
  );
}
