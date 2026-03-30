import administrationService from "../../modules/administration/services/administration.service";
import supabase, { hasSupabaseConfig } from "../supabase/client";
import { clearTenantContextCache } from "../supabase/tenantContext.service";

const ACCESS_REQUESTS_KEY = "mgahrcore.auth.accessRequests";
const SUPER_ADMIN_EMAIL = "admin@mgahrcore.com";
const AUTH_TIMEOUT_MS = 8000;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key) {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeValue(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("El servicio de acceso no se encuentra disponible en este momento.");
  }
}

function withTimeout(promise, message, timeoutMs = AUTH_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

async function getProfile(userId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role_code, company_id, employee_id, language, status, can_access_all_companies")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("No se pudo leer el perfil asociado a la sesion.");
  }

  if (!data) {
    throw new Error("La cuenta autenticada no tiene perfil operativo en MGAHRCore.");
  }

  if (data.status !== "active") {
    throw new Error("La cuenta autenticada no esta activa dentro de MGAHRCore.");
  }

  return data;
}

async function querySupabaseCompanies() {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, legal_name, trade_name, status")
    .eq("status", "active")
    .order("trade_name", { ascending: true });

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map((company) => ({
    id: company.id,
    name: company.trade_name || company.legal_name,
    tradeName: company.trade_name || company.legal_name,
    legalName: company.legal_name || company.trade_name,
    status: company.status,
  }));
}

async function getCompanyLabel(companyId) {
  if (!companyId || !hasSupabaseConfig || !supabase) {
    return "";
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, legal_name, trade_name")
    .eq("id", companyId)
    .maybeSingle();

  if (error || !data) {
    return "";
  }

  return data.trade_name || data.legal_name || "";
}

async function getScopedCompanies(profile) {
  if (!profile?.company_id) {
    return profile?.can_access_all_companies ? await querySupabaseCompanies() : [];
  }

  const companyName = await getCompanyLabel(profile.company_id);
  return [{
    id: profile.company_id,
    name: companyName || "Workspace corporativo",
  }];
}

async function getCompanies(profile) {
  if (profile.can_access_all_companies) {
    const supabaseCompanies = await querySupabaseCompanies();
    if (supabaseCompanies.length) {
      return supabaseCompanies;
    }

    const organizations = await administrationService.getOrganizations();
    return organizations.companies || [];
  }

  return getScopedCompanies(profile);
}

function buildFallbackAppSession(authUser, accessToken = "") {
  const isSuperAdmin = String(authUser?.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
  const displayName =
    authUser?.user_metadata?.full_name
    || authUser?.user_metadata?.name
    || authUser?.email
    || "MGAHRCore User";

  return {
    user: {
      id: authUser.id,
      name: displayName,
      email: authUser.email || "",
      role: isSuperAdmin ? "super_admin" : "user",
      company: isSuperAdmin ? "Global Scope" : "",
      activeCompanyId: "",
      canAccessAllCompanies: isSuperAdmin,
      companies: [],
      employeeId: "",
      language: "es",
      lastAccess: new Date().toISOString(),
    },
    token: accessToken,
  };
}

async function buildAppSession(authUser, accessToken = "") {
  try {
    const profile = await getProfile(authUser.id);
    const companies = await getCompanies(profile);
    const activeCompany = companies.find((company) => company.id === profile.company_id) || companies[0] || null;

    return {
      user: {
        id: authUser.id,
        name: profile.full_name || authUser.email || "MGAHRCore User",
        email: profile.email || authUser.email || "",
        role: profile.role_code || "user",
        company: activeCompany?.name || activeCompany?.tradeName || (profile.can_access_all_companies ? "Global Scope" : ""),
        activeCompanyId: activeCompany?.id || profile.company_id || "",
        canAccessAllCompanies: Boolean(profile.can_access_all_companies),
        companies: companies.map((company) => ({
          id: company.id,
          name: company.name || company.tradeName || company.legalName,
        })),
        employeeId: profile.employee_id || "",
        language: profile.language || "es",
        lastAccess: new Date().toISOString(),
      },
      token: accessToken,
    };
  } catch (error) {
    const isSuperAdmin = String(authUser?.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
    const isInactiveProfile = String(error?.message || "").toLowerCase().includes("no esta activa");

    if (!isSuperAdmin || isInactiveProfile) {
      throw error;
    }

    return buildFallbackAppSession(authUser, accessToken);
  }
}

export async function getSuperAdminCredentials() {
  return {
    email: SUPER_ADMIN_EMAIL,
  };
}

export async function getCurrentSession() {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  clearTenantContextCache();

  const { data, error } = await withTimeout(
    supabase.auth.getSession(),
    "La sesion esta tardando demasiado en responder.",
  );

  if (error) {
    throw new Error("No se pudo recuperar la sesion activa desde Supabase.");
  }

  if (!data.session?.user) {
    return null;
  }

  return withTimeout(
    buildAppSession(data.session.user, data.session.access_token || ""),
    "La sesion se autentico, pero el workspace no termino de preparar el contexto.",
  );
}

export function subscribeToAuthChanges(callback) {
  if (!hasSupabaseConfig || !supabase) {
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    clearTenantContextCache();

    if (!session?.user) {
      callback(null);
      return;
    }

    window.setTimeout(async () => {
      try {
        const nextSession = await buildAppSession(session.user, session.access_token || "");
        callback(nextSession);
      } catch (error) {
        callback({ error });
      }
    }, 0);
  });

  return () => data.subscription.unsubscribe();
}

export async function loginUser({ email, password }) {
  ensureSupabase();
  clearTenantContextCache();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message || "No fue posible iniciar sesion.");
  }

  if (!data.session?.user) {
    throw new Error("Supabase no devolvio una sesion valida.");
  }

  return withTimeout(
    buildAppSession(data.session.user, data.session.access_token || ""),
    "La autenticacion fue valida, pero el acceso no termino de preparar el contexto de trabajo.",
  );
}

export async function logoutUser() {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  clearTenantContextCache();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email) {
  ensureSupabase();

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), {
    redirectTo,
  });

  if (error) {
    throw new Error(error.message || "No fue posible enviar el correo de recuperacion.");
  }

  return {
    ok: true,
    message: "Si la cuenta existe, enviaremos instrucciones al correo corporativo.",
  };
}

export async function createAccessRequest(payload) {
  const requests = readCollection(ACCESS_REQUESTS_KEY);
  const nextRequest = {
    id: `ACC-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending_review",
    ...payload,
  };

  requests.unshift(nextRequest);
  writeValue(ACCESS_REQUESTS_KEY, requests);
  return nextRequest;
}

export default {
  getSuperAdminCredentials,
  getCurrentSession,
  subscribeToAuthChanges,
  loginUser,
  logoutUser,
  requestPasswordReset,
  createAccessRequest,
};
