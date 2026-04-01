import supabase, { hasSupabaseConfig } from "./client";
import {
  assertTenantAccess,
  ensureTenantCompany,
  filterByTenantCompany,
  getTenantContext,
} from "./tenantContext.service";

const ORGANIZATIONS_CACHE_TTL_MS = 30_000;
const organizationsCache = new Map();

function ensureSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase no esta disponible.");
  }
}

function getOrganizationsCacheKey(tenantContext) {
  if (!tenantContext) {
    return "anonymous";
  }

  return tenantContext.canAccessAllCompanies
    ? `global:${tenantContext.userId || "unknown"}`
    : `company:${tenantContext.companyId || "none"}:${tenantContext.userId || "unknown"}`;
}

function readOrganizationsCache(cacheKey) {
  const cached = organizationsCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    organizationsCache.delete(cacheKey);
    return null;
  }

  return cached.promise;
}

function writeOrganizationsCache(cacheKey, promise) {
  organizationsCache.set(cacheKey, {
    expiresAt: Date.now() + ORGANIZATIONS_CACHE_TTL_MS,
    promise,
  });
}

function clearOrganizationsCache() {
  organizationsCache.clear();
}

function byId(items = []) {
  return new Map(items.map((item) => [item.id, item]));
}

function findByName(items = [], value = "", key = "name") {
  const normalized = String(value || "").trim().toLowerCase();
  return items.find((item) => String(item?.[key] || "").trim().toLowerCase() === normalized) || null;
}

function normalizeKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmployeeStatus(statusLabel = "", fallback = "active") {
  const value = String(statusLabel || "").trim().toLowerCase();
  if (value === "activo" || value === "active") {
    return "active";
  }
  if (value === "inactivo" || value === "inactive" || value === "suspendido" || value === "suspended") {
    return "inactive";
  }
  return fallback;
}

