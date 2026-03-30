import { useCallback } from "react";
import { getEmployeeDevelopmentDossier } from "../services/developmentDossier.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useDevelopmentDossier(employeeId) {
  const loader = useCallback(() => getEmployeeDevelopmentDossier(employeeId), [employeeId]);
  return useDevelopmentWorkspace(loader, "development-dossier");
}
