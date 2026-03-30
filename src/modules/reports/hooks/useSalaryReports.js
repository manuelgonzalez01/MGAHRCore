import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getSalaryReports } from "../services/salaryReports.service";

export default function useSalaryReports() {
  const loader = useCallback((filters) => getSalaryReports(filters), []);
  return useReportWorkspace(loader, "salary");
}