function toInternalCode(value = "") {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normalizeCatalogValue(value = {}, index = 0) {
  const label = value.label || value.name || "";
  return {
    id: value.id || null,
    label,
    value: value.value || toInternalCode(label),
    description: value.description || "",
    status: value.status || "active",
    sortOrder: Number(value.sortOrder) || index + 1,
    isDefault: Boolean(value.isDefault),
  };
}

function sanitizeCatalogValues(values = []) {
  const normalized = values
    .map((value, index) => normalizeCatalogValue(value, index))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((value, index) => ({ ...value, sortOrder: index + 1 }));

  if (normalized.length && !normalized.some((value) => value.isDefault)) {
    normalized[0] = {
      ...normalized[0],
      isDefault: true,
    };
  }

  return normalized.map((value) => ({
    ...value,
    isDefault: value.status === "active" && Boolean(value.isDefault),
  }));
}

function companyView(item = {}) {
  return {
    id: item.id,
    name: item.trade_name || item.legal_name || "",
    legalName: item.legal_name || item.trade_name || "",
    tradeName: item.trade_name || item.legal_name || "",
    taxId: item.tax_id || "",
    country: item.country || "",
    countryCode: item.country_code || "",
    industry: item.industry || "",
    baseCurrency: item.base_currency || "BOB",
    defaultLanguage: item.default_language || "es",
    status: item.status || "active",
  };
}

function locationView(item = {}, companies = new Map()) {
  return {
    id: item.id,
    name: item.name || "",
    companyId: item.company_id || "",
    companyName: companies.get(item.company_id)?.name || "",
    locationType: item.location_type || "office",
    city: item.city || "",
    country: item.country || "",
    countryCode: item.country_code || "",
    timezone: item.timezone || "",
    currency: item.currency || "BOB",
    status: item.status || "active",
  };
}

function levelView(item = {}, levels = new Map()) {
  return {
    id: item.id,
    name: item.name || "",
    internalCode: item.internal_code || "",
    code: item.internal_code || "",
    hierarchyOrder: Number(item.hierarchy_order) || 0,
    parentLevelId: item.parent_level_id || "",
    parentLevelName: levels.get(item.parent_level_id)?.name || "",
    levelType: item.level_type || "",
    seniority: item.seniority || "",
    salaryMin: Number(item.salary_min) || 0,
    salaryMax: Number(item.salary_max) || 0,
    currency: item.currency || "BOB",
    status: item.status || "active",
    criticalLevel: Boolean(item.critical_level),
  };
}

function departmentView(item = {}, companies = new Map(), levels = new Map(), locations = new Map(), departments = new Map()) {
  return {
    id: item.id,
    name: item.name || "",
    internalCode: item.internal_code || "",
    code: item.internal_code || "",
    companyId: item.company_id || "",
    companyName: companies.get(item.company_id)?.name || "",
    parentDepartmentId: item.parent_department_id || "",
    parentDepartmentName: departments.get(item.parent_department_id)?.name || "",
    departmentHead: item.department_head || "",
    departmentType: item.department_type || "",
    levelId: item.level_id || "",
    levelName: levels.get(item.level_id)?.name || "",
    locationId: item.location_id || "",
    locationName: locations.get(item.location_id)?.name || "",
    costCenter: item.cost_center || "",
    budget: Number(item.budget) || 0,
    estimatedTeamSize: Number(item.estimated_team_size) || 0,
    description: item.description || "",
    status: item.status || "active",
    criticalDepartment: Boolean(item.critical_department),
  };
}

function positionView(item = {}, departments = new Map(), levels = new Map(), locations = new Map(), positions = new Map(), companies = new Map()) {
  const department = departments.get(item.department_id);
  const companyId = department?.companyId || "";
  return {
    id: item.id,
    name: item.name || "",
    internalCode: item.internal_code || "",
    code: item.internal_code || "",
    departmentId: item.department_id || "",
    departmentName: department?.name || "",
    companyId,
    companyName: companies.get(companyId)?.name || "",
    levelId: item.level_id || "",
    levelName: levels.get(item.level_id)?.name || "",
    reportsToPositionId: item.reports_to_position_id || "",
    reportsToName: positions.get(item.reports_to_position_id)?.name || "",
    locationId: item.location_id || "",
    locationName: locations.get(item.location_id)?.name || "",
    positionType: item.position_type || "",
    jobFamily: item.job_family || "",
    businessRole: item.business_role || item.name || "",
    description: item.description || "",
    hiringType: item.hiring_type || "",
    impact: item.impact || "",
    status: item.status || "active",
    criticalPosition: Boolean(item.critical_position),
  };
}

function catalogView(item = {}, values = []) {
  const normalizedValues = values
    .map((value) => ({
      id: value.id,
      label: value.label || "",
      value: value.value_code || "",
      description: value.description || "",
      status: value.status || "active",
      sortOrder: Number(value.sort_order) || 0,
      isDefault: Boolean(value.is_default),
      usageCount: 0,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    id: item.id,
    name: item.name || "",
    internalCode: item.internal_code || "",
    code: item.internal_code || "",
    description: item.description || "",
    relatedModule: item.related_module || "",
    catalogType: item.catalog_type || "simple",
    userEditable: Boolean(item.user_editable),
    requiresApproval: Boolean(item.requires_approval),
    criticalCatalog: Boolean(item.critical_catalog),
    status: item.status || "active",
    values: normalizedValues,
    valuesCount: normalizedValues.length,
    activeValuesCount: normalizedValues.filter((value) => value.status === "active").length,
    defaultValueName: normalizedValues.find((value) => value.isDefault)?.label || "Sin valor por defecto",
    usageCount: 0,
  };
}

export async function fetchOrganizationsFromSupabase() {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const cacheKey = getOrganizationsCacheKey(tenantContext);
  const cached = readOrganizationsCache(cacheKey);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const [companiesResult, locationsResult, levelsResult, departmentsResult, positionsResult, catalogsResult, valuesResult] = await Promise.all([
      supabase.from("companies").select("*").order("trade_name", { ascending: true }),
      supabase.from("locations").select("*").order("name", { ascending: true }),
      supabase.from("levels").select("*").order("hierarchy_order", { ascending: true }),
      supabase.from("departments").select("*").order("name", { ascending: true }),
      supabase.from("positions").select("*").order("name", { ascending: true }),
      supabase.from("catalogs").select("*").is("archived_at", null).order("name", { ascending: true }),
      supabase.from("catalog_values").select("*").is("archived_at", null).order("sort_order", { ascending: true }),
    ]);

    const failure = [companiesResult, locationsResult, levelsResult, departmentsResult, positionsResult, catalogsResult, valuesResult]
      .find((result) => result.error);
    if (failure?.error) {
      throw new Error(failure.error.message || "No se pudo cargar la estructura organizacional.");
    }

    const scopedCompaniesRaw = filterByTenantCompany(companiesResult.data || [], tenantContext, "id");
    const allowedCompanyIds = new Set(scopedCompaniesRaw.map((item) => item.id));
    const companies = scopedCompaniesRaw.map(companyView);
    const companiesMap = byId(companies);
    const scopedLocationsRaw = (locationsResult.data || []).filter((item) => allowedCompanyIds.has(item.company_id));
    const locations = scopedLocationsRaw.map((item) => locationView(item, companiesMap));
    const locationsMap = byId(locations);
    const scopedDepartmentsRaw = (departmentsResult.data || []).filter((item) => allowedCompanyIds.has(item.company_id));
    const scopedPositionsRaw = (positionsResult.data || []).filter((item) => scopedDepartmentsRaw.some((department) => department.id === item.department_id));
    const scopedLevelIds = new Set([
      ...scopedDepartmentsRaw.map((item) => item.level_id).filter(Boolean),
      ...scopedPositionsRaw.map((item) => item.level_id).filter(Boolean),
    ]);
    const scopedLevelsRaw = (levelsResult.data || []).filter((item) => scopedLevelIds.size === 0 || scopedLevelIds.has(item.id));
    const levelsSeed = byId(scopedLevelsRaw.map((item) => ({ id: item.id, name: item.name || "" })));
    const levels = scopedLevelsRaw.map((item) => levelView(item, levelsSeed));
    const levelsMap = byId(levels);
    const departmentsSeed = byId(scopedDepartmentsRaw.map((item) => ({ id: item.id, name: item.name || "" })));
    const departments = scopedDepartmentsRaw.map((item) => departmentView(item, companiesMap, levelsMap, locationsMap, departmentsSeed));
    const departmentsMap = byId(departments);
    const positionsSeed = byId(scopedPositionsRaw.map((item) => ({ id: item.id, name: item.name || "" })));
    const positions = scopedPositionsRaw.map((item) => positionView(item, departmentsMap, levelsMap, locationsMap, positionsSeed, companiesMap));

    const valuesByCatalog = (valuesResult.data || []).reduce((acc, value) => {
      const next = acc.get(value.catalog_id) || [];
      next.push(value);
      acc.set(value.catalog_id, next);
      return acc;
    }, new Map());

    const entities = (catalogsResult.data || []).map((item) => catalogView(item, valuesByCatalog.get(item.id) || []));

    return { companies, locations, levels, departments, positions, entities };
  })();

  writeOrganizationsCache(cacheKey, request);

  try {
    return await request;
  } catch (error) {
    organizationsCache.delete(cacheKey);
    throw error;
  }
}

function employeeView(employee = {}, maps) {
  const statusValue = maps.catalogValues.get(employee.employee_status_value_id);
  const contractValue = maps.catalogValues.get(employee.contract_type_value_id);
  const company = maps.companies.get(employee.company_id);
  const department = maps.departments.get(employee.department_id);
  const position = maps.positions.get(employee.position_id);
  const level = maps.levels.get(employee.level_id);
  const location = maps.locations.get(employee.location_id);
  const manager = maps.employees.get(employee.manager_employee_id);
  const name = employee.full_name || [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();

  return {
    id: employee.id,
    name,
    initials: name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    employeeNumber: employee.employee_number || "",
    positionId: position?.id || employee.position_id || "",
    position: position?.name || "",
    departmentId: department?.id || employee.department_id || "",
    department: department?.name || "",
    levelId: level?.id || employee.level_id || "",
    levelName: level?.name || "",
    manager: manager?.name || "",
    locationId: location?.id || employee.location_id || "",
    location: location?.name || "",
    contractType: contractValue?.label || "",
    employeeType: employee.employee_type || "employee",
    status: normalizeEmployeeStatus(statusValue?.label, employee.status || "active"),
    email: employee.work_email || employee.personal_email || "",
    phone: employee.phone || "",
    companyId: company?.id || employee.company_id || "",
    company: company?.name || "",
    workMode: employee.employee_type === "remote" ? "Remoto" : employee.employee_type === "onsite" ? "Presencial" : "Hibrido",
    startDate: employee.hire_date || "",
    profileCompletion: Number(employee.onboarding_completion) || 0,
    dossierReadiness: Number(employee.dossier_readiness) || 0,
    engagementScore: 0,
    performanceLabel: "Revision pendiente",
    salaryBand: level?.name || "Banda pendiente",
    costCenter: department?.costCenter || "Centro de costo pendiente",
    businessUnit: company?.name || "Unidad pendiente",
    shift: "Turno pendiente",
    schedule: "Horario pendiente",
    legalEntity: company?.legalName || company?.name || "",
    payrollGroup: company?.baseCurrency || "BOB",
    reportsToPositionName: "",
    summary: "Perfil del colaborador conectado a la base de datos operativa.",
    executiveInsight: "La lectura del colaborador se alimenta desde la estructura real de la organizacion.",
    nextMilestone: "Completar informacion complementaria del expediente.",
    recruitmentSource: { origin: "Supabase" },
    documents: [],
    dependents: [],
    assignments: [],
    studies: [],
    experience: [],
    permissions: [],
    leaves: [],
    salary: {
      baseSalary: Number(employee.base_salary) || 0,
      currency: employee.currency || "BOB",
      salaryHistory: [],
      benefits: [],
    },
    contract: {
      contractType: contractValue?.label || "",
      employeeType: employee.employee_type || "employee",
      workMode: employee.employee_type === "remote" ? "Remoto" : employee.employee_type === "onsite" ? "Presencial" : "Hibrido",
      startDate: employee.hire_date || "",
      seniorityDate: employee.hire_date || "",
      legalEntity: company?.legalName || company?.name || "",
      payrollGroup: company?.baseCurrency || "BOB",
      laborRegime: "",
    },
    history: [],
    actions: [],
    onboarding: {},
  };
}

async function employeeMaps() {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const [organizations, valuesResult, employeesResult] = await Promise.all([
    fetchOrganizationsFromSupabase(),
    supabase.from("catalog_values").select("id, label"),
    supabase.from("employees").select("id, first_name, last_name, full_name"),
  ]);
  if (valuesResult.error || employeesResult.error) {
    throw new Error(valuesResult.error?.message || employeesResult.error?.message || "No se pudieron construir referencias de empleados.");
  }
  return {
    companies: byId(organizations.companies),
    departments: byId(organizations.departments),
    positions: byId(organizations.positions),
    levels: byId(organizations.levels),
    locations: byId(organizations.locations),
    catalogValues: byId((valuesResult.data || []).map((item) => ({ id: item.id, label: item.label }))),
    employees: byId(
      filterByTenantCompany(employeesResult.data || [], tenantContext, "company_id")
        .map((item) => ({ id: item.id, name: item.full_name || [item.first_name, item.last_name].filter(Boolean).join(" ").trim() })),
    ),
  };
}

export async function fetchEmployeesFromSupabase() {
  ensureSupabase();
  const maps = await employeeMaps();
  const tenantContext = await getTenantContext();
  const { data, error } = await supabase.from("employees").select("*").is("archived_at", null).order("first_name", { ascending: true });
  if (error) {
    throw new Error(error.message || "No se pudo cargar el padron de empleados.");
  }
  return filterByTenantCompany(data || [], tenantContext, "company_id").map((item) => employeeView(item, maps));
}

export async function fetchEmployeeByIdFromSupabase(id) {
  ensureSupabase();
  const maps = await employeeMaps();
  const tenantContext = await getTenantContext();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(error.message || "No se pudo cargar el colaborador.");
  }
  assertTenantAccess(data?.company_id, tenantContext);
  return data ? employeeView(data, maps) : null;
}

function catalogValueId(entities = [], internalCode, candidate) {
  const entity = entities.find((item) => item.internalCode === internalCode);
  const normalized = String(candidate || "").trim().toLowerCase();
  return entity?.values.find((item) => item.id === candidate || item.label.toLowerCase() === normalized || item.value.toLowerCase() === normalized)?.id || null;
}

export async function saveEmployeeInSupabase(employee = {}) {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const organizations = await fetchOrganizationsFromSupabase();
  const company = organizations.companies.find((item) => item.id === employee.companyId) || findByName(organizations.companies, employee.company);
  const department = organizations.departments.find((item) => item.id === employee.departmentId) || findByName(organizations.departments, employee.department);
  const position = organizations.positions.find((item) => item.id === employee.positionId) || findByName(organizations.positions, employee.position);
  const level = organizations.levels.find((item) => item.id === employee.levelId) || findByName(organizations.levels, employee.levelName);
  const location = organizations.locations.find((item) => item.id === employee.locationId) || findByName(organizations.locations, employee.location);
  const parts = String(employee.name || "").trim().split(" ").filter(Boolean);
  const firstName = parts.shift() || employee.firstName || "Sin";
  const lastName = parts.join(" ") || employee.lastName || "Nombre";

  const payload = {
    employee_number: employee.employeeNumber || `EMP-${Date.now()}`,
    first_name: firstName,
    last_name: lastName,
    work_email: employee.email || null,
    phone: employee.phone || null,
    hire_date: employee.startDate || new Date().toISOString().slice(0, 10),
    company_id: ensureTenantCompany(company?.id || null, tenantContext),
    department_id: department?.id || null,
    position_id: position?.id || null,
    level_id: level?.id || null,
    location_id: location?.id || null,
    employee_status_value_id: catalogValueId(organizations.entities, "CAT_EMPLOYEE_STATUS", employee.status || "Activo"),
    contract_type_value_id: catalogValueId(organizations.entities, "CAT_CONTRACT_TYPES", employee.contractType),
    base_salary: Number(employee.salary?.baseSalary || employee.baseSalary) || 0,
    currency: employee.salary?.currency || employee.currency || "BOB",
    employee_type: employee.employeeType || "employee",
    dossier_readiness: Number(employee.dossierReadiness) || 0,
    onboarding_completion: Number(employee.profileCompletion) || 0,
    status: "active",
  };

  const query = employee.id
    ? supabase.from("employees").update(payload).eq("id", employee.id).select().single()
    : supabase.from("employees").insert(payload).select().single();

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || "No se pudo guardar el colaborador.");
  }

  return fetchEmployeeByIdFromSupabase(data.id);
}

