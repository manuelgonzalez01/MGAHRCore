import { useEffect, useState } from "react";
import vacationRequestsService from "../services/vacationRequests.service";

export default function useVacationRequests() {
  const [workspace, setWorkspace] = useState({ requests: [], employees: [], balances: [], policies: [], rules: [], conflicts: [] });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let ignore = false;
    vacationRequestsService.getVacationRequestsWorkspace().then((data) => {
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
    saveRequest: async (payload) => {
      const response = await vacationRequestsService.saveVacationRequest(payload);
      setVersion((current) => current + 1);
      return response;
    },
    submitRequest: async (requestId, payload) => {
      const response = await vacationRequestsService.submitVacationRequest(requestId, payload);
      setVersion((current) => current + 1);
      return response;
    },
    preview,
    simulate: async (payload) => {
      const response = await vacationRequestsService.previewVacationRequest(payload);
      setPreview(response);
      return response;
    },
    amendRequest: async (requestId, payload) => {
      const response = await vacationRequestsService.amendVacationRequest(requestId, payload);
      setVersion((current) => current + 1);
      return response;
    },
  };
}
