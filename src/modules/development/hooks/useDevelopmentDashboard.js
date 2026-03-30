import { useCallback } from "react";
import { getDevelopmentDashboard } from "../services/development.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useDevelopmentDashboard() {
  const loader = useCallback((filters, language) => getDevelopmentDashboard(filters, language), []);
  return useDevelopmentWorkspace(loader, "development-dashboard");
}