export async function fetchEmployeeRequestsFromSupabase() {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const organizations = await fetchOrganizationsFromSupabase();
  const { data, error } = await supabase.from("employee_requests").select("*").order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message || "No se pudieron cargar las solicitudes.");
  }

  return filterByTenantCompany(data || [], tenantContext, "company_id").map((item) => ({
    id: item.id,
    requestNumber: item.request_number || "",
    name: item.requested_name || "",
    email: item.requested_email || "",
    phone: item.requested_phone || "",
    companyId: item.company_id || "",
    companyName: organizations.companies.find((entry) => entry.id === item.company_id)?.name || "",
    positionId: item.position_id || "",
    position: organizations.positions.find((entry) => entry.id === item.position_id)?.name || "",
    departmentId: item.department_id || "",
    department: organizations.departments.find((entry) => entry.id === item.department_id)?.name || "",
    levelId: item.level_id || "",
    levelName: organizations.levels.find((entry) => entry.id === item.level_id)?.name || "",
    locationId: item.location_id || "",
    location: organizations.locations.find((entry) => entry.id === item.location_id)?.name || "",
    contractType: organizations.entities.find((entry) => entry.internalCode === "CAT_CONTRACT_TYPES")?.values.find((value) => value.id === item.contract_type_value_id)?.label || "",
    requestedBy: item.requested_by || "HR Operations",
    submittedAt: item.created_at?.slice(0, 10) || "",
    approvalStatus: item.workflow_status || "draft",
    approvalFlowId: "",
    approvalFlowName: "",
  }));
}

