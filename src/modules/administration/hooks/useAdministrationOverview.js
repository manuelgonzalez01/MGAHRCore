import { useEffect, useState } from "react";
import administrationService from "../services/administration.service";
import employeesService from "../../employees/services/employees.service";
import recruitmentService from "../../recruitment/services/recruitment.service";

export default function useAdministrationOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [coreResult, employeesDashboardResult, recruitmentDashboardResult] = await Promise.allSettled([
          administrationService.getAdministrationCore(),
          employeesService.getEmployeesDashboard(),
          recruitmentService.getRecruitmentDashboardData(),
        ]);
        const core = coreResult.status === "fulfilled" ? coreResult.value : null;
        const employeesDashboard = employeesDashboardResult.status === "fulfilled"
          ? employeesDashboardResult.value
          : {
              employees: [],
              requests: [],
              recruitmentBridge: [],
              insights: {},
              stats: [],
            };
        const recruitmentDashboard = recruitmentDashboardResult.status === "fulfilled"
          ? recruitmentDashboardResult.value
          : {
              jobRequests: [],
              candidates: [],
              interviews: [],
              evaluations: [],
              stats: [],
              pipelineSummary: [],
              recentActivity: [],
            };

        if (!core) {
          throw new Error("administration_core_unavailable");
        }

        if (!ignore) {
          setData({
            ...core,
            employeesDashboard,
            recruitmentDashboard,
            stats: [
              { key: "users", label: "Usuarios activos", value: core.users.filter((item) => item.status === "active").length, trend: `${core.users.length} usuarios registrados` },
              { key: "roles", label: "Roles configurados", value: core.roles.length, trend: "gobierno de accesos" },
              { key: "flows", label: "Flujos activos", value: core.approvalFlows.filter((item) => item.status === "active").length, trend: "matriz de autorizacion" },
              { key: "pending", label: "Pendientes por aprobar", value: core.approvalQueue.filter((item) => item.status === "pending").length, trend: "cola intermodular" },
              { key: "structures", label: "Estructuras maestras", value: core.organizations.departments.length + core.organizations.locations.length, trend: "base organizacional" },
              { key: "language", label: "Idioma activo", value: core.settings.language === "es" ? "ES" : "EN", trend: "localizacion global" },
            ],
          });
        }
      } catch {
        if (!ignore) {
          setError("No fue posible cargar Administration.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [version]);

  return {
    data,
    loading,
    error,
    refresh: () => setVersion((current) => current + 1),
  };
}
