import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeTypeBadge from "./EmployeeTypeBadge";
import { formatDate, formatPercent } from "../utils/employee.helpers";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeesTable({ employees, onSelect }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  return (
    <div className="employees-table-shell">
      <table className="employees-table">
        <thead>
          <tr>
            <th>{copy.table.employee}</th>
            <th>{copy.table.context}</th>
            <th>{copy.table.origin}</th>
            <th>{copy.table.contract}</th>
            <th>{copy.table.dossier}</th>
            <th>{copy.table.state}</th>
            <th>{isSpanish ? "Accion" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} onClick={() => onSelect(employee)}>
              <td>
                <div className="employees-person">
                  <span className="employees-avatar">{employee.initials}</span>
                  <div>
                    <strong>{employee.name}</strong>
                    <p className="employees-muted">{employee.department}</p>
                  </div>
                </div>
              </td>
              <td>
                <strong>{employee.position}</strong>
                <p className="employees-muted">{employee.company} | {employee.location}</p>
                <p className="employees-muted">{employee.manager || copy.common.noManager} | {employee.levelName || copy.common.noLevel}</p>
              </td>
              <td>
                <strong>{employee.recruitmentSource?.origin || copy.common.manual}</strong>
                <p className="employees-muted">{employee.recruitmentSource?.sourceChannel || employee.recruitmentSource?.candidateName || copy.table.pipelineFree}</p>
              </td>
              <td>
                <strong>{employee.contractType}</strong>
                <p className="employees-muted"><EmployeeTypeBadge type={employee.employeeType} /></p>
                <p className="employees-muted">{copy.table.entry} {formatDate(employee.startDate)}</p>
              </td>
              <td>
                <strong>{formatPercent(employee.dossierReadiness)}</strong>
                <p className="employees-muted">{employee.documents.length} {copy.table.docs} | {copy.table.score} {employee.engagementScore || 0}</p>
              </td>
              <td><EmployeeStatusBadge status={employee.status} /></td>
              <td>
                <button type="button" className="employees-button-secondary" onClick={(event) => {
                  event.stopPropagation();
                  onSelect(employee);
                }}>
                  {isSpanish ? "Abrir" : "Open"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