export async function createEmployeeRequestInSupabase(request = {}) {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const organizations = await fetchOrganizationsFromSupabase();
  const company = organizations.companies.find((item) => item.id === request.companyId) || findByName(organizations.companies, request.companyName || request.company);
  const department = organizations.departments.find((item) => item.id === request.departmentId) || findByName(organizations.departments, request.department);
  const position = organizations.positions.find((item) => item.id === request.positionId) || findByName(organizations.positions, request.position);
  const level = organizations.levels.find((item) => item.id === request.levelId) || findByName(organizations.levels, request.levelName);
  const location = organizations.locations.find((item) => item.id === request.locationId) || findByName(organizations.locations, request.location);

  const payload = {
    request_number: request.requestNumber || `REQ-${Date.now()}`,
    requested_name: request.name || "",
    requested_email: request.email || null,
    requested_phone: request.phone || null,
    company_id: ensureTenantCompany(company?.id || null, tenantContext),
    department_id: department?.id || null,
    position_id: position?.id || null,
    level_id: level?.id || null,
    location_id: location?.id || null,
    contract_type_value_id: catalogValueId(organizations.entities, "CAT_CONTRACT_TYPES", request.contractType),
    proposed_salary: Number(request.proposedSalary) || null,
    currency: request.currency || "BOB",
    source_type: request.sourceType || "manual",
    justification: request.justification || null,
    workflow_status: request.approvalStatus || "pending_review",
    requested_by: request.requestedBy || null,
  };

  const { data, error } = await supabase.from("employee_requests").insert(payload).select().single();
  if (error) {
    throw new Error(error.message || "No se pudo registrar la solicitud.");
  }

  return {
    id: data.id,
    requestNumber: data.request_number,
    name: data.requested_name,
    approvalStatus: data.workflow_status,
  };
}

