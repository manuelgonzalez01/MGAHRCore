import { useEffect, useState } from "react";
import vacationsService from "../services/vacations.service";

const initialState = {
  dashboard: {},
  policies: [],
  balances: [],
  requests: [],
  approvalQueue: [],
  plans: [],
  conflicts: [],
  reports: {},
  history: [],
  calendar: [],
  approvalFlow: null,
  organizations: null,
};

export default function useVacationDashboard() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    vacationsService.getVacationsDashboard().then((data) => {
      if (!ignore) {
        setState(data);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [version]);

  return {
    ...state,
    loading,
    refresh: () => {
      setLoading(true);
      setVersion((current) => current + 1);
    },
  };
}
