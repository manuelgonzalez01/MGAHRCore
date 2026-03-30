import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getInsuranceReports } from "../services/serviceExperienceReports.service";

export default function useInsuranceReports() {
  const loader = useCallback((filters) => getInsuranceReports(filters), []);
  return useReportWorkspace(loader, "insurance");
}