export async function approveEmployeeRequestInSupabase(requestId) {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const { data, error } = await supabase.from("employee_requests").select("*").eq("id", requestId).single();
  if (error || !data) {
    throw new Error(error?.message || "No se encontro la solicitud.");
  }
  assertTenantAccess(data.company_id, tenantContext);

  const employee = await saveEmployeeInSupabase({
    name: data.requested_name,
    email: data.requested_email,
    phone: data.requested_phone,
    companyId: data.company_id,
    departmentId: data.department_id,
    positionId: data.position_id,
    levelId: data.level_id,
    locationId: data.location_id,
    contractType: data.contract_type_value_id,
    startDate: new Date().toISOString().slice(0, 10),
  });

  const update = await supabase
    .from("employee_requests")
    .update({ workflow_status: "approved", resolved_at: new Date().toISOString() })
    .eq("id", requestId);

  if (update.error) {
    throw new Error(update.error.message || "No se pudo aprobar la solicitud.");
  }

  return employee;
}

function normalizeRecruitmentRequestStatusFromDb(status = "") {
  const value = String(status || "").trim().toLowerCase();
  if (value === "draft") {
    return "draft";
  }
  if (value === "submitted" || value === "open") {
    return "submitted";
  }
  if (value === "pending_review" || value === "in_progress") {
    return "pending_review";
  }
  if (value === "on_hold" || value === "paused") {
    return "on_hold";
  }
  if (value === "approved" || value === "approved_ready") {
    return "approved";
  }
  if (value === "rejected") {
    return "rejected";
  }
  if (value === "closed" || value === "cancelled") {
    return "closed";
  }
  return "draft";
}

function normalizeRecruitmentRequestStatusToDb(status = "") {
  const value = String(status || "").trim().toLowerCase();
  if (value === "draft") {
    return "draft";
  }
  if (value === "submitted") {
    return "submitted";
  }
  if (value === "pending_review" || value === "in_progress") {
    return "pending_review";
  }
  if (value === "on_hold") {
    return "on_hold";
  }
  if (value === "closed") {
    return "closed";
  }
  if (value === "approved") {
    return "approved";
  }
  if (value === "rejected") {
    return "rejected";
  }
  return "submitted";
}

function normalizeRecruitmentStageFromDb(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("offer") || normalized.includes("oferta")) {
    return "offer";
  }
  if (normalized.includes("evaluation") || normalized.includes("evaluacion")) {
    return "evaluation";
  }
  if (normalized.includes("interview") || normalized.includes("entrevista")) {
    return "interview";
  }
  return "screening";
}

function getRecruitmentStageValueId(entities = [], stage = "screening") {
  const entity = entities.find((item) => item.internalCode === "CAT_RECRUITMENT_STAGES");
  if (!entity) {
    return null;
  }

  const matcher = {
    screening: ["screening", "screen", "sourcing"],
    interview: ["interview", "entrevista"],
    evaluation: ["evaluation", "evaluacion"],
    offer: ["offer", "oferta"],
  };

  const candidates = matcher[stage] || matcher.screening;
  return (
    entity.values.find((item) => {
      const label = String(item.label || "").trim().toLowerCase();
      const value = String(item.value || "").trim().toLowerCase();
      return candidates.some((candidate) => label.includes(candidate) || value.includes(candidate));
    })?.id || null
  );
}

function recruitmentCandidateStatus(item = {}, stage = "screening") {
  const rawStatus = String(item.status || "").trim().toLowerCase();
  if (rawStatus === "inactive" || rawStatus === "archived") {
    return "inactive";
  }
  if (stage === "offer") {
    return "finalist";
  }
  if (stage === "interview" || stage === "evaluation") {
    return "pipeline";
  }
  return "active";
}

function recruitmentRequestView(item = {}, organizations = {}) {
  const companies = organizations.companies || [];
  const departments = organizations.departments || [];
  const positions = organizations.positions || [];
  const levels = organizations.levels || [];
  const locations = organizations.locations || [];

  const company = companies.find((entry) => entry.id === item.company_id);
  const department = departments.find((entry) => entry.id === item.department_id);
  const position = positions.find((entry) => entry.id === item.position_id);
  const level = levels.find((entry) => entry.id === item.level_id);
  const location = locations.find((entry) => entry.id === item.location_id);

  return {
    id: item.id,
    title: item.title || position?.name || "",
    companyId: item.company_id || company?.id || "",
    companyName: company?.name || "",
    positionId: item.position_id || position?.id || "",
    position: position?.name || item.title || "",
    departmentId: item.department_id || department?.id || "",
    department: department?.name || "",
    levelId: item.level_id || level?.id || "",
    levelName: level?.name || "",
    hiringManager: department?.departmentHead || "",
    openings: Number(item.openings || item.headcount_requested) || 1,
    locationId: item.location_id || location?.id || "",
    location: location?.name || "",
    modality: position?.hiringType || "hybrid",
    priority: item.urgency === "high" ? "high" : item.urgency === "low" ? "low" : "medium",
    status: normalizeRecruitmentRequestStatusFromDb(item.workflow_status),
    createdAt: item.created_at || new Date().toISOString(),
    requestedBy: item.requested_by || "Recruitment",
  };
}

