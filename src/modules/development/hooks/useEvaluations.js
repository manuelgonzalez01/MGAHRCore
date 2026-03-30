import { useCallback } from "react";
import { getEvaluationsWorkspace } from "../services/evaluations.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useEvaluations() {
  const loader = useCallback((filters) => getEvaluationsWorkspace(filters), []);
  return useDevelopmentWorkspace(loader, "evaluation-workspace");
}
