import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getSelfServiceReports } from "../services/serviceExperienceReports.service";

export default function useSelfServiceReports() {
  const loader = useCallback((filters) => getSelfServiceReports(filters), []);
  return useReportWorkspace(loader, "self-service");
}
