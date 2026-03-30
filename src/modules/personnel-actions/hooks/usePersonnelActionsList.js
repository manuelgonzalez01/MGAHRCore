import { useEffect, useState } from "react";
import { getPersonnelActionsListWorkspace } from "../services/personnelActions.service";

const initialFilters = {
  actionType: "",
  status: "",
  employeeId: "",
  departmentId: "",
  companyId: "",
  from: "",
  to: "",
};

export default function usePersonnelActionsList(defaults = {}) {
  const [filters, setFilters] = useState({ ...initialFilters, ...defaults });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function reload(nextFilters = filters) {
    setLoading(true);
    try {
      const response = await getPersonnelActionsListWorkspace(nextFilters);
      setData(response);
      setError(null);
    } catch (failure) {
      setError(failure);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    data,
    loading,
    error,
    filters,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    resetFilters: () => setFilters({ ...initialFilters, ...defaults }),
    reload: () => reload(filters),
  };
}
