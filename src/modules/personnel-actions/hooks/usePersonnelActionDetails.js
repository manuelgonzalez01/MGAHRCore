import { useEffect, useState } from "react";
import { getPersonnelActionDetailsWorkspace } from "../services/personnelActions.service";

export default function usePersonnelActionDetails(actionId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getPersonnelActionDetailsWorkspace(actionId)
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
  }, [actionId]);

  return { data, loading, error };
}
