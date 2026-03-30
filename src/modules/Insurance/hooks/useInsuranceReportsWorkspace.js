import { useCallback } from "react";
import useInsuranceWorkspace from "./useInsuranceWorkspace";
import { getInsuranceDashboard } from "../services/insurance.service";

export default function useInsuranceReportsWorkspace() {
  const loader = useCallback(() => getInsuranceDashboard(), []);
  return useInsuranceWorkspace(loader, "insurance-reports");
}
