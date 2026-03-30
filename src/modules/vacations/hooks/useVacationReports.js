import { useEffect, useState } from "react";
import vacationReportsService from "../services/vacationReports.service";

export default function useVacationReports() {
  const [workspace, setWorkspace] = useState({
    dashboard: {},
    operational: [],
    expiringBalances: [],
    highBalanceEmployees: [],
    planningCompliance: [],
    liability: 0,
    riskSummary: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    vacationReportsService.getVacationReportsWorkspace().then((data) => {
      if (!ignore) {
        setWorkspace(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  return {
    ...workspace,
    loading,
  };
}
