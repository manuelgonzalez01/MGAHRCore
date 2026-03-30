export function createDevelopmentFilters(defaults = {}) {
  return {
    companyId: defaults.companyId || "",
    departmentId: defaults.departmentId || "",
    positionId: defaults.positionId || "",
    levelId: defaults.levelId || "",
    cycleId: defaults.cycleId || "",
    status: defaults.status || "",
    category: defaults.category || "",
    readiness: defaults.readiness || "",
  };
}

export function createEmptyDevelopmentFilterOptions(language = "es") {
  const allLabel = language === "en" ? "All" : "Todos";
  return {
    companies: [{ value: "", label: allLabel }],
    departments: [{ value: "", label: allLabel }],
    positions: [{ value: "", label: allLabel }],
    levels: [{ value: "", label: allLabel }],
    cycles: [{ value: "", label: allLabel }],
    statuses: [{ value: "", label: allLabel }],
    categories: [{ value: "", label: allLabel }],
    readiness: [{ value: "", label: allLabel }],
  };
}
