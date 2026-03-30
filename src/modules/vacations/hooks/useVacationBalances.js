import { useEffect, useState } from "react";
import vacationBalancesService from "../services/vacationBalances.service";

export default function useVacationBalances() {
  const [workspace, setWorkspace] = useState({ balances: [], policies: [], requests: [] });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;
    vacationBalancesService.getVacationBalancesWorkspace().then((data) => {
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
  };
}
