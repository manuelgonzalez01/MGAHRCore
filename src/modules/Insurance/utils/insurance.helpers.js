export function createInsuranceId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function slugifyInsurance(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sumBy(items = [], selector) {
  return items.reduce((acc, item, index) => acc + (Number(selector(item, index)) || 0), 0);
}

export function groupInsuranceRecords(items = [], getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item) || "Sin categoria";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function buildInsuranceDistribution(items = [], getKey, getValue = () => 1) {
  const groups = groupInsuranceRecords(items, getKey);
  return Object.entries(groups)
    .map(([label, group]) => ({
      label,
      value: roundCurrency(sumBy(group, getValue)),
      count: group.length,
    }))
    .sort((left, right) => right.value - left.value || right.count - left.count);
}

export function resolveInsuranceStatusTone(status = "") {
  switch (status) {
    case "active":
    case "approved":
    case "completed":
      return "success";
    case "pending":
    case "submitted":
    case "change_pending":
    case "scheduled":
    case "hr_review":
    case "provider_review":
    case "returned":
      return "warning";
    case "excluded":
    case "rejected":
    case "inactive":
      return "critical";
    default:
      return "neutral";
  }
}

export function getInsuranceStatusLabel(status = "", language = "es") {
  const labels = {
    es: {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      approved: "Aprobado",
      completed: "Completado",
      excluded: "Excluido",
      submitted: "Enviado",
      change_pending: "Cambio pendiente",
      scheduled: "Programado",
      hr_review: "Revision RRHH",
      provider_review: "Revision proveedor",
      returned: "Devuelto",
      rejected: "Rechazado",
      draft: "Borrador",
    },
    en: {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      approved: "Approved",
      completed: "Completed",
      excluded: "Excluded",
      submitted: "Submitted",
      change_pending: "Change pending",
      scheduled: "Scheduled",
      hr_review: "HR review",
      provider_review: "Provider review",
      returned: "Returned",
      rejected: "Rejected",
      draft: "Draft",
    },
  };

  return labels[language]?.[status] || status || (language === "en" ? "Unknown" : "Sin estado");
}

export function formatInsuranceCurrency(value, currency = "BOB", language = "es") {
  try {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "es-BO", {
      style: "currency",
      currency: currency || "BOB",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency || "BOB"} ${roundCurrency(value)}`;
  }
}

export function applyInsuranceFilters(items = [], filters = {}) {
  return items.filter((item) => {
    if (filters.companyId && item.companyId !== filters.companyId) {
      return false;
    }
    if (filters.planId && item.planId !== filters.planId) {
      return false;
    }
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    if (filters.provider && item.provider !== filters.provider) {
      return false;
    }
    if (filters.employeeType && item.employeeType !== filters.employeeType) {
      return false;
    }
    if (filters.search) {
      const haystack = [
        item.employeeName,
        item.planName,
        item.companyName,
        item.provider,
        item.dependentName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(String(filters.search).toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export function buildInsuranceSelectOptions(items = [], labelKey = "name") {
  return items.map((item) => ({
    value: item.id,
    label: item[labelKey] || item.name || item.label || item.id,
  }));
}
