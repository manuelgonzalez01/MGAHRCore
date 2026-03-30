export function createInsuranceFilters(initial = {}) {
  return {
    companyId: initial.companyId || "",
    planId: initial.planId || "",
    status: initial.status || "",
    provider: initial.provider || "",
    employeeType: initial.employeeType || "",
    search: initial.search || "",
  };
}

export function createEmptyInsuranceFilterOptions(language = "es") {
  const allLabel = language === "en" ? "All" : "Todos";

  return {
    companies: [{ value: "", label: allLabel }],
    plans: [{ value: "", label: allLabel }],
    statuses: [{ value: "", label: allLabel }],
    providers: [{ value: "", label: allLabel }],
    employeeTypes: [{ value: "", label: allLabel }],
    levels: [{ value: "", label: allLabel }],
  };
}
