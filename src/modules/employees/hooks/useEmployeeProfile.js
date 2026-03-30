import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import employeesService from "../services/employees.service";

function getCurrentLanguage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return "es";
  }

  const directLanguage = window.localStorage.getItem("mgahrcore.language");
  return directLanguage === "en" ? "en" : "es";
}

export default function useEmployeeProfile() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employee");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const item = await employeesService.getEmployeeById(employeeId);
        if (!ignore) {
          setEmployee(item);
          if (item?.id) {
            employeesService.setActiveEmployeeId(item.id);
          }
        }
      } catch {
        if (!ignore) {
          setError(getCurrentLanguage() === "en" ? "Could not load employee." : "No fue posible cargar el colaborador.");
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
  }, [employeeId, version]);

  return {
    employee,
    loading,
    error,
    refresh: () => setVersion((current) => current + 1),
  };
}
