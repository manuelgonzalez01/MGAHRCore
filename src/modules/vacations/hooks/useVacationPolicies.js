import { useEffect, useState } from "react";
import vacationPoliciesService from "../services/vacationPolicies.service";

export default function useVacationPolicies() {
  const [workspace, setWorkspace] = useState({ policies: [], rules: [], organizations: null, approvalFlow: null });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    vacationPoliciesService.getVacationPoliciesWorkspace().then((data) => {
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
    savePolicy: async (payload) => {
      const response = await vacationPoliciesService.saveVacationPolicy(payload);
      setVersion((current) => current + 1);
      return response;
    },
    saveRule: async (payload) => {
      const response = await vacationPoliciesService.saveVacationRule(payload);
      setVersion((current) => current + 1);
      return response;
    },
    deletePolicy: async (policyId) => {
      const response = await vacationPoliciesService.removeVacationPolicy(policyId);
      setVersion((current) => current + 1);
      return response;
    },
    deleteRule: async (ruleId) => {
      const response = await vacationPoliciesService.removeVacationRule(ruleId);
      setVersion((current) => current + 1);
      return response;
    },
  };
}
