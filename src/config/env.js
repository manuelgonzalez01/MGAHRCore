const FALLBACK_API_BASE_URL = "/api";

function parseBoolean(value, fallback = false) {
  if (value == null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

export const appEnv = {
  appName: import.meta.env.VITE_APP_NAME || "MGAHRCore",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL,
  useMocks: parseBoolean(import.meta.env.VITE_USE_MOCKS, false),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  environment: import.meta.env.MODE || "development",
};

export default appEnv;
