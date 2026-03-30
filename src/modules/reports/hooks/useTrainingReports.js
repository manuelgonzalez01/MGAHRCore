import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getTrainingReports } from "../services/developmentReports.service";

export default function useTrainingReports() {
  const loader = useCallback((filters) => getTrainingReports(filters), []);
  return useReportWorkspace(loader, "training");
}