function recruitmentCandidateView(item = {}, jobRequests = new Map(), organizations = {}, entities = []) {
  const companies = organizations.companies || [];
  const departments = organizations.departments || [];
  const positions = organizations.positions || [];
  const levels = organizations.levels || [];
  const locations = organizations.locations || [];
  const linkedRequest = jobRequests.get(item.job_request_id);
  const position =
    positions.find((entry) => entry.id === linkedRequest?.positionId)
    || positions.find((entry) => normalizeKey(entry.name) === normalizeKey(item.current_position));
  const department = departments.find((entry) => entry.id === linkedRequest?.departmentId)
    || departments.find((entry) => entry.id === position?.departmentId);
  const location = locations.find((entry) => entry.id === linkedRequest?.locationId)
    || locations.find((entry) => entry.id === position?.locationId)
    || locations.find((entry) => entry.id === department?.locationId);
  const level = levels.find((entry) => entry.id === linkedRequest?.levelId)
    || levels.find((entry) => entry.id === position?.levelId);
  const company = companies.find((entry) => entry.id === linkedRequest?.companyId)
    || companies.find((entry) => entry.id === department?.companyId);
  const stageEntity = entities.find((entry) => entry.internalCode === "CAT_RECRUITMENT_STAGES");
  const stageValue = stageEntity?.values.find((entry) => entry.id === item.recruitment_stage_value_id);
  const stage = normalizeRecruitmentStageFromDb(stageValue?.label || stageValue?.value);
  const name = item.full_name || [item.first_name, item.last_name].filter(Boolean).join(" ").trim();

  return {
    id: item.id,
    name,
    companyId: company?.id || linkedRequest?.companyId || "",
    companyName: company?.name || linkedRequest?.companyName || "",
    positionId: position?.id || linkedRequest?.positionId || "",
    position: position?.name || linkedRequest?.position || item.current_position || "",
    departmentId: department?.id || linkedRequest?.departmentId || "",
    department: department?.name || linkedRequest?.department || "",
    levelId: level?.id || linkedRequest?.levelId || "",
    levelName: level?.name || linkedRequest?.levelName || "",
    locationId: location?.id || linkedRequest?.locationId || "",
    location: location?.name || linkedRequest?.location || "",
    stage,
    status: recruitmentCandidateStatus(item, stage),
    score: Number(item.score) || 0,
    availability: "Inmediata",
    experience: item.current_position || "Perfil pendiente",
    source: item.source_channel || "Direct sourcing",
    summary: item.notes || "",
    contact: item.email || item.phone || "",
    createdAt: item.created_at || new Date().toISOString(),
  };
}

export async function fetchRecruitmentJobRequestsFromSupabase() {
  ensureSupabase();
  const organizations = await fetchOrganizationsFromSupabase();
  const { data, error } = await supabase
    .from("job_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "No se pudieron cargar las requisiciones.");
  }

  return (data || []).map((item) => recruitmentRequestView(item, organizations));
}

export async function fetchRecruitmentCandidatesFromSupabase() {
  ensureSupabase();
  const organizations = await fetchOrganizationsFromSupabase();
  const [candidatesResult, requests] = await Promise.all([
    supabase.from("candidates").select("*").order("created_at", { ascending: false }),
    fetchRecruitmentJobRequestsFromSupabase(),
  ]);

  if (candidatesResult.error) {
    throw new Error(candidatesResult.error.message || "No se pudieron cargar los candidatos.");
  }

  const requestsMap = new Map(requests.map((item) => [item.id, item]));
  return (candidatesResult.data || []).map((item) =>
    recruitmentCandidateView(item, requestsMap, organizations, organizations.entities),
  );
}

export async function createRecruitmentJobRequestInSupabase(request = {}) {
  ensureSupabase();
  const tenantContext = await getTenantContext();
  const organizations = await fetchOrganizationsFromSupabase();
  const company =
    organizations.companies.find((item) => item.id === request.companyId)
    || findByName(organizations.companies, request.companyName || request.company);
  const department =
    organizations.departments.find((item) => item.id === request.departmentId)
    || findByName(organizations.departments, request.department);
  const position =
    organizations.positions.find((item) => item.id === request.positionId)
    || findByName(organizations.positions, request.position || request.title);
  const level =
    organizations.levels.find((item) => item.id === request.levelId)
    || findByName(organizations.levels, request.levelName);
  const location =
    organizations.locations.find((item) => item.id === request.locationId)
    || findByName(organizations.locations, request.location);

  const payload = {
    request_number: request.requestNumber || `REQ-${Date.now()}`,
    title: request.title || position?.name || request.position || "Nueva requisicion",
    company_id: ensureTenantCompany(company?.id || department?.companyId || null, tenantContext),
    department_id: department?.id || null,
    position_id: position?.id || null,
    level_id: level?.id || null,
    location_id: location?.id || null,
    contract_type_value_id: catalogValueId(organizations.entities, "CAT_CONTRACT_TYPES", request.contractType),
    headcount_requested: Number(request.openings) || 1,
    openings: Number(request.openings) || 1,
    urgency: request.priority || "medium",
    reason: request.summary || null,
    workflow_status: normalizeRecruitmentRequestStatusToDb(request.status),
    requested_by: request.requestedBy || null,
  };

  const { data, error } = await supabase.from("job_requests").insert(payload).select().single();
  if (error) {
    throw new Error(error.message || "No se pudo registrar la requisicion.");
  }

  return data?.id || null;
}

