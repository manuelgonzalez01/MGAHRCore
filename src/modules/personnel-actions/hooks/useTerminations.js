import usePersonnelActionsList from "./usePersonnelActionsList";

export default function useTerminations() {
  return usePersonnelActionsList({ actionType: "termination" });
}
