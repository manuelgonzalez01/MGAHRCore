import { useCallback } from "react";
import useReportWorkspace from "./useReportWorkspace";
import { getRecruitmentReports } from "../services/recruitmentReports.service";

export default function useRecruitmentReports() {
  const loader = useCallback((filters) => getRecruitmentReports(filters), []);
  return useReportWorkspace(loader, "recruitment");
}