export async function createRecruitmentCandidateInSupabase(candidate = {}) {
  ensureSupabase();
  const organizations = await fetchOrganizationsFromSupabase();
  const requests = await fetchRecruitmentJobRequestsFromSupabase();
  const linkedRequest =
    requests.find((item) => item.id === candidate.jobRequestId)
    || requests.find((item) => item.positionId && item.positionId === candidate.positionId)
    || requests.find((item) => normalizeKey(item.position) === normalizeKey(candidate.position));
  const parts = String(candidate.name || "").trim().split(" ").filter(Boolean);
  const firstName = parts.shift() || "Sin";
  const lastName = parts.join(" ") || "Nombre";
  const payload = {
    candidate_number: candidate.candidateNumber || `CAN-${Date.now()}`,
    first_name: firstName,
    last_name: lastName,
    email: candidate.contact?.includes("@") ? candidate.contact : null,
    phone: candidate.contact?.includes("@") ? null : candidate.contact || null,
    job_request_id: linkedRequest?.id || null,
    current_company: candidate.companyName || null,
    current_position: candidate.experience || candidate.position || null,
    source_channel: candidate.source || null,
    recruitment_stage_value_id: getRecruitmentStageValueId(organizations.entities, candidate.stage),
    score: Number(candidate.score) || 0,
    fit_label: candidate.status || null,
    notes: candidate.summary || null,
    status: candidate.status === "inactive" ? "inactive" : "active",
  };

  const { data, error } = await supabase.from("candidates").insert(payload).select().single();
  if (error) {
    throw new Error(error.message || "No se pudo registrar el candidato.");
  }

  return data?.id || null;
}

function organizationPayload(type, item = {}, organizations = {}) {
  const companies = organizations.companies || [];
  const locations = organizations.locations || [];
  const levels = organizations.levels || [];
  const departments = organizations.departments || [];
  const positions = organizations.positions || [];
  const entities = organizations.entities || [];

  if (type === "companies") {
    return {
      legal_name: item.legalName || item.name || "",
      trade_name: item.tradeName || item.name || "",
      tax_id: item.taxId || item.id || `TAX-${Date.now()}`,
      country_code: item.countryCode || "BO",
      country: item.country || "Bolivia",
      industry: item.industry || null,
      status: item.status || "active",
      corporate_email: item.corporateEmail || null,
      main_phone: item.mainPhone || null,
      city_province: item.cityProvince || null,
      default_language: item.defaultLanguage || "es",
      base_currency: item.baseCurrency || "BOB",
    };
  }

  if (type === "locations") {
    const company = companies.find((entry) => entry.id === item.companyId) || findByName(companies, item.companyName || item.company);
    return {
      name: item.name || "",
      company_id: company?.id || null,
      location_type: item.locationType || "office",
      status: item.status || "active",
      country_code: item.countryCode || "BO",
      country: item.country || "Bolivia",
      city: item.city || "",
      timezone: item.timezone || "America/La_Paz",
      currency: item.currency || "BOB",
      primary_language: item.primaryLanguage || "es",
    };
  }

  if (type === "levels") {
    const parentLevel = levels.find((entry) => entry.id === item.parentLevelId) || findByName(levels, item.parentLevelName);
    return {
      name: item.name || "",
      internal_code: item.internalCode || item.code || `LVL_${Date.now()}`,
      hierarchy_order: Number(item.hierarchyOrder) || 1,
      parent_level_id: parentLevel?.id || null,
      level_type: item.levelType || "profesional",
      seniority: item.seniority || "Mid",
      salary_min: Number(item.salaryMin) || 0,
      salary_max: Number(item.salaryMax) || 0,
      currency: item.currency || "BOB",
      status: item.status || "active",
      critical_level: Boolean(item.criticalLevel),
    };
  }

  if (type === "departments") {
    const company = companies.find((entry) => entry.id === item.companyId) || findByName(companies, item.companyName || item.company);
    const parentDepartment = departments.find((entry) => entry.id === item.parentDepartmentId) || findByName(departments, item.parentDepartmentName);
    const level = levels.find((entry) => entry.id === item.levelId) || findByName(levels, item.levelName);
    const location = locations.find((entry) => entry.id === item.locationId) || findByName(locations, item.locationName || item.location);
    return {
      name: item.name || "",
      internal_code: item.internalCode || item.code || `DEP_${Date.now()}`,
      company_id: company?.id || null,
      parent_department_id: parentDepartment?.id || null,
      department_head: item.departmentHead || item.head || null,
      department_type: item.departmentType || "soporte",
      level_id: level?.id || null,
      location_id: location?.id || null,
      cost_center: item.costCenter || null,
      budget: Number(item.budget) || 0,
      estimated_team_size: Number(item.estimatedTeamSize) || 0,
      description: item.description || null,
      status: item.status || "active",
      critical_department: Boolean(item.criticalDepartment),
      visible_in_recruitment: item.visibleInRecruitment ?? true,
      visible_in_employees: item.visibleInEmployees ?? true,
    };
  }

  if (type === "positions") {
    const department = departments.find((entry) => entry.id === item.departmentId) || findByName(departments, item.departmentName || item.department);
    const level = levels.find((entry) => entry.id === item.levelId) || findByName(levels, item.levelName);
    const reportsTo = positions.find((entry) => entry.id === item.reportsToPositionId) || findByName(positions, item.reportsToName);
    const location = locations.find((entry) => entry.id === item.locationId) || findByName(locations, item.locationName || item.location);
    return {
      name: item.name || "",
      internal_code: item.internalCode || item.code || `POS_${Date.now()}`,
      department_id: department?.id || null,
      level_id: level?.id || null,
      reports_to_position_id: reportsTo?.id || null,
      position_type: item.positionType || "operativa",
      job_family: item.jobFamily || item.departmentName || "General",
      location_id: location?.id || null,
      business_role: item.businessRole || item.name || "",
      description: item.description || null,
      impact: item.impact || "medio",
      hiring_type: item.hiringType || null,
      status: item.status || "active",
      critical_position: Boolean(item.criticalPosition),
      use_in_recruitment: item.useInRecruitment ?? true,
      use_in_employees: item.useInEmployees ?? true,
    };
  }

  if (type === "entities") {
    const relatedModule = item.relatedModule || "Administration";
    const normalizedModule = String(relatedModule).replace(/\s+/g, "");
    const moduleCode = normalizedModule === "PersonnelActions" ? normalizedModule : normalizedModule;
    const current = entities.find((entry) => entry.id === item.id);
    return {
      name: item.name || "",
      internal_code: item.internalCode || item.code || `CAT_${Date.now()}`,
      description: item.description || null,
      related_module: moduleCode,
      catalog_type: item.catalogType || "simple",
      user_editable: item.userEditable ?? true,
      requires_approval: Boolean(item.requiresApproval),
      critical_catalog: Boolean(item.criticalCatalog),
      status: item.status || current?.status || "active",
    };
  }

  throw new Error("Tipo de organizacion no soportado.");
}

