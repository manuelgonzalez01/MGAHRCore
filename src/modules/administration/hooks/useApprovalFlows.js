import { useEffect, useState } from "react";
import administrationService from "../services/administration.service";

export default function useApprovalFlows() {
  const [flows, setFlows] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([administrationService.getApprovalFlows(), administrationService.getApprovalQueue()]).then(
      ([flowsData, queueData]) => {
        if (!ignore) {
          setFlows(flowsData);
          setQueue(queueData);
          setLoading(false);
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [version]);

  return {
    flows,
    queue,
    loading,
    saveFlow: async (payload) => {
      const result = await administrationService.saveApprovalFlow(payload);
      setVersion((current) => current + 1);
      return result;
    },
    deleteFlow: async (flowId) => {
      const result = await administrationService.deleteApprovalFlow(flowId);
      setVersion((current) => current + 1);
      return result;
    },
    updateRequestStatus: async (requestId, status) => {
      const result = await administrationService.updateApprovalRequestStatus(requestId, status);
      setVersion((current) => current + 1);
      return result;
    },
  };
}
