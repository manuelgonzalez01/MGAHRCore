import usePersonnelActionsList from "./usePersonnelActionsList";

export default function useSalaryChanges() {
  return usePersonnelActionsList({ actionType: "salary_change" });
}
