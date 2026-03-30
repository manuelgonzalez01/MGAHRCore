import { useEffect, useState } from "react";
import vacationsService from "../services/vacations.service";

export default function useVacations() {
  const [workspace, setWorkspace] = useState({
    flow: null,
    balances: [],
    requests: [],
    planning: [],
    approvals: [],
    history: [],
    stats: {
      employeesTracked: 0,
      approvedDays: 0,
      pendingRequests: 0,
      averageAvailable: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    vacationsService.getVacationsWorkspace().then((data) => {
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
    refresh: () => {
      setLoading(true);
      setVersion((current) => current + 1);
    },
    createRequest: async (payload) => {
      setLoading(true);
      const result = await vacationsService.createVacationRequest(payload);
      setVersion((current) => current + 1);
      return result;
    },
    updateStatus: async (requestId, status, actor) => {
      setLoading(true);
      const result = await vacationsService.updateVacationRequestStatus(requestId, status, actor);
      setVersion((current) => current + 1);
      return result;
    },
  };
}
