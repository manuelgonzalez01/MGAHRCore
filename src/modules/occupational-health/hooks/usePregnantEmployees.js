import { useEffect, useState } from "react";
import { getOccupationalHealthDomain } from "../services/occupationalHealthDomain.service";

export default function usePregnantEmployees() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getOccupationalHealthDomain()
      .then((response) => {
        if (active) {
          setData({
            items: response.conditions.filter((item) => item.conditionType === "Embarazo" || item.conditionType === "Pregnancy"),
            cases: response.cases.filter((item) => item.title === "Embarazo" || item.title === "Pregnancy"),
          });
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
