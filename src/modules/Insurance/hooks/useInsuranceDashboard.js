import { useCallback } from "react";
import useInsuranceWorkspace from "./useInsuranceWorkspace";
import { getInsuranceDashboard } from "../services/insurance.service";

export default function useInsuranceDashboard() {
  const loader = useCallback(() => getInsuranceDashboard(), []);
  return useInsuranceWorkspace(loader, "insurance-dashboard");
}
