import { useEffect, useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import useAuthStore from "../../../app/store/authStore";
import { createEmptyInsuranceFilterOptions, createInsuranceFilters } from "../schemas/insuranceFilters.schema";
import { exportInsuranceWorkspace, getInsuranceFiltersOptions } from "../services/insurance.service";

export default function useInsuranceWorkspace(loader, reportKey) {
  const { language } = useI18n();
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const [filters, setFilters] = useState(() => createInsuranceFilters({ companyId: activeCompanyId || "" }));
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(createEmptyInsuranceFilterOptions(language));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportState, setExportState] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextFilters = JSON.parse(filtersKey);
        const [nextOptions, nextData] = await Promise.all([
          getInsuranceFiltersOptions(language),
          loader(nextFilters, language),
        ]);

        if (!cancelled) {
          setOptions(nextOptions);
          setData(nextData);
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error("Insurance workspace failed to load."));
          setData(null);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filtersKey, language, loader, reloadTick]);

  return {
    data,
    filters,
    options,
    loading,
    error,
    exportState,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    resetFilters: () => setFilters(createInsuranceFilters({ companyId: activeCompanyId || "" })),
    exportReport: async (format) => {
      const result = await exportInsuranceWorkspace(reportKey, format, filters, language);
      setExportState(result);
      return result;
    },
    reload: () => setReloadTick((current) => current + 1),
  };
}
