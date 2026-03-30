import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getVacationReports } from "../services/vacationReports.service";

export default function useVacationAnalytics() {
  const loader = useCallback((filters) => getVacationReports(filters), []);
  return useReportWorkspace(loader, "vacations");
}
