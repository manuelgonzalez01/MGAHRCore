import supabase, { hasSupabaseConfig } from "./client";

let tenantContextPromise = null;

function ensureSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta disponible.");
  }
}

function normalizeContext(profile, user) {
  return {
    userId: user.id,
    email: user.email || "",
    companyId: profile?.company_id || "",
    employeeId: profile?.employee_id || "",
    canAccessAllCompanies: Boolean(profile?.can_access_all_companies),
    role: profile?.role_code || "user",
  };
}

export async function getTenantContext(forceRefresh = false) {
  ensureSupabase();

  if (!forceRefresh && tenantContextPromise) {
    return tenantContextPromise;
  }

  tenantContextPromise = (async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error(authError.message || "No se pudo leer el usuario autenticado.");
    }

    const user = authData?.user;
    if (!user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, company_id, employee_id, role_code, can_access_all_companies, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message || "No se pudo leer el contexto de compania.");
    }

    if (!profile) {
      return normalizeContext(null, user);
    }

    return normalizeContext(profile, user);
  })();

  return tenantContextPromise;
}

export function clearTenantContextCache() {
  tenantContextPromise = null;
}

export function filterByTenantCompany(items = [], tenantContext, key = "companyId") {
  if (!tenantContext || tenantContext.canAccessAllCompanies || !tenantContext.companyId) {
    return items;
  }

  return items.filter((item) => String(item?.[key] || "") === tenantContext.companyId);
}

export function ensureTenantCompany(companyId, tenantContext) {
  if (!tenantContext || tenantContext.canAccessAllCompanies || !tenantContext.companyId) {
    return companyId;
  }

  return companyId || tenantContext.companyId;
}

export function assertTenantAccess(companyId, tenantContext) {
  if (!tenantContext || tenantContext.canAccessAllCompanies || !tenantContext.companyId) {
    return;
  }

  if (companyId && companyId !== tenantContext.companyId) {
    throw new Error("No tienes permiso para operar datos de otra compania.");
  }
}
