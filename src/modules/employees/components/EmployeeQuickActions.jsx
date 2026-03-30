import { Link } from "react-router-dom";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeQuickActions({ employeeId }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const actions = [
    {
      to: `/employees/documents?employee=${employeeId}`,
      label: isSpanish ? "Abrir expediente" : "Open file",
    },
    {
      to: `/employees/salary-analysis?employee=${employeeId}`,
      label: isSpanish ? "Ver compensacion" : "View compensation",
    },
    {
      to: `/employees/leaves?employee=${employeeId}`,
      label: isSpanish ? "Gestionar ausencias" : "Manage leaves",
    },
    {
      to: `/employees/experience?employee=${employeeId}`,
      label: isSpanish ? "Revisar historial" : "Review history",
    },
    {
      to: `/development/dossier?employee=${employeeId}`,
      label: isSpanish ? "Abrir dossier de talento" : "Open talent dossier",
    },
    {
      to: `/insurance/inclusion?employee=${employeeId}`,
      label: isSpanish ? "Gestionar seguro" : "Manage insurance",
    },
    {
      to: `/personnel-actions/list?employee=${employeeId}`,
      label: isSpanish ? "Accion de personal" : "Personnel action",
    },
    {
      to: `/occupational-health?employee=${employeeId}`,
      label: isSpanish ? "Salud ocupacional" : "Occupational health",
    },
  ];

  return (
    <div className="employees-quick-actions">
      {actions.map((action) => (
        <Link key={action.to} className="employees-button-secondary" to={action.to}>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
