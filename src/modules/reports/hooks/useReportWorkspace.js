import { useEffect, useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import useAuthStore from "../../../app/store/authStore";
import { createEmptyFilterOptions, createReportFilters } from "../schemas/reportsFilters.schema";
import { exportReportMock, getReportsFiltersOptions } from "../services/reports.service";

export default function useReportWorkspace(loader, reportKey) {
  const { language } = useI18n();
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const [filters, setFilters] = useState(() => createReportFilters({ companyId: activeCompanyId || "" }));
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(createEmptyFilterOptions(language));
  const [loading, setLoading] = useState(true);
  const [exportState, setExportState] = useState(null);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const nextFilters = JSON.parse(filtersKey);
      const [nextOptions, nextData] = await Promise.all([
        getReportsFiltersOptions(language),
        loader(nextFilters, language),
      ]);

      if (!cancelled) {
        setOptions(nextOptions);
        setData(nextData);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filtersKey, language, loader]);

  return {
    data,
    filters,
    options,
    loading,
    exportState,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    resetFilters: () => setFilters(createReportFilters({ companyId: activeCompanyId || "" })),
    exportReport: async (format) => {
      const result = await exportReportMock(reportKey, format, filters, language);
      setExportState(result);
      return result;
    },
  };
}
