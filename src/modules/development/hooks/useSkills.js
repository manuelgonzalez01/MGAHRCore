import { useCallback } from "react";
import { getSkillsWorkspace } from "../services/skills.service";
import useDevelopmentWorkspace from "./useDevelopmentWorkspace";

export default function useSkills() {
  const loader = useCallback((filters) => getSkillsWorkspace(filters), []);
  return useDevelopmentWorkspace(loader, "skills-workspace");
}
