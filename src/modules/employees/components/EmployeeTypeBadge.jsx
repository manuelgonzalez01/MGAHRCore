import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeTypeBadge({ type }) {
  const copy = useEmployeesCopy();

  return <span className="employees-badge info">{copy.type[type] || type || copy.common.notDefined}</span>;
}
