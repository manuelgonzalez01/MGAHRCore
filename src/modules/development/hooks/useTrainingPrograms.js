import { useCallback } from "react";
import { getTrainingProgramsWorkspace } from "../services/trainingPrograms.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useTrainingPrograms() {
  const loader = useCallback((filters) => getTrainingProgramsWorkspace(filters), []);
  return useDevelopmentWorkspace(loader, "training-programs");
}
