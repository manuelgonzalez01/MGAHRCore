import { useEffect, useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import useAuthStore from "../../../app/store/authStore";
import { createDevelopmentFilters, createEmptyDevelopmentFilterOptions } from "../schemas/developmentFilters.schema";
import { exportDevelopmentWorkspace, getDevelopmentFiltersOptions } from "../services/development.service";

export default function useDevelopmentWorkspace(loader, reportKey) {
  const { language } = useI18n();
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const [filters, setFilters] = useState(() => createDevelopmentFilters({ companyId: activeCompanyId || "" }));
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(createEmptyDevelopmentFilterOptions(language));
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
      const nextFilters = JSON.parse(filtersKey);
      try {
        const [nextOptions, result] = await Promise.all([
          getDevelopmentFiltersOptions(language),
          loader(nextFilters, language),
        ]);

        if (!cancelled) {
          setOptions(nextOptions);
          setData(result);
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
          setError(loadError instanceof Error ? loadError : new Error("Development workspace failed to load."));
        }

        if (typeof console !== "undefined") {
          console.error("Development workspace load failed", loadError);
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
    resetFilters: () => setFilters(createDevelopmentFilters({ companyId: activeCompanyId || "" })),
    exportReport: async (format) => {
      const result = await exportDevelopmentWorkspace(reportKey, format, filters, language);
      setExportState(result);
      return result;
    },
    reload: () => setReloadTick((current) => current + 1),
  };
}
