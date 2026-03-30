import {
  getReportEmployeeTypeOptions,
  getReportModuleOptions,
  getReportPeriodOptions,
  getReportStatusOptions,
} from "../schemas/reportsFilters.schema";

export function toNumber(value) {
  return Number(value) || 0;
}

export function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor;
}

export function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + toNumber(value), 0) / values.length;
}

export function sumBy(items = [], selector) {
  return items.reduce((sum, item) => sum + toNumber(selector(item)), 0);
}

export function uniqueBy(items = [], selector) {
  const seen = new Set();

  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

export function createLookup(items = [], key = "id") {
  return new Map(items.map((item) => [item[key], item]));
}

export function buildOptions(items = [], labelKey = "name", valueKey = "id", fallbackLabel = "Sin definir") {
  return items
    .filter(Boolean)
    .map((item) => ({
      value: item[valueKey] || item[labelKey] || "",
      label: item[labelKey] || fallbackLabel,
    }))
    .filter((item) => item.value && item.label)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getPeriodStart(period = "last_12_months") {
  const now = new Date();

  switch (period) {
    case "last_30_days":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    case "last_90_days":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    case "current_year":
      return new Date(now.getFullYear(), 0, 1);
    case "last_12_months":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
}

export function isDateInPeriod(dateValue, period = "last_12_months") {
  if (!dateValue || period === "all") {
    return true;
  }

  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const start = getPeriodStart(period);
  return !start || target >= start;
}

export function calculateTenureMonths(startDate) {
  if (!startDate) {
    return 0;
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

export function calculateTenureLabel(months = 0) {
  if (months < 12) {
    return `${months} m`;
  }

  return `${round(months / 12, 1)} y`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("es-BO").format(toNumber(value));
}

export function formatCurrency(value, currency = "BOB") {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatPercent(value, digits = 1) {
  return `${round(value, digits)}%`;
}

export function groupBy(items = [], keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}

export function buildDistribution(items = [], key, valueSelector = () => 1, fallback = "Sin definir") {
  const grouped = groupBy(items, (item) => item[key] || fallback);

  return Object.entries(grouped)
    .map(([label, records]) => ({
      label,
      count: records.length,
      value: round(sumBy(records, valueSelector), 0),
    }))
    .sort((left, right) => right.count - left.count || right.value - left.value);
}

export function applyFilters(records = [], filters = {}, config = {}) {
  const {
    dateKey = "date",
    companyKey = "companyId",
    locationKey = "locationId",
    departmentKey = "departmentId",
    positionKey = "positionId",
    levelKey = "levelId",
    statusKey = "status",
    employeeTypeKey = "employeeType",
    moduleKey = "module",
  } = config;

  return records.filter((record) => {
    if (filters.companyId && record[companyKey] !== filters.companyId) {
      return false;
    }
    if (filters.locationId && record[locationKey] !== filters.locationId) {
      return false;
    }
    if (filters.departmentId && record[departmentKey] !== filters.departmentId) {
      return false;
    }
    if (filters.positionId && record[positionKey] !== filters.positionId) {
      return false;
    }
    if (filters.levelId && record[levelKey] !== filters.levelId) {
      return false;
    }
    if (filters.status && normalizeText(record[statusKey]) !== normalizeText(filters.status)) {
      return false;
    }
    if (filters.employeeType && normalizeText(record[employeeTypeKey]) !== normalizeText(filters.employeeType)) {
      return false;
    }
    if (filters.module && normalizeText(record[moduleKey]) !== normalizeText(filters.module)) {
      return false;
    }
    if (filters.period && !isDateInPeriod(record[dateKey], filters.period)) {
      return false;
    }

    return true;
  });
}

export function createFilterOptionsFromContext(organizations, language = "es") {
  const prependAll = (label, items) => [{ value: "", label }, ...items];
  const labels = language === "en"
    ? {
        companies: "All companies",
        locations: "All locations",
        departments: "All departments",
        positions: "All positions",
        levels: "All levels",
      }
    : {
        companies: "Todas las companias",
        locations: "Todas las localizaciones",
        departments: "Todos los departamentos",
        positions: "Todas las posiciones",
        levels: "Todos los niveles",
      };

  return {
    companies: prependAll(labels.companies, buildOptions(organizations.companies)),
    locations: prependAll(labels.locations, buildOptions(organizations.locations)),
    departments: prependAll(labels.departments, buildOptions(organizations.departments)),
    positions: prependAll(labels.positions, buildOptions(organizations.positions)),
    levels: prependAll(labels.levels, buildOptions(organizations.levels)),
    periods: getReportPeriodOptions(language),
    statuses: getReportStatusOptions(language),
    employeeTypes: getReportEmployeeTypeOptions(language),
    modules: getReportModuleOptions(language),
  };
}

export function createMonthlySeries(items = [], dateKey = "date", valueKey = null, lastMonths = 6) {
  const now = new Date();
  const buckets = [];

  for (let index = lastMonths - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: date.toLocaleDateString("es-BO", { month: "short", year: "2-digit" }),
      value: 0,
    });
  }

  items.forEach((item) => {
    const date = new Date(item[dateKey]);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.find((entry) => entry.key === key);
    if (bucket) {
      bucket.value += valueKey ? toNumber(item[valueKey]) : 1;
    }
  });

  return buckets;
}

export function getMaxSeriesValue(series = []) {
  return series.reduce((max, item) => Math.max(max, toNumber(item.value)), 0) || 1;
}

export function buildReportExportSummary(reportKey, format, filters, language = "es") {
  const timestamp = new Date().toISOString();
  return {
    id: `EXP-${Date.now()}`,
    reportKey,
    format,
    timestamp,
    fileName: `mgahrcore-${reportKey}-${timestamp.slice(0, 10)}.${format}`,
    scope: {
      companyId: filters.companyId || "all",
      period: filters.period || "all",
      module: filters.module || "all",
    },
    message: language === "en"
      ? `Export prepared for ${reportKey} in ${format.toUpperCase()} format.`
      : `Exportacion preparada para ${reportKey} en formato ${format.toUpperCase()}.`,
  };
}
