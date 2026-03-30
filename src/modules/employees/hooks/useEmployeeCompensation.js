import { useMemo } from "react";
import useEmployeeProfile from "./useEmployeeProfile";

export default function useEmployeeCompensation() {
  const profile = useEmployeeProfile();

  const compensationSummary = useMemo(() => {
    const salary = profile.employee?.salary || {};

    return {
      baseSalary: Number(salary.baseSalary) || 0,
      variable: Number(salary.variable) || 0,
      marketMedian: Number(salary.marketMedian) || 0,
      internalMedian: Number(salary.internalMedian) || 0,
      currency: salary.currency || "BOB",
      compaRatio: Number(salary.compaRatio) || 0,
      benefitsCount: Array.isArray(salary.benefits) ? salary.benefits.length : 0,
      movements: Array.isArray(salary.salaryHistory) ? salary.salaryHistory.length : 0,
    };
  }, [profile.employee]);

  return {
    ...profile,
    compensationSummary,
  };
}
