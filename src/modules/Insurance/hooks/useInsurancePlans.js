import { useCallback } from "react";
import useInsuranceWorkspace from "./useInsuranceWorkspace";
import { getInsurancePlansWorkspace } from "../services/insurancePlans.service";

export default function useInsurancePlans() {
  const loader = useCallback((filters) => getInsurancePlansWorkspace(filters), []);
  return useInsuranceWorkspace(loader, "insurance-plans");
}
