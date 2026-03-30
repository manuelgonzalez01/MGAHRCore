import { getStatusMeta } from "../utils/employee.helpers";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeStatusBadge({ status }) {
  const copy = useEmployeesCopy();
  const meta = getStatusMeta(status);
  return <span className={`employees-badge ${meta.tone}`}>{copy.status[status] || meta.label}</span>;
}
