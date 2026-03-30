import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getWorkforceRiskReport } from "../services/workforceReports.service";

export default function useWorkforceRiskReport() {
  const loader = useCallback((filters) => getWorkforceRiskReport(filters), []);
  return useReportWorkspace(loader, "workforce-risk");
}
