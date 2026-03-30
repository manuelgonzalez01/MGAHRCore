import { useMemo } from "react";
import useEmployeeProfile from "./useEmployeeProfile";
import { buildEmployeeTimeline } from "../utils/employee.helpers";

export default function useEmployeeHistory() {
  const profile = useEmployeeProfile();

  const history = useMemo(() => {
    if (!profile.employee) {
      return [];
    }

    if (Array.isArray(profile.employee.history) && profile.employee.history.length) {
      return profile.employee.history;
    }

    return buildEmployeeTimeline(profile.employee);
  }, [profile.employee]);

  return {
    ...profile,
    history,
  };
}
