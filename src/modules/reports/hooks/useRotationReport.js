import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getRotationReport } from "../services/workforceReports.service";

export default function useRotationReport() {
  const loader = useCallback((filters, language) => getRotationReport(filters, undefined, language), []);
  return useReportWorkspace(loader, "rotation");
}
