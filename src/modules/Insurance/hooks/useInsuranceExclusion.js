import { useCallback } from "react";
import useInsuranceWorkspace from "./useInsuranceWorkspace";
import { getInsuranceExclusionWorkspace } from "../services/insuranceEnrollment.service";

export default function useInsuranceExclusion() {
  const loader = useCallback((filters) => getInsuranceExclusionWorkspace(filters), []);
  return useInsuranceWorkspace(loader, "insurance-exclusion");
}
