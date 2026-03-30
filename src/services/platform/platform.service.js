import administrationService from "../../modules/administration/services/administration.service";
import { hasSupabaseConfig } from "../supabase/client";

const PLATFORM_READY_KEY = "mgahrcore.platform.ready";
const PLATFORM_VERSION_KEY = "mgahrcore.platform.version";
const PLATFORM_VERSION = "2026.03.enterprise";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hasStoredRecords(key) {
  if (!canUseStorage()) {
    return false;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed);
  } catch {
    return false;
  }
}

export async function initializePlatform() {
  if (!canUseStorage()) {
    return { seededAdministration: false, seededEmployees: false };
  }

  if (hasSupabaseConfig) {
    window.localStorage.setItem(PLATFORM_READY_KEY, "true");
    window.localStorage.setItem(PLATFORM_VERSION_KEY, PLATFORM_VERSION);
    return { seededAdministration: false, seededEmployees: false };
  }

  const hasAdminData =
    hasStoredRecords("mgahrcore.administration.users")
    || hasStoredRecords("mgahrcore.administration.companies")
    || hasStoredRecords("mgahrcore.administration.roles");
  const hasCurrentVersion = window.localStorage.getItem(PLATFORM_VERSION_KEY) === PLATFORM_VERSION;

  let seededAdministration = false;

  if (!hasAdminData || !hasCurrentVersion) {
    await administrationService.loadAdministrationDevelopmentSeed();
    seededAdministration = true;
  }

  window.localStorage.setItem(PLATFORM_READY_KEY, "true");
  window.localStorage.setItem(PLATFORM_VERSION_KEY, PLATFORM_VERSION);

  return { seededAdministration, seededEmployees: false };
}

export function isPlatformReady() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(PLATFORM_READY_KEY) === "true";
}

export default {
  initializePlatform,
  isPlatformReady,
};
