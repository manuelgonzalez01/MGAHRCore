import { useEffect, useState } from "react";
import { getSelfServiceApprovalsWorkspace } from "../services/selfService.service";

export default function useSelfServiceApprovals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getSelfServiceApprovalsWorkspace()
      .then((response) => {
        if (!active) return;
        setData(response);
        setError(null);
      })
      .catch((failure) => {
        if (!active) return;
        setError(failure);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return {
    data,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
