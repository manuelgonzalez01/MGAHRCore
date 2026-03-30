import { useEffect, useState } from "react";
import { getExitLettersWorkspace } from "../services/personnelActions.service";

export default function useExitLetters() {
  const [data, setData] = useState({ letters: [], actions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getExitLettersWorkspace()
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
