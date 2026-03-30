import { useEffect, useState } from "react";
import employeesService from "../services/employees.service";

function getCurrentLanguage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return "es";
  }

  const directLanguage = window.localStorage.getItem("mgahrcore.language");
  return directLanguage === "en" ? "en" : "es";
}

export default function useEmployees() {
  const [dashboard, setDashboard] = useState({
    employees: [],
    requests: [],
    recruitmentBridge: [],
    stats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await employeesService.getEmployeesDashboard();
        if (!ignore) {
          setDashboard(data);
        }
      } catch {
        if (!ignore) {
          setError(getCurrentLanguage() === "en" ? "Could not load Employees." : "No fue posible cargar Employees.");
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
    dashboard,
    loading,
    error,
    refresh: () => setVersion((current) => current + 1),
  };
}
