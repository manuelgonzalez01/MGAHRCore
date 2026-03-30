import { useEffect, useState } from "react";
import vacationApprovalsService from "../services/vacationApprovals.service";

export default function useVacationApprovals() {
  const [workspace, setWorkspace] = useState({ queue: [], approvalFlow: null, history: [], requests: [] });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;
    vacationApprovalsService.getVacationApprovalsWorkspace().then((data) => {
      if (!ignore) {
        setWorkspace(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [version]);

  const refresh = () => {
    setLoading(true);
    setVersion((current) => current + 1);
  };

  return {
    ...workspace,
    loading,
    refresh,
    approve: async (requestId, payload) => {
      const response = await vacationApprovalsService.approveVacationRequest(requestId, payload);
      refresh();
      return response;
    },
    reject: async (requestId, payload) => {
      const response = await vacationApprovalsService.rejectVacationRequest(requestId, payload);
      refresh();
      return response;
    },
    returnForChanges: async (requestId, payload) => {
      const response = await vacationApprovalsService.returnVacationRequest(requestId, payload);
      refresh();
      return response;
    },
    delegate: async (requestId, payload) => {
      const response = await vacationApprovalsService.delegateVacationApproval(requestId, payload);
      refresh();
      return response;
    },
  };
}
