export function getReportPeriodOptions(language = "es") {
  return language === "en"
    ? [
        { value: "all", label: "Full history" },
        { value: "last_30_days", label: "Last 30 days" },
        { value: "last_90_days", label: "Last 90 days" },
        { value: "last_12_months", label: "Last 12 months" },
        { value: "current_year", label: "Current year" },
      ]
    : [
        { value: "all", label: "Todo el historial" },
        { value: "last_30_days", label: "Ultimos 30 dias" },
        { value: "last_90_days", label: "Ultimos 90 dias" },
        { value: "last_12_months", label: "Ultimos 12 meses" },
        { value: "current_year", label: "Gestion actual" },
      ];
}

export function getReportStatusOptions(language = "es") {
  return language === "en"
    ? [
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "leave", label: "On leave" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "critical", label: "Critical" },
      ]
    : [
        { value: "", label: "Todos los estados" },
        { value: "active", label: "Activo" },
        { value: "leave", label: "En licencia" },
        { value: "inactive", label: "Inactivo" },
        { value: "pending", label: "Pendiente" },
        { value: "approved", label: "Aprobado" },
        { value: "critical", label: "Critico" },
      ];
}

export function getReportEmployeeTypeOptions(language = "es") {
  return language === "en"
    ? [
        { value: "", label: "All employee types" },
        { value: "onsite", label: "On site" },
        { value: "hybrid", label: "Hybrid" },
        { value: "remote", label: "Remote" },
      ]
    : [
        { value: "", label: "Todos los tipos" },
        { value: "onsite", label: "Presencial" },
        { value: "hybrid", label: "Hibrido" },
        { value: "remote", label: "Remoto" },
      ];
}

export function getReportModuleOptions(language = "es") {
  return language === "en"
    ? [
        { value: "", label: "All sources" },
        { value: "employees", label: "Employees" },
        { value: "recruitment", label: "Recruitment" },
        { value: "vacations", label: "Vacations" },
        { value: "personnel-actions", label: "Personnel Actions" },
        { value: "development", label: "Development" },
        { value: "administration", label: "Administration" },
      ]
    : [
        { value: "", label: "Todas las fuentes" },
        { value: "employees", label: "Employees" },
        { value: "recruitment", label: "Recruitment" },
        { value: "vacations", label: "Vacations" },
        { value: "personnel-actions", label: "Personnel Actions" },
        { value: "development", label: "Development" },
        { value: "administration", label: "Administration" },
      ];
}

export const REPORT_FILTER_DEFAULTS = {
  companyId: "",
  locationId: "",
  departmentId: "",
  positionId: "",
  levelId: "",
  period: "last_12_months",
  status: "",
  employeeType: "",
  module: "",
};

export function getReportFilterFields(language = "es") {
  return language === "en"
    ? [
        { key: "companyId", label: "Company" },
        { key: "locationId", label: "Location" },
        { key: "departmentId", label: "Department" },
        { key: "positionId", label: "Position" },
        { key: "levelId", label: "Level" },
        { key: "period", label: "Period" },
        { key: "status", label: "Status" },
        { key: "employeeType", label: "Employee type" },
        { key: "module", label: "Source" },
      ]
    : [
        { key: "companyId", label: "Compania" },
        { key: "locationId", label: "Localizacion" },
        { key: "departmentId", label: "Departamento" },
        { key: "positionId", label: "Posicion" },
        { key: "levelId", label: "Nivel" },
        { key: "period", label: "Periodo" },
        { key: "status", label: "Estado" },
        { key: "employeeType", label: "Tipo de empleado" },
        { key: "module", label: "Fuente" },
      ];
}

export function createReportFilters(overrides = {}) {
  return {
    ...REPORT_FILTER_DEFAULTS,
    ...overrides,
  };
}

export function createEmptyFilterOptions(language = "es") {
  return {
    companies: [],
    locations: [],
    departments: [],
    positions: [],
    levels: [],
    periods: getReportPeriodOptions(language),
    statuses: getReportStatusOptions(language),
    employeeTypes: getReportEmployeeTypeOptions(language),
    modules: getReportModuleOptions(language),
  };
}
