import { useEffect, useState } from "react";
import vacationPlanningService from "../services/vacationPlanning.service";

export default function useVacationPlanning() {
  const [workspace, setWorkspace] = useState({ plans: [], conflicts: [], requests: [], balances: [] });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;
    vacationPlanningService.getVacationPlanningWorkspace().then((data) => {
      if (!ignore) {
        setWorkspace(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [version]);

  return {
    ...workspace,
    loading,
    savePlan: async (payload) => {
      const response = await vacationPlanningService.saveVacationPlan(payload);
      setVersion((current) => current + 1);
      return response;
    },
  };
}
