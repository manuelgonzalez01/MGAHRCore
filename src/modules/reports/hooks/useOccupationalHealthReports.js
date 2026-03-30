import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getOccupationalHealthReports } from "../services/serviceExperienceReports.service";

export default function useOccupationalHealthReports() {
  const loader = useCallback((filters) => getOccupationalHealthReports(filters), []);
  return useReportWorkspace(loader, "occupational-health");
}
