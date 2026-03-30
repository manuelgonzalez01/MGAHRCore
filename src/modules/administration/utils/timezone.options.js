const fallbackTimezones = [
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Havana",
  "America/Indiana/Indianapolis",
  "America/Grand_Turk",
  "America/Halifax",
  "America/Caracas",
  "America/Cuiaba",
  "America/La_Paz",
  "America/Santiago",
  "America/St_Johns",
  "America/Araguaina",
  "America/Asuncion",
  "America/Sao_Paulo",
  "America/Cayenne",
  "America/Bogota",
  "America/Lima",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Athens",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getAvailableTimezones() {
  if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return fallbackTimezones;
    }
  }

  return fallbackTimezones;
}

function getTimezoneOffsetLabel(timezone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit",
    });

    const zonePart = formatter.formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;
    const normalized = zonePart?.replace("GMT", "UTC") || "UTC+00:00";

    if (/^UTC[+-]\d{1,2}$/.test(normalized)) {
      const sign = normalized.includes("-") ? "-" : "+";
      const raw = normalized.replace("UTC", "").replace("+", "").replace("-", "");
      const hour = raw.padStart(2, "0");
      return `UTC${sign}${hour}:00`;
    }

    if (/^UTC[+-]\d{1,2}:\d{2}$/.test(normalized)) {
      const [prefix, minutes] = normalized.split(":");
      const sign = prefix.includes("-") ? "-" : "+";
      const rawHour = prefix.replace("UTC", "").replace("+", "").replace("-", "");
      return `UTC${sign}${rawHour.padStart(2, "0")}:${minutes}`;
    }

    return normalized;
  } catch {
    return "UTC+00:00";
  }
}

function humanizeTimezoneName(timezone) {
  return timezone
    .split("/")
    .map((part) => part.replaceAll("_", " "))
    .join(" / ");
}

function getOffsetMinutes(label) {
  const match = label.match(/^UTC([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    return 0;
  }

  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
}

export function getTimezoneOptions(preferred = []) {
  const available = new Set(getAvailableTimezones());
  const merged = [...new Set([...preferred.filter(Boolean), ...getAvailableTimezones()])].filter((timezone) =>
    available.has(timezone),
  );

  return merged
    .map((timezone) => {
      const offsetLabel = getTimezoneOffsetLabel(timezone);
      return {
        value: timezone,
        label: `(${offsetLabel}) ${humanizeTimezoneName(timezone)}`,
        offsetMinutes: getOffsetMinutes(offsetLabel),
      };
    })
    .sort((left, right) => {
      if (left.offsetMinutes !== right.offsetMinutes) {
        return left.offsetMinutes - right.offsetMinutes;
      }

      return left.label.localeCompare(right.label);
    });
}
