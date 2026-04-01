import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/navigation/Sidebar";
import "../../assets/styles/globals.css";

export default function MainLayout() {
  useEffect(() => {
    let cancelled = false;

    function warmCoreModules() {
      if (cancelled) {
        return;
      }

      Promise.allSettled([
        import("../../modules/administration/services/administration.service").then((module) =>
          Promise.all([
            module.default.getOrganizations(),
            module.default.getApprovalFlows(),
            module.default.getSettings(),
          ])),
        import("../../modules/employees/services/employees.service").then((module) =>
          module.default.getEmployeesDashboard()),
        import("../../modules/recruitment/services/recruitment.service").then((module) =>
          module.default.getRecruitmentDashboardData()),
        import("../../modules/vacations/services/vacations.service").then((module) =>
          module.default.getVacationsDashboard()),
      ]).catch(() => {});
    }

    const schedule =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback(warmCoreModules, { timeout: 1200 })
        : window.setTimeout(warmCoreModules, 300);

    return () => {
      cancelled = true;

      if (typeof window !== "undefined" && "cancelIdleCallback" in window && typeof schedule === "number") {
        window.cancelIdleCallback(schedule);
        return;
      }

      window.clearTimeout(schedule);
    };
  }, []);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
