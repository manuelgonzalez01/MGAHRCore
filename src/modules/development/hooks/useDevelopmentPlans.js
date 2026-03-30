import { useCallback } from "react";
import { getDevelopmentPlansWorkspace } from "../services/developmentPlans.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useDevelopmentPlans() {
  const loader = useCallback((filters) => getDevelopmentPlansWorkspace(filters), []);
  return useDevelopmentWorkspace(loader, "development-plans");
}
