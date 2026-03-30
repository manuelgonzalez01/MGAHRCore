import { useEffect, useState } from "react";
import { getInsurancePlanDetail } from "../services/insurancePlans.service";

export default function useInsurancePlanDetail(planId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(planId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await getInsurancePlanDetail(planId);
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error("Insurance plan detail failed to load."));
          setLoading(false);
        }
      }
    }

    if (planId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [planId]);

  return { data, loading, error };
}
