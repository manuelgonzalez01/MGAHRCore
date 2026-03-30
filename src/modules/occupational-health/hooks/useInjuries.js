import { useEffect, useState } from "react";
import { getInjuriesWorkspace } from "../services/injuries.service";

export default function useInjuries() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getInjuriesWorkspace()
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
  }, [reloadKey]);

  return { data, loading, error, reload: () => setReloadKey((current) => current + 1) };
}
