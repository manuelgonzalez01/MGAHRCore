const ADMIN_SETTINGS_KEY = "mgahrcore.administration.settings";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSettings() {
  if (!canUseStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getSystemTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function getActiveTimezone() {
  return readSettings().timezone || getSystemTimezone();
}

export function getLocaleByLanguage(language = "es") {
  return language === "en" ? "en-US" : "es-BO";
}

function normalizeDateLike(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00Z`);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(" ", "T") + ":00Z");
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateBySettings(value, language = "es") {
  const date = normalizeDateLike(value);
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(getLocaleByLanguage(language), {
    dateStyle: "medium",
    timeZone: getActiveTimezone(),
  }).format(date);
}

export function formatDateTimeBySettings(value, language = "es") {
  const date = normalizeDateLike(value);
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(getLocaleByLanguage(language), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: getActiveTimezone(),
  }).format(date);
}
