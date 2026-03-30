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
        const [core, employeesDashboard] = await Promise.all([
          administrationService.getAdministrationCore(),
          employeesService.getEmployeesDashboard(),
        ]);
        const recruitmentDashboard = recruitmentService.getRecruitmentDashboardData();

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