async function upsertOrganizationRow(table, itemId, payload) {
  const query = itemId
    ? supabase.from(table).update(payload).eq("id", itemId).select().single()
    : supabase.from(table).insert(payload).select().single();
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || "No se pudo guardar el registro administrativo.");
  }
  return data;
}

async function syncCatalogValues(catalogId, values = []) {
  const normalizedValues = sanitizeCatalogValues(values);
  const { data: existingValues, error: existingError } = await supabase
    .from("catalog_values")
    .select("id")
    .eq("catalog_id", catalogId)
    .is("archived_at", null);

  if (existingError) {
    throw new Error(existingError.message || "No se pudieron leer los valores del catalogo.");
  }

  const incomingIds = new Set(normalizedValues.map((value) => value.id).filter(Boolean));
  const existingIds = (existingValues || []).map((value) => value.id);
  const removableIds = existingIds.filter((valueId) => !incomingIds.has(valueId));

  if (removableIds.length) {
    const { error } = await supabase.from("catalog_values").delete().in("id", removableIds);
    if (error) {
      throw new Error(error.message || "No se pudieron sincronizar los valores eliminados.");
    }
  }

  for (const [index, value] of normalizedValues.entries()) {
    const valuePayload = {
      catalog_id: catalogId,
      label: value.label || "",
      value_code: value.value || toInternalCode(value.label || `VALUE_${index + 1}`),
      description: value.description || null,
      status: value.status || "active",
      sort_order: Number(value.sortOrder) || index + 1,
      is_default: Boolean(value.isDefault),
    };

    const query = value.id
      ? supabase.from("catalog_values").update(valuePayload).eq("id", value.id)
      : supabase.from("catalog_values").insert(valuePayload);
    const { error } = await query;
    if (error) {
      throw new Error(error.message || "No se pudieron guardar los valores del catalogo.");
    }
  }
}

export async function saveOrganizationItemInSupabase(type, item = {}) {
  ensureSupabase();
  clearOrganizationsCache();
  const tenantContext = await getTenantContext();
  const organizations = await fetchOrganizationsFromSupabase();

  if (!tenantContext?.canAccessAllCompanies && ["companies", "levels", "entities"].includes(type)) {
    throw new Error("Esta operacion solo esta disponible para administradores globales.");
  }

  if (type === "entities") {
    const payload = organizationPayload(type, item, organizations);
    const row = await upsertOrganizationRow("catalogs", item.id, payload);
    await syncCatalogValues(row.id, item.values || []);
    const refreshed = await fetchOrganizationsFromSupabase();
    return refreshed.entities.find((entry) => entry.id === row.id) || null;
  }

  const tableMap = {
    companies: "companies",
    locations: "locations",
    levels: "levels",
    departments: "departments",
    positions: "positions",
  };

  const table = tableMap[type];
  if (!table) {
    throw new Error("Tipo de organizacion no soportado.");
  }

  const payload = organizationPayload(type, item, organizations);
  assertTenantAccess(payload.company_id, tenantContext);
  const row = await upsertOrganizationRow(table, item.id, payload);
  const refreshed = await fetchOrganizationsFromSupabase();
  return refreshed[type].find((entry) => entry.id === row.id) || null;
}

export async function deleteOrganizationItemInSupabase(type, itemId) {
  ensureSupabase();
  clearOrganizationsCache();
  const organizations = await fetchOrganizationsFromSupabase();

  const tenantContext = await getTenantContext();
  if (!tenantContext?.canAccessAllCompanies && ["companies", "levels", "entities"].includes(type)) {
    throw new Error("Esta operacion solo esta disponible para administradores globales.");
  }

  if (type === "entities") {
    const { error: valuesError } = await supabase.from("catalog_values").delete().eq("catalog_id", itemId);
    if (valuesError) {
      throw new Error(valuesError.message || "No se pudieron eliminar los valores del catalogo.");
    }
    const { error } = await supabase.from("catalogs").delete().eq("id", itemId);
    if (error) {
      throw new Error(error.message || "No se pudo eliminar el catalogo.");
    }
    return true;
  }

  const tableMap = {
    companies: "companies",
    locations: "locations",
    levels: "levels",
    departments: "departments",
    positions: "positions",
  };

  const table = tableMap[type];
  if (!table) {
    throw new Error("Tipo de organizacion no soportado.");
  }

  const companyScopedTypes = {
    companies: organizations.companies,
    locations: organizations.locations,
    departments: organizations.departments,
    positions: organizations.positions,
  };
  if (type !== "levels") {
    const current = (companyScopedTypes[type] || []).find((entry) => entry.id === itemId);
    if (!current) {
      throw new Error("No tienes permiso para eliminar registros de otra compania.");
    }
  }

  const { error } = await supabase.from(table).delete().eq("id", itemId);
  if (error) {
    throw new Error(error.message || "No se pudo eliminar el registro administrativo.");
  }
  return true;
}
