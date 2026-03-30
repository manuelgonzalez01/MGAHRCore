import { useEffect, useState } from "react";
import { getPersonnelActionsDashboard } from "../services/personnelActions.service";

export default function usePersonnelActionsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getPersonnelActionsDashboard()
      .then((response) => {
        if (active) {
          setData(response);
          setError(null);
        }
      })
      .catch((failure) => {
        if (active) {
          setError(failure);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
