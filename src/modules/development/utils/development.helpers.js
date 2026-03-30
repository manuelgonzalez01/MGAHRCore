export function toNumber(value) {
  return Number(value) || 0;
}

export function average(items = []) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((sum, item) => sum + toNumber(item), 0) / items.length;
}

export function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor;
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

export function buildDistribution(items = [], keyFn, valueFn = null) {
  const grouped = groupBy(items, keyFn);

  return Object.entries(grouped).map(([label, records]) => ({
    label,
    count: records.length,
    value: valueFn ? round(records.reduce((sum, item) => sum + toNumber(valueFn(item)), 0), 0) : records.length,
  })).sort((left, right) => right.count - left.count || right.value - left.value);
}

export function formatPercent(value) {
  return `${round(value, 1)}%`;
}

export function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function applyTalentFilters(items = [], filters = {}) {
  return items.filter((item) => {
    if (filters.companyId && item.companyId !== filters.companyId) {
      return false;
    }

    if (filters.departmentId && item.departmentId !== filters.departmentId) {
      return false;
    }

    if (filters.positionId && item.positionId !== filters.positionId) {
      return false;
    }

    if (filters.levelId && item.levelId !== filters.levelId) {
      return false;
    }

    if (filters.cycleId && item.cycleId !== filters.cycleId) {
      return false;
    }

    if (filters.status) {
      const status = String(item.workflowStatus || item.status || item.healthStatus || item.developmentPriority || "").toLowerCase();
      if (status !== String(filters.status).toLowerCase()) {
        return false;
      }
    }

    if (filters.category) {
      const category = String(item.category || item.audience || "").toLowerCase();
      if (category !== String(filters.category).toLowerCase()) {
        return false;
      }
    }

    if (filters.readiness) {
      const readiness = String(item.promotionReadiness || "").toLowerCase();
      if (readiness !== String(filters.readiness).toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

export function buildSelectOptions(items = [], labelKey = "name") {
  return items
    .filter(Boolean)
    .map((item) => ({
      value: item.id || item.value || item.name,
      label: item[labelKey] || item.label || item.name,
    }))
    .filter((item, index, array) => item.value && array.findIndex((candidate) => candidate.value === item.value) === index);
}

export function buildPrimitiveOptions(items = [], language = "es") {
  const allLabel = language === "en" ? "All" : "Todos";

  return [
    { value: "", label: allLabel },
    ...items
      .filter(Boolean)
      .map((item) => ({ value: item.value || item, label: item.label || item }))
      .filter((item, index, array) => array.findIndex((candidate) => candidate.value === item.value) === index),
  ];
}

export function formatDevelopmentDate(value) {
  if (!value) {
    return "-";
  }

  return value;
}

export function getEvaluationStatusTone(status = "") {
  switch (status) {
    case "completed":
      return "success";
    case "in_review":
      return "warning";
    case "scheduled":
      return "info";
    default:
      return "neutral";
  }
}

export function getTrainingStatusTone(status = "") {
  switch (status) {
    case "healthy":
      return "success";
    case "in_progress":
      return "warning";
    case "attention":
      return "critical";
    default:
      return "info";
  }
}

export function getReadinessTone(status = "") {
  switch (status) {
    case "ready_now":
      return "success";
    case "ready_soon":
      return "warning";
    case "developing":
      return "info";
    default:
      return "neutral";
  }
}

export function getPlanStatusTone(status = "") {
  switch (status) {
    case "approved":
      return "success";
    case "completed":
      return "success";
    case "talent_review":
    case "manager_review":
      return "warning";
    case "returned_for_changes":
    case "rejected":
      return "critical";
    case "submitted":
      return "info";
    case "draft":
    case "archived":
      return "neutral";
    case "at_risk":
      return "critical";
    case "in_progress":
      return "warning";
    default:
      return "info";
  }
}

export function getSkillLevelTone(level = "") {
  switch (level) {
    case "advanced":
    case "expert":
      return "success";
    case "developing":
      return "warning";
    case "critical_gap":
      return "critical";
    default:
      return "info";
  }
}
