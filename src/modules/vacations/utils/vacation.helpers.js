function toDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatIsoDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function addDays(value, days) {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

export function getDaysBetween(startDate, endDate) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  if (!start || !end || end < start) {
    return [];
  }

  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatIsoDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function isWeekend(dateValue) {
  const date = toDate(dateValue);
  const day = date?.getDay();
  return day === 0 || day === 6;
}

export function monthsBetween(startDate, endDate = new Date().toISOString().slice(0, 10)) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  if (!start || !end) {
    return 0;
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

export function rangesOverlap(startA, endA, startB, endB) {
  const firstStart = toDate(startA);
  const firstEnd = toDate(endA);
  const secondStart = toDate(startB);
  const secondEnd = toDate(endB);

  if (!firstStart || !firstEnd || !secondStart || !secondEnd) {
    return false;
  }

  return firstStart <= secondEnd && secondStart <= firstEnd;
}

export function getStatusTone(status) {
  const tones = {
    draft: "neutral",
    submitted: "info",
    under_review: "info",
    pending_manager_approval: "warning",
    pending_hr_approval: "warning",
    approved: "success",
    rejected: "critical",
    cancelled: "neutral",
    returned_for_changes: "warning",
    scheduled: "info",
    consumed: "success",
    expired: "critical",
  };

  return tones[status] || "neutral";
}

export function getStatusLabel(status, isSpanish) {
  const labels = {
    draft: isSpanish ? "Borrador" : "Draft",
    submitted: isSpanish ? "Enviada" : "Submitted",
    under_review: isSpanish ? "En revision" : "Under review",
    pending_manager_approval: isSpanish ? "Pendiente jefe" : "Pending manager",
    pending_hr_approval: isSpanish ? "Pendiente RRHH" : "Pending HR",
    approved: isSpanish ? "Aprobada" : "Approved",
    rejected: isSpanish ? "Rechazada" : "Rejected",
    cancelled: isSpanish ? "Cancelada" : "Cancelled",
    returned_for_changes: isSpanish ? "Devuelta para cambios" : "Returned for changes",
    scheduled: isSpanish ? "Programada" : "Scheduled",
    consumed: isSpanish ? "Consumida" : "Consumed",
    expired: isSpanish ? "Vencida" : "Expired",
  };

  return labels[status] || status;
}

export function buildHolidayCatalog(organizations = { companies: [], locations: [] }) {
  const company = organizations.companies?.[0];
  const location = organizations.locations?.[0];
  return [
    {
      id: "HOL-001",
      date: "2026-01-01",
      label: "Ano Nuevo",
      companyId: company?.id || "",
      locationId: location?.id || "",
    },
    {
      id: "HOL-002",
      date: "2026-05-01",
      label: "Dia del Trabajo",
      companyId: company?.id || "",
      locationId: location?.id || "",
    },
    {
      id: "HOL-003",
      date: "2026-12-25",
      label: "Navidad",
      companyId: company?.id || "",
      locationId: location?.id || "",
    },
  ];
}
