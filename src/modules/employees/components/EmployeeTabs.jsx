import { NavLink } from "react-router-dom";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeTabs({ employeeId }) {
  const copy = useEmployeesCopy();
  const suffix = employeeId ? `?employee=${employeeId}` : "";
  const tabs = [
    { to: "/employees/profile", label: copy.tabs.profile },
    { to: "/employees/documents", label: copy.tabs.documents },
    { to: "/employees/dependents", label: copy.tabs.dependents },
    { to: "/employees/assignments", label: copy.tabs.assignments },
    { to: "/employees/studies", label: copy.tabs.studies },
    { to: "/employees/experience", label: copy.tabs.experience },
    { to: "/employees/permissions", label: copy.tabs.permissions },
    { to: "/employees/leaves", label: copy.tabs.leaves },
    { to: "/employees/salary-analysis", label: copy.tabs.salary },
  ];

  return (
    <nav className="employees-tabbar">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={`${tab.to}${suffix}`} className={({ isActive }) => (isActive ? "active" : "")}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
