import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getLegalReports } from "../services/complianceReports.service";

export default function useLegalReports() {
  const loader = useCallback((filters) => getLegalReports(filters), []);
  return useReportWorkspace(loader, "legal");
}
