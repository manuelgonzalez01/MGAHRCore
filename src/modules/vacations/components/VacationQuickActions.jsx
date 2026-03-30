import { NavLink } from "react-router-dom";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationQuickActions() {
  const { copy } = useVacationLocale();
  const actions = [
    { to: "/vacations/requests", label: copy.quickRequests },
    { to: "/vacations/approvals", label: copy.quickApprovals },
    { to: "/vacations/planning", label: copy.quickPlanning },
    { to: "/vacations/conflicts", label: copy.quickConflicts },
  ];
  return (
    <div className="suite-inline-actions">
      {actions.map((action) => (
        <NavLink className="suite-button-secondary" key={action.to} to={action.to}>
          {action.label}
        </NavLink>
      ))}
    </div>
  );
}
