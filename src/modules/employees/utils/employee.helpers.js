const LANGUAGE_STORAGE_KEY = "mgahrcore.language";
const ADMIN_SETTINGS_KEY = "mgahrcore.administration.settings";

function getCurrentLanguage() {
  if (typeof window === "undefined") {
    return "es";
  }

  try {
    const directLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (directLanguage === "en" || directLanguage === "es") {
      return directLanguage;
    }

    const settings = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed?.language === "en" || parsed?.language === "es") {
        return parsed.language;
      }
    }
  } catch {
    return document?.documentElement?.lang === "en" ? "en" : "es";
  }

  return document?.documentElement?.lang === "en" ? "en" : "es";
}

function resolveLocale(locale) {
  if (locale) {
    return locale;
  }

  return getCurrentLanguage() === "en" ? "en-US" : "es-BO";
}

export function getInitials(name) {
  return String(name || "SN")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatCurrency(value, currency = "BOB", locale) {
  const resolvedLocale = resolveLocale(locale);

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: "BOB",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }
}

export function formatDate(value, locale, options = {}) {
  if (!value) {
    return resolveLocale(locale) === "en-US" ? "No date" : "Sin fecha";
  }

  try {
    return new Intl.DateTimeFormat(resolveLocale(locale), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatNumber(value, locale) {
  return new Intl.NumberFormat(resolveLocale(locale)).format(Number(value) || 0);
}

export function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

export function formatFileSize(value, locale) {
  const size = Number(value) || 0;

  if (!size) {
    return resolveLocale(locale) === "en-US" ? "No size" : "Sin tamano";
  }

  const units = ["B", "KB", "MB", "GB"];
  let amount = size;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const formatter = new Intl.NumberFormat(resolveLocale(locale), {
    minimumFractionDigits: unitIndex === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });

  return `${formatter.format(amount)} ${units[unitIndex]}`;
}

export function getStatusMeta(status) {
  const isEnglish = getCurrentLanguage() === "en";
  const map = {
    active: { label: isEnglish ? "Active" : "Activo", tone: "success" },
    leave: { label: isEnglish ? "On leave" : "En licencia", tone: "warning" },
    pending: { label: isEnglish ? "Pending" : "Pendiente", tone: "warning" },
    approved: { label: isEnglish ? "Approved" : "Aprobado", tone: "success" },
    rejected: { label: isEnglish ? "Rejected" : "Rechazado", tone: "critical" },
    missing: { label: isEnglish ? "Missing" : "Faltante", tone: "critical" },
    planned: { label: isEnglish ? "Planned" : "Planificado", tone: "info" },
    completed: { label: isEnglish ? "Completed" : "Completado", tone: "neutral" },
    inactive: { label: isEnglish ? "Inactive" : "Inactivo", tone: "neutral" },
  };

  return map[status] || { label: status || (isEnglish ? "No status" : "Sin estado"), tone: "neutral" };
}

export function buildEmployeeTimeline(employee = {}) {
  const isEnglish = getCurrentLanguage() === "en";
  const items = [];

  if (employee.startDate) {
    items.push({
      id: `start-${employee.id}`,
      eyebrow: isEnglish ? "Start" : "Ingreso",
      title: isEnglish ? `${employee.name} joins ${employee.company}` : `${employee.name} se incorpora a ${employee.company}`,
      date: formatDate(employee.startDate),
      description: `${employee.position} | ${employee.department} | ${employee.location}`,
      trailing: employee.contractType || (isEnglish ? "Contract pending" : "Contrato pendiente"),
    });
  }

  if (employee.recruitmentSource?.origin === "Recruitment") {
    items.push({
      id: `source-${employee.id}`,
      eyebrow: "Recruitment",
      title: employee.recruitmentSource.candidateName || (isEnglish ? "Origin from pipeline" : "Origen desde pipeline"),
      date: "Pipeline",
      description: `${isEnglish ? "Source" : "Fuente"} ${employee.recruitmentSource.sourceChannel || "Recruitment"} | ${isEnglish ? "Stage" : "Etapa"} ${employee.recruitmentSource.pipelineStage || "N/A"}`,
      trailing: employee.recruitmentSource.fitScore ? `Fit ${employee.recruitmentSource.fitScore}` : "",
    });
  }

  (employee.salary?.salaryHistory || []).slice(0, 2).forEach((item, index) => {
    items.push({
      id: `salary-${employee.id}-${index}`,
      eyebrow: isEnglish ? "Compensation" : "Compensacion",
      title: item.change || (isEnglish ? "Salary movement" : "Movimiento salarial"),
      date: formatDate(item.effectiveDate),
      description: item.reason || (isEnglish ? "Salary update" : "Actualizacion salarial"),
      trailing: formatCurrency(item.baseSalary, employee.salary?.currency || "BOB"),
    });
  });

  (employee.documents || [])
    .filter((item) => item.status !== "approved")
    .slice(0, 2)
    .forEach((item) => {
      items.push({
        id: item.id,
        eyebrow: isEnglish ? "File" : "Expediente",
        title: item.name,
        date: item.expiresAt ? formatDate(item.expiresAt) : (isEnglish ? "No expiration" : "Sin vencimiento"),
        description: `${item.category} | ${item.owner || (isEnglish ? "No owner" : "Sin owner")}`,
        trailing: getStatusMeta(item.status).label,
      });
    });

  return items;
}
