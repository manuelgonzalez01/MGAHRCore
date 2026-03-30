export function createPersonnelActionId(prefix = "PACT") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-5)}`;
}

export function roundAmount(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function sumBy(items = [], selector = (item) => item) {
  return items.reduce((total, item) => total + (Number(selector(item)) || 0), 0);
}

export function averageBy(items = [], selector = (item) => item) {
  if (!items.length) {
    return 0;
  }

  return roundAmount(sumBy(items, selector) / items.length);
}

export function daysBetween(start, end) {
  if (!start || !end) {
    return 0;
  }

  const difference = new Date(end).getTime() - new Date(start).getTime();
  return difference > 0 ? Math.round(difference / 86400000) : 0;
}

export function formatCurrency(value, currency = "BOB", language = "es") {
  try {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "es-BO", {
      style: "currency",
      currency: currency || "BOB",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency || "BOB"} ${Number(value) || 0}`;
  }
}

export function buildFilterOptions(items = [], labelKey = "name") {
  return items.map((item) => ({
    value: item.id,
    label: item[labelKey] || item.name || item.title || item.id,
  }));
}

export function describeImpact(impact = {}, language = "es") {
  const changes = Object.values(impact).filter((item) => item && item.changed);
  if (!changes.length) {
    return language === "en" ? "No structural changes" : "Sin cambios estructurales";
  }

  return changes.map((item) => item.label).join(", ");
}
