import { useCallback } from "react";
import { getTalentReadinessWorkspace } from "../services/talentReadiness.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useTalentReadiness() {
  const loader = useCallback((filters) => getTalentReadinessWorkspace(filters), []);
  return useDevelopmentWorkspace(loader, "talent-readiness");
}
