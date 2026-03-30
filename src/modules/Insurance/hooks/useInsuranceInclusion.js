import { useCallback } from "react";
import useInsuranceWorkspace from "./useInsuranceWorkspace";
import { getInsuranceInclusionWorkspace } from "../services/insuranceEnrollment.service";

export default function useInsuranceInclusion() {
  const loader = useCallback((filters) => getInsuranceInclusionWorkspace(filters), []);
  return useInsuranceWorkspace(loader, "insurance-inclusion");
}
