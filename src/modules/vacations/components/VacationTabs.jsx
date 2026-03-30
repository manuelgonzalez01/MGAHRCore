import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/vacations", label: "Dashboard" },
  { to: "/vacations/policies", label: "Politicas" },
  { to: "/vacations/balances", label: "Balances" },
  { to: "/vacations/requests", label: "Solicitudes" },
  { to: "/vacations/approvals", label: "Aprobaciones" },
  { to: "/vacations/planning", label: "Planeacion" },
  { to: "/vacations/calendar", label: "Calendario" },
  { to: "/vacations/conflicts", label: "Conflictos" },
  { to: "/vacations/history", label: "Historial" },
  { to: "/vacations/reports", label: "Reportes" },
];

export default function VacationTabs() {
  return (
    <nav className="suite-vacation-tabs">
      {tabs.map((tab) => (
        <NavLink end={tab.to === "/vacations"} key={tab.to} to={tab.to}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
