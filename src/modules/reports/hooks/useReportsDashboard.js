import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getReportsDashboard } from "../services/reports.service";

export default function useReportsDashboard() {
  const loader = useCallback((filters, language) => getReportsDashboard(filters, language), []);
  return useReportWorkspace(loader, "reports-dashboard");
}
