import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getHeadcountReport } from "../services/workforceReports.service";

export default function useHeadcountReport() {
  const loader = useCallback((filters) => getHeadcountReport(filters), []);
  return useReportWorkspace(loader, "headcount");
}
