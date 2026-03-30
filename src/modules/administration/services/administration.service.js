import { hasSupabaseConfig } from "../../../services/supabase/client";
import {
  deleteOrganizationItemInSupabase,
  fetchOrganizationsFromSupabase,
  saveOrganizationItemInSupabase,
} from "../../../services/supabase/mgahrcore.repository";

const STORAGE_KEYS = {
  users: "mgahrcore.administration.users",
  settings: "mgahrcore.administration.settings",
  companies: "mgahrcore.administration.companies",
  positions: "mgahrcore.administration.positions",
  levels: "mgahrcore.administration.levels",
  departments: "mgahrcore.administration.departments",
  locations: "mgahrcore.administration.locations",
  entities: "mgahrcore.administration.entities",
  roles: "mgahrcore.administration.roles",
  approvalFlows: "mgahrcore.administration.approvalFlows",
  approvalQueue: "mgahrcore.administration.approvalQueue",
  settingsAudit: "mgahrcore.administration.settingsAudit",
  demoSeed: "mgahrcore.administration.demoSeedLoaded",
};

const seedRoles = [
  {
    id: "ROL-001",
    name: "Platform Administrator",
    scope: "Gobierno total de la plataforma",
    status: "active",
    permissions: {
      dashboard: ["view", "admin"],
      recruitment: ["view", "create", "edit", "approve", "admin"],
      employees: ["view", "create", "edit", "approve", "admin"],
      vacations: ["view", "approve", "admin"],
      administration: ["view", "create", "edit", "approve", "admin"],
    },
  },
  {
    id: "ROL-002",
    name: "HR Director",
    scope: "Direccion de personas y autorizaciones",
    status: "active",
    permissions: {
      dashboard: ["view"],
      recruitment: ["view", "create", "edit", "approve"],
      employees: ["view", "create", "edit", "approve"],
      vacations: ["view", "approve"],
      administration: ["view"],
    },
  },
  {
    id: "ROL-003",
    name: "HR Operations",
    scope: "Operacion del ciclo del colaborador",
    status: "active",
    permissions: {
      dashboard: ["view"],
      recruitment: ["view", "edit"],
      employees: ["view", "create", "edit"],
      vacations: ["view"],
      administration: ["view"],
    },
  },
  {
    id: "ROL-004",
    name: "Business Manager",
    scope: "Aprobaciones de negocio y seguimiento",
    status: "active",
    permissions: {
      dashboard: ["view"],
      recruitment: ["view", "approve"],
      employees: ["view", "approve"],
      vacations: ["view", "approve"],
      administration: [],
    },
  },
];

const seedApprovalFlows = [
  {
    id: "FLOW-000",
    name: "Requisiciones y ofertas",
    module: "Recruitment",
    requestType: "Solicitud de vacante y oferta final",
    ownerRoleId: "ROL-002",
    levels: 2,
    priority: "Alta",
    status: "active",
    responsibleChain: ["Business Manager", "HR Director"],
  },
  {
    id: "FLOW-001",
    name: "Vacaciones corporativas",
    module: "Vacations",
    requestType: "Solicitud de vacaciones",
    ownerRoleId: "ROL-004",
    levels: 2,
    priority: "Alta",
    status: "active",
    responsibleChain: ["Lider directo", "HR Director"],
  },
  {
    id: "FLOW-002",
    name: "Permisos y salidas",
    module: "Employees",
    requestType: "Permisos cortos",
    ownerRoleId: "ROL-003",
    levels: 2,
    priority: "Media",
    status: "active",
    responsibleChain: ["Manager", "HR Operations"],
  },
  {
    id: "FLOW-003",
    name: "Altas y cambios sensibles",
    module: "Employees",
    requestType: "Alta o cambio critico",
    ownerRoleId: "ROL-002",
    levels: 3,
    priority: "Alta",
    status: "active",
    responsibleChain: ["Business Manager", "HR Director", "Platform Administrator"],
  },
  {
    id: "FLOW-004",
    name: "Accesos administrativos",
    module: "Administration",
    requestType: "Cambio de acceso",
    ownerRoleId: "ROL-001",
    levels: 2,
    priority: "Critica",
    status: "active",
    responsibleChain: ["Security Owner", "Platform Administrator"],
  },
];

const seedApprovalQueue = [
  {
    id: "APP-001",
    flowId: "FLOW-001",
    type: "Vacaciones",
    module: "Vacations",
    requester: "Paola Mendez",
    responsibleChain: ["Lider directo", "HR Director"],
    currentStep: 2,
    totalLevels: 2,
    currentLevel: "HR Director",
    priority: "Alta",
    status: "pending",
    sla: "6h",
    history: [
      { level: 1, actor: "Lider directo", decision: "approved", actedAt: "2026-03-17T09:10:00Z" },
    ],
  },
  {
    id: "APP-002",
    flowId: "FLOW-003",
    type: "Cambio salarial",
    module: "Employees",
    requester: "Compensation Team",
    responsibleChain: ["Business Manager", "HR Director", "Platform Administrator"],
    currentStep: 3,
    totalLevels: 3,
    currentLevel: "Platform Administrator",
    priority: "Critica",
    status: "pending",
    sla: "2h",
    history: [
      { level: 1, actor: "Business Manager", decision: "approved", actedAt: "2026-03-17T07:30:00Z" },
      { level: 2, actor: "HR Director", decision: "approved", actedAt: "2026-03-17T08:25:00Z" },
    ],
  },
  {
    id: "APP-003",
    flowId: "FLOW-004",
    type: "Nuevo acceso",
    module: "Administration",
    requester: "TI Interna",
    responsibleChain: ["Security Owner", "Platform Administrator"],
    currentStep: 2,
    totalLevels: 2,
    currentLevel: "Security Owner",
    priority: "Alta",
    status: "approved",
    sla: "Cerrado",
    resolvedAt: "2026-03-16T14:20:00Z",
    history: [
      { level: 1, actor: "Security Owner", decision: "approved", actedAt: "2026-03-16T12:10:00Z" },
      { level: 2, actor: "Platform Administrator", decision: "approved", actedAt: "2026-03-16T14:20:00Z" },
    ],
  },
];

const auditFeed = [
  {
    id: "AUD-001",
    title: "Se actualizo la matriz de permisos de HR Director",
    actor: "Platform Administrator",
    timestamp: "2026-03-17T13:40:00Z",
    detail: "Se habilito aprobacion en modulo Employees y visibilidad en Vacation Control.",
  },
  {
    id: "AUD-002",
    title: "Cambio de idioma corporativo aplicado a Shared Services",
    actor: "HR Operations",
    timestamp: "2026-03-16T21:15:00Z",
    detail: "Se definio ingles como idioma por defecto para usuarios de soporte regional.",
  },
  {
    id: "AUD-003",
    title: "Nueva regla de aprobacion para cambios sensibles de colaboradores",
    actor: "HR Director",
    timestamp: "2026-03-15T15:10:00Z",
    detail: "Ahora requiere 3 niveles y aprobacion final de Platform Administrator.",
  },
];

const healthChecks = [
  { id: "HLT-001", area: "Identity & Access", status: "healthy", detail: "Roles sincronizados y sin conflictos detectados." },
  { id: "HLT-002", area: "Approval Governance", status: "warning", detail: "2 solicitudes criticas dentro de SLA de 6 horas." },
  { id: "HLT-003", area: "Localization", status: "healthy", detail: "Idioma y zona horaria persistidos para toda la plataforma." },
  { id: "HLT-004", area: "Catalog Integrity", status: "healthy", detail: "Companias, niveles y departamentos consistentes con Employees." },
];

const emptyCollections = {
  users: [],
  companies: [],
  positions: [],
  levels: [],
  departments: [],
  locations: [],
  entities: [],
};

const defaultSettings = {
  language: "es",
  timezone: "",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  baseCurrency: "BOB",
  notificationsDigest: "daily",
  maintenanceMode: false,
  maintenanceModeScope: "off",
  maintenanceModules: [],
  readOnlyMode: false,
  logsEnabled: true,
  companyScope: "global",
  companyOverrides: [],
  featureFlags: [
    {
      id: "recruitment_enabled",
      label: "Recruitment",
      description: "Controla disponibilidad del modulo de atraccion y pipeline.",
      module: "Recruitment",
      enabled: true,
      environment: "all",
      companyScope: "all",
      critical: true,
    },
    {
      id: "employees_enabled",
      label: "Employees Workspace",
      description: "Habilita el workspace integral del colaborador.",
      module: "Employees",
      enabled: true,
      environment: "all",
      companyScope: "all",
      critical: true,
    },
    {
      id: "advanced_reports",
      label: "Advanced Reports",
      description: "Activa reportes ejecutivos ampliados y vistas de analitica.",
      module: "Administration",
      enabled: false,
      environment: "dev",
      companyScope: "global",
      critical: false,
    },
    {
      id: "payroll_enabled",
      label: "Payroll Ready",
      description: "Reserva capacidades futuras para integracion con nomina.",
      module: "Payroll",
      enabled: false,
      environment: "prod",
      companyScope: "company",
      critical: true,
    },
  ],
  security: {
    sessionTimeoutMinutes: 30,
    passwordPolicy: "strong",
    failedAttempts: 5,
    userLockoutMinutes: 30,
  },
  updatedAt: "",
  updatedBy: "",
};

function normalizeFeatureFlag(flag = {}) {
  return {
    id: flag.id || createId("FLAG"),
    label: flag.label || flag.id || "Feature",
    description: flag.description || "",
    module: flag.module || "Administration",
    enabled: Boolean(flag.enabled),
    environment: flag.environment || "all",
    companyScope: flag.companyScope || "all",
    critical: Boolean(flag.critical),
  };
}

function normalizeCompanyOverride(override = {}) {
  return {
    companyId: override.companyId || "",
    language: override.language || "",
    timezone: override.timezone || "",
    baseCurrency: override.baseCurrency || "",
    dateFormat: override.dateFormat || "",
  };
}

function normalizeSettings(settings = {}, companies = []) {
  const merged = {
    ...defaultSettings,
    ...settings,
    security: {
      ...defaultSettings.security,
      ...(settings.security || {}),
    },
  };

  merged.featureFlags = Array.isArray(settings.featureFlags) && settings.featureFlags.length
    ? settings.featureFlags.map(normalizeFeatureFlag)
    : defaultSettings.featureFlags.map(normalizeFeatureFlag);

  merged.companyOverrides = companies.map((company) => {
    const existing = (settings.companyOverrides || []).find((item) => item.companyId === company.id);
    return normalizeCompanyOverride({
      companyId: company.id,
      language: existing?.language || company.defaultLanguage || "",
      timezone: existing?.timezone || "",
      baseCurrency: existing?.baseCurrency || company.baseCurrency || "",
      dateFormat: existing?.dateFormat || merged.dateFormat,
    });
  });

  merged.maintenanceMode = merged.maintenanceModeScope !== "off";
  return merged;
}

function getStoredSettingsAudit() {
  return readCollection(STORAGE_KEYS.settingsAudit, []);
}

function createSettingsAuditEntries(previousSettings, nextSettings, actor = "Platform Administrator") {
  const entries = [];
  const previousFlags = new Map((previousSettings.featureFlags || []).map((flag) => [flag.id, flag]));
  const nextFlags = new Map((nextSettings.featureFlags || []).map((flag) => [flag.id, flag]));

  const trackedFields = [
    ["language", "Idioma global"],
    ["timezone", "Zona horaria por defecto"],
    ["dateFormat", "Formato de fecha"],
    ["timeFormat", "Formato de hora"],
    ["baseCurrency", "Moneda base"],
    ["companyScope", "Alcance multiempresa"],
    ["notificationsDigest", "Digest de notificaciones"],
    ["maintenanceModeScope", "Modo de mantenimiento"],
    ["readOnlyMode", "Modo solo lectura"],
    ["logsEnabled", "Logs activos"],
  ];

  trackedFields.forEach(([key, label]) => {
    if (JSON.stringify(previousSettings[key]) !== JSON.stringify(nextSettings[key])) {
      entries.push({
        id: createId("AUDCFG"),
        title: `${label} actualizado`,
        actor,
        timestamp: new Date().toISOString(),
        detail: `Cambio aplicado de ${previousSettings[key] ?? "sin definir"} a ${nextSettings[key] ?? "sin definir"}.`,
      });
    }
  });

  if (JSON.stringify(previousSettings.security) !== JSON.stringify(nextSettings.security)) {
    entries.push({
      id: createId("AUDCFG"),
      title: "Politica de seguridad actualizada",
      actor,
      timestamp: new Date().toISOString(),
      detail: `Sesion ${nextSettings.security.sessionTimeoutMinutes} min, politica ${nextSettings.security.passwordPolicy}, intentos ${nextSettings.security.failedAttempts}.`,
    });
  }

  nextFlags.forEach((flag, id) => {
    const previous = previousFlags.get(id);
    if (!previous || JSON.stringify(previous) !== JSON.stringify(flag)) {
      entries.push({
        id: createId("AUDCFG"),
        title: `Feature flag ${flag.label} actualizado`,
        actor,
        timestamp: new Date().toISOString(),
        detail: `Estado ${flag.enabled ? "activo" : "inactivo"} en ${flag.environment} con alcance ${flag.companyScope}.`,
      });
    }
  });

  return entries;
}

function buildDynamicHealthChecks(settings) {
  const activeFlags = settings.featureFlags.filter((flag) => flag.enabled).length;
  const criticalFlagsDisabled = settings.featureFlags.filter((flag) => flag.critical && !flag.enabled).length;

  return [
    {
      id: "HLT-SET-001",
      area: "System Runtime",
      status: settings.maintenanceModeScope === "off" ? "healthy" : settings.maintenanceModeScope === "partial" ? "warning" : "critical",
      detail: settings.maintenanceModeScope === "off"
        ? "Operacion normal sin restricciones de mantenimiento."
        : settings.maintenanceModeScope === "partial"
          ? `Mantenimiento parcial activo sobre ${settings.maintenanceModules.length || 1} modulo(s).`
          : "Modo mantenimiento total habilitado para toda la plataforma.",
    },
    {
      id: "HLT-SET-002",
      area: "Localization",
      status: settings.timezone ? "healthy" : "warning",
      detail: `Idioma ${settings.language.toUpperCase()} · TZ ${settings.timezone || "sin definir"} · Base ${settings.baseCurrency}.`,
    },
    {
      id: "HLT-SET-003",
      area: "Feature Flags",
      status: criticalFlagsDisabled ? "warning" : "healthy",
      detail: `${activeFlags} flags activos · ${criticalFlagsDisabled} flags criticos desactivados.`,
    },
    {
      id: "HLT-SET-004",
      area: "Security Policy",
      status: settings.security.passwordPolicy === "strict" || settings.security.sessionTimeoutMinutes <= 30 ? "healthy" : "warning",
      detail: `Sesion ${settings.security.sessionTimeoutMinutes} min · ${settings.security.failedAttempts} intentos antes de bloqueo.`,
    },
  ];
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : parsed;
  } catch {
    return fallback;
  }
}

function writeCollection(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function getStoredRoles() {
  return readCollection(STORAGE_KEYS.roles, []);
}

function getStoredApprovalFlows() {
  return readCollection(STORAGE_KEYS.approvalFlows, []);
}

function getStoredApprovalQueue() {
  return readCollection(STORAGE_KEYS.approvalQueue, []);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function createOperationResult(ok, payload = {}) {
  return { ok, ...payload };
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase();
}

function toInternalCode(value = "") {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
}

function normalizeCatalogValue(value = {}, index = 0) {
  const label = value.label || value.name || "";
  return {
    id: value.id || createId("CATV"),
    label,
    value: value.value || toInternalCode(label),
    description: value.description || "",
    status: value.status || "active",
    sortOrder: Number(value.sortOrder) || index + 1,
    isDefault: Boolean(value.isDefault),
    usageCount: Number(value.usageCount) || 0,
  };
}

function sanitizeCatalogValues(values = []) {
  const normalized = values
    .map((value, index) => normalizeCatalogValue(value, index))
    .sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
    .map((value, index) => ({ ...value, sortOrder: index + 1 }));

  if (!normalized.some((value) => value.isDefault) && normalized.length) {
    normalized[0] = {
      ...normalized[0],
      isDefault: true,
    };
  }

  return normalized.map((value) => ({
    ...value,
    isDefault: value.isDefault && value.status === "active",
  }));
}

function countMatches(records = [], keys = [], expectedValue = "") {
  const normalizedExpected = normalizeKey(expectedValue);
  if (!normalizedExpected) {
    return 0;
  }

  return records.reduce((sum, record) => {
    const matches = keys.some((key) => normalizeKey(record?.[key]) === normalizedExpected);
    return sum + (matches ? 1 : 0);
  }, 0);
}

function getEntityUsageKeys(entity = {}) {
  const identity = `${entity.internalCode || entity.code || ""} ${entity.name || ""}`.toLowerCase();

  if (identity.includes("contract")) {
    return ["contractType", "contract", "employmentType", "hiringType"];
  }

  if (identity.includes("leave")) {
    return ["leaveType", "leaveCategory", "type"];
  }

  if (identity.includes("permission")) {
    return ["permissionType", "permissionCategory", "type"];
  }

  if (identity.includes("status")) {
    return ["status", "employmentStatus"];
  }

  if (identity.includes("exit") || identity.includes("salida") || identity.includes("termination")) {
    return ["exitReason", "terminationReason", "reason"];
  }

  return [];
}

function enrichEntity(entity = {}, employeeRecords = [], employeeRequests = [], jobRequests = []) {
  const usageKeys = getEntityUsageKeys(entity);
  const values = sanitizeCatalogValues(entity.values || []).map((value) => {
    const usageCount = value.usageCount
      || countMatches(employeeRecords, usageKeys, value.label)
      || countMatches(employeeRequests, usageKeys, value.label)
      || countMatches(jobRequests, usageKeys, value.label);

    return {
      ...value,
      usageCount,
    };
  });

  const activeValues = values.filter((value) => value.status === "active");
  const defaultValue = values.find((value) => value.isDefault);
  return {
    ...entity,
    internalCode: entity.internalCode || entity.code || "",
    code: entity.code || entity.internalCode || "",
    values,
    valuesCount: values.length,
    activeValuesCount: activeValues.length,
    defaultValueName: defaultValue?.label || "Sin valor por defecto",
    usageCount: values.reduce((sum, value) => sum + Number(value.usageCount || 0), 0),
  };
}

function normalizeApprovalFlow(flow = {}) {
  return {
    id: flow.id || createId("FLOW"),
    name: flow.name || "",
    module: flow.module || "Administration",
    requestType: flow.requestType || "",
    ownerRoleId: flow.ownerRoleId || "",
    levels: Number(flow.levels) || 1,
    priority: flow.priority || "Alta",
    status: flow.status || "active",
    responsibleChain: Array.isArray(flow.responsibleChain) ? flow.responsibleChain : [],
  };
}

function normalizeApprovalQueueItem(item = {}, flows = getStoredApprovalFlows()) {
  const linkedFlow = flows.find((flow) => flow.id === item.flowId);
  const responsibleChain = Array.isArray(item.responsibleChain) && item.responsibleChain.length
    ? item.responsibleChain
    : linkedFlow?.responsibleChain || [];
  const totalLevels = Number(item.totalLevels) || linkedFlow?.levels || responsibleChain.length || 1;
  const currentStep = Math.min(Number(item.currentStep) || 1, totalLevels);

  return {
    id: item.id || createId("APP"),
    flowId: item.flowId || linkedFlow?.id || "",
    type: item.type || linkedFlow?.requestType || "Solicitud",
    module: item.module || linkedFlow?.module || "Administration",
    requester: item.requester || "Solicitante sin identificar",
    responsibleChain,
    currentStep,
    totalLevels,
    currentLevel: item.currentLevel || responsibleChain[currentStep - 1] || "Sin asignar",
    priority: item.priority || linkedFlow?.priority || "Media",
    status: item.status || "pending",
    sla: item.sla || "Sin SLA",
    history: Array.isArray(item.history) ? item.history : [],
    resolvedAt: item.resolvedAt || "",
    lastActor: item.lastActor || "",
    lastDecisionAt: item.lastDecisionAt || "",
  };
}

function buildRoleDeletionDependencies(roleId) {
  const users = readCollection(STORAGE_KEYS.users, emptyCollections.users).filter((user) => user.roleId === roleId);
  const flows = getStoredApprovalFlows().filter((flow) => flow.ownerRoleId === roleId);

  return {
    users,
    flows,
    total: users.length + flows.length,
  };
}

function buildOrganizationDependencies(type, itemId) {
  const raw = readRawOrganizations();
  const users = readCollection(STORAGE_KEYS.users, emptyCollections.users);
  const employeeRecords = readCollection("mgahrcore.employees.records", []);
  const employeeRequests = readCollection("mgahrcore.employees.requests", []);
  const jobRequests = readCollection("mgahrcore.recruitment.jobRequests", []);

  const map = {
    companies: {
      users: users.filter((user) => user.companyId === itemId),
      departments: raw.departments.filter((department) => department.companyId === itemId),
      locations: raw.locations.filter((location) => location.companyId === itemId),
    },
    departments: {
      positions: raw.positions.filter((position) => position.departmentId === itemId),
    },
    levels: {
      positions: raw.positions.filter((position) => position.levelId === itemId),
    },
    locations: {
      positions: raw.positions.filter((position) => position.locationId === itemId),
      employees: employeeRecords.filter((employee) => employee.locationId === itemId || employee.location === raw.locations.find((location) => location.id === itemId)?.name),
      employeeRequests: employeeRequests.filter((request) => request.locationId === itemId || request.location === raw.locations.find((location) => location.id === itemId)?.name),
      recruitmentRequests: jobRequests.filter((request) => request.locationId === itemId || request.location === raw.locations.find((location) => location.id === itemId)?.name),
    },
    positions: {
      childPositions: raw.positions.filter((position) => position.reportsToPositionId === itemId),
      employees: employeeRecords.filter((employee) => employee.positionId === itemId),
      employeeRequests: employeeRequests.filter((request) => request.positionId === itemId),
      recruitmentRequests: jobRequests.filter((request) => request.positionId === itemId),
    },
    entities: (() => {
      const entity = raw.entities.find((item) => item.id === itemId);
      const enrichedEntity = enrichEntity(entity, employeeRecords, employeeRequests, jobRequests);
      const valuesInUse = (enrichedEntity.values || []).filter((value) => Number(value.usageCount) > 0);

      return {
        valuesInUse,
      };
    })(),
  };

  const dependencies = map[type] || {};
  const total = Object.values(dependencies).reduce((sum, items) => sum + items.length, 0);
  return { dependencies, total };
}

function getSeedOrganizations() {
  const companies = [
    {
      id: "COM-001",
      name: "MGAHRCore Holding",
      legalName: "MGAHRCore Holding S.A.",
      tradeName: "MGAHRCore",
      taxId: "1029384756",
      countryCode: "BO",
      country: "Bolivia",
      industry: "Tecnologia y servicios corporativos",
      status: "active",
      corporateEmail: "corporate@mgahrcore.com",
      mainPhone: "+591 2 2140000",
      website: "https://www.mgahrcore.com",
      taxAddress: "Av. Corporativa 100, Torre Ejecutiva",
      cityProvince: "La Paz",
      estimatedEmployees: 124,
      workforce: 124,
      defaultLanguage: "es",
      baseCurrency: "BOB",
      operationsStartDate: "2021-01-15",
      structureType: "principal",
    },
    {
      id: "COM-002",
      name: "MGA Shared Services",
      legalName: "MGA Shared Services S.R.L.",
      tradeName: "MGA Shared Services",
      taxId: "9988776655",
      countryCode: "BO",
      country: "Bolivia",
      industry: "Servicios compartidos",
      status: "active",
      corporateEmail: "shared.services@mgahrcore.com",
      mainPhone: "+591 3 3302200",
      website: "https://shared.mgahrcore.com",
      taxAddress: "Av. Empresarial 245, piso 6",
      cityProvince: "Santa Cruz",
      estimatedEmployees: 46,
      workforce: 46,
      defaultLanguage: "es",
      baseCurrency: "BOB",
      operationsStartDate: "2022-05-02",
      structureType: "subsidiaria",
    },
  ];
  const levels = [
    {
      id: "LVL-001",
      name: "Director",
      code: "DIR",
      internalCode: "DIR",
      hierarchyOrder: 1,
      parentLevelId: "",
      levelType: "ejecutivo",
      seniority: "Director",
      organizationalFamily: "Leadership",
      salaryMin: 18000,
      salaryMax: 26000,
      currency: "BOB",
      payFrequency: "monthly",
      approvalLevelRequired: "4",
      canApproveRequests: true,
      systemAccessLevel: "alto",
      organizationalImpact: "alto",
      criticalLevel: true,
      status: "active",
    },
    {
      id: "LVL-002",
      name: "Lead",
      code: "LEAD",
      internalCode: "LEAD",
      hierarchyOrder: 2,
      parentLevelId: "LVL-001",
      levelType: "profesional",
      seniority: "Lead",
      organizationalFamily: "Leadership",
      salaryMin: 12000,
      salaryMax: 17999,
      currency: "BOB",
      payFrequency: "monthly",
      approvalLevelRequired: "3",
      canApproveRequests: true,
      systemAccessLevel: "alto",
      organizationalImpact: "alto",
      criticalLevel: true,
      status: "active",
    },
    {
      id: "LVL-003",
      name: "Senior",
      code: "SR",
      internalCode: "SR",
      hierarchyOrder: 3,
      parentLevelId: "LVL-002",
      levelType: "profesional",
      seniority: "Senior",
      organizationalFamily: "Professional",
      salaryMin: 8000,
      salaryMax: 11999,
      currency: "BOB",
      payFrequency: "monthly",
      approvalLevelRequired: "2",
      canApproveRequests: false,
      systemAccessLevel: "medio",
      organizationalImpact: "medio",
      criticalLevel: false,
      status: "active",
    },
    {
      id: "LVL-004",
      name: "Mid",
      code: "MID",
      internalCode: "MID",
      hierarchyOrder: 4,
      parentLevelId: "LVL-003",
      levelType: "operativo",
      seniority: "Mid",
      organizationalFamily: "Professional",
      salaryMin: 5200,
      salaryMax: 7999,
      currency: "BOB",
      payFrequency: "monthly",
      approvalLevelRequired: "1",
      canApproveRequests: false,
      systemAccessLevel: "bajo",
      organizationalImpact: "bajo",
      criticalLevel: false,
      status: "active",
    },
  ];
  const departments = [
    {
      id: "DEP-001",
      name: "People & Culture",
      code: "PC",
      internalCode: "PC",
      companyId: "COM-001",
      parentDepartmentId: "",
      departmentHead: "HR Director",
      head: "HR Director",
      departmentType: "estrategico",
      levelId: "LVL-002",
      locationId: "LOC-001",
      costCenter: "CC-PC-100",
      budget: 420000,
      estimatedTeamSize: 18,
      description: "Gobierna talento, cultura, compensation y experiencia del colaborador.",
      criticalDepartment: true,
      visibleInRecruitment: true,
      visibleInEmployees: true,
      status: "active",
    },
    {
      id: "DEP-002",
      name: "Finance",
      code: "FIN",
      internalCode: "FIN",
      companyId: "COM-001",
      parentDepartmentId: "",
      departmentHead: "Finance Manager",
      head: "Finance Manager",
      departmentType: "soporte",
      levelId: "LVL-002",
      locationId: "LOC-002",
      costCenter: "CC-FIN-210",
      budget: 310000,
      estimatedTeamSize: 11,
      description: "Controla planeacion financiera, presupuesto y salud economica de la operacion.",
      criticalDepartment: true,
      visibleInRecruitment: true,
      visibleInEmployees: true,
      status: "active",
    },
    {
      id: "DEP-003",
      name: "Operations",
      code: "OPS",
      internalCode: "OPS",
      companyId: "COM-002",
      parentDepartmentId: "",
      departmentHead: "Operations Director",
      head: "Operations Director",
      departmentType: "operativo",
      levelId: "LVL-001",
      locationId: "LOC-003",
      costCenter: "CC-OPS-320",
      budget: 690000,
      estimatedTeamSize: 36,
      description: "Coordina hubs operativos, performance de servicio y continuidad del negocio.",
      criticalDepartment: true,
      visibleInRecruitment: true,
      visibleInEmployees: true,
      status: "active",
    },
  ];
  const locations = [
    {
      id: "LOC-001",
      name: "La Paz HQ",
      code: "LPZ",
      companyId: "COM-001",
      locationType: "hq",
      status: "active",
      countryCode: "BO",
      country: "Bolivia",
      regionState: "La Paz",
      city: "La Paz",
      fullAddress: "Av. Corporativa 100, Torre Ejecutiva, piso 12",
      postalCode: "0001",
      timezone: "America/La_Paz",
      currency: "BOB",
      primaryLanguage: "es",
      dateFormat: "DD/MM/YYYY",
      workWeek: "monday-friday",
      predominantContractType: "Indefinido",
      laborRegulation: "Ley General del Trabajo Bolivia",
      standardWorkingHours: 40,
      holidays: "Calendario nacional Bolivia",
      isPrimaryLocation: true,
      allowsRemoteWork: true,
      affectsPayroll: true,
    },
    {
      id: "LOC-002",
      name: "Santa Cruz Hub",
      code: "SCZ",
      companyId: "COM-001",
      locationType: "regional-hub",
      status: "active",
      countryCode: "BO",
      country: "Bolivia",
      regionState: "Santa Cruz",
      city: "Santa Cruz de la Sierra",
      fullAddress: "Av. Empresarial 245, Business Center Norte",
      postalCode: "0002",
      timezone: "America/La_Paz",
      currency: "BOB",
      primaryLanguage: "es",
      dateFormat: "DD/MM/YYYY",
      workWeek: "monday-friday",
      predominantContractType: "Indefinido",
      laborRegulation: "Ley General del Trabajo Bolivia",
      standardWorkingHours: 40,
      holidays: "Calendario nacional Bolivia",
      isPrimaryLocation: false,
      allowsRemoteWork: true,
      affectsPayroll: true,
    },
    {
      id: "LOC-003",
      name: "Cochabamba Operations",
      code: "CBB",
      companyId: "COM-002",
      locationType: "office",
      status: "active",
      countryCode: "BO",
      country: "Bolivia",
      regionState: "Cochabamba",
      city: "Cochabamba",
      fullAddress: "Zona Norte, Parque Industrial de Servicios 18",
      postalCode: "0003",
      timezone: "America/La_Paz",
      currency: "BOB",
      primaryLanguage: "es",
      dateFormat: "DD/MM/YYYY",
      workWeek: "monday-friday",
      predominantContractType: "Plazo fijo",
      laborRegulation: "Ley General del Trabajo Bolivia",
      standardWorkingHours: 48,
      holidays: "Calendario nacional Bolivia",
      isPrimaryLocation: false,
      allowsRemoteWork: false,
      affectsPayroll: true,
    },
  ];
  const positions = [
    {
      id: "POS-001",
      name: "HR Business Partner",
      code: "HRBP",
      internalCode: "HRBP",
      departmentId: "DEP-001",
      levelId: "LVL-002",
      reportsToPositionId: "",
      positionType: "tactica",
      jobFamily: "RRHH",
      locationId: "LOC-001",
      businessRole: "Socio estrategico para lideres y acompanamiento de talento.",
      description: "Posicion clave para conectar People & Culture con lideres de negocio, clima y desarrollo.",
      impact: "alto",
      hiringType: "Indefinido",
      criticalPosition: true,
      useInRecruitment: true,
      useInEmployees: true,
      status: "active",
    },
    {
      id: "POS-002",
      name: "Talent Acquisition Specialist",
      code: "TAS",
      internalCode: "TAS",
      departmentId: "DEP-001",
      levelId: "LVL-003",
      reportsToPositionId: "POS-001",
      positionType: "operativa",
      jobFamily: "RRHH",
      locationId: "LOC-001",
      businessRole: "Operacion del pipeline de atraccion, evaluacion y cierre de vacantes.",
      description: "Gestiona requisiciones, sourcing, entrevistas y coordinacion con hiring managers.",
      impact: "medio",
      hiringType: "Indefinido",
      criticalPosition: false,
      useInRecruitment: true,
      useInEmployees: true,
      status: "active",
    },
    {
      id: "POS-003",
      name: "Financial Planning Analyst",
      code: "FPA",
      internalCode: "FPA",
      departmentId: "DEP-002",
      levelId: "LVL-003",
      reportsToPositionId: "",
      positionType: "tactica",
      jobFamily: "Finanzas",
      locationId: "LOC-002",
      businessRole: "Analisis financiero, presupuesto y reporting para direccion.",
      description: "Posicion orientada a consolidar planeacion, forecast y analitica financiera.",
      impact: "alto",
      hiringType: "Indefinido",
      criticalPosition: true,
      useInRecruitment: true,
      useInEmployees: true,
      status: "active",
    },
    {
      id: "POS-004",
      name: "Operations Supervisor",
      code: "OPS-SUP",
      internalCode: "OPS-SUP",
      departmentId: "DEP-003",
      levelId: "LVL-002",
      reportsToPositionId: "",
      positionType: "estrategica",
      jobFamily: "Operaciones",
      locationId: "LOC-003",
      businessRole: "Controla equipos operativos, continuidad de servicio y performance del hub.",
      description: "Supervisa equipos de operaciones y asegura cumplimiento de SLAs y calidad de entrega.",
      impact: "alto",
      hiringType: "Indefinido",
      criticalPosition: true,
      useInRecruitment: true,
      useInEmployees: true,
      status: "active",
    },
  ];
  const entities = [
    {
      id: "ENT-001",
      name: "Tipos de contrato",
      code: "CAT_CONTRACT_TYPES",
      internalCode: "CAT_CONTRACT_TYPES",
      description: "Estandariza la modalidad contractual para Employees, Recruitment y configuraciones de alta.",
      relatedModule: "Employees",
      catalogType: "simple",
      userEditable: true,
      requiresApproval: true,
      criticalCatalog: true,
      status: "active",
      values: [
        { id: "CATV-001", label: "Indefinido", value: "INDEFINIDO", description: "Relacion laboral permanente.", sortOrder: 1, isDefault: true, status: "active", usageCount: 14 },
        { id: "CATV-002", label: "Temporal", value: "TEMPORAL", description: "Contrato con fecha fin definida.", sortOrder: 2, isDefault: false, status: "active", usageCount: 6 },
        { id: "CATV-003", label: "Freelance", value: "FREELANCE", description: "Prestacion de servicios por entregables.", sortOrder: 3, isDefault: false, status: "active", usageCount: 2 },
      ],
    },
    {
      id: "ENT-002",
      name: "Estados de empleado",
      code: "CAT_EMPLOYEE_STATUS",
      internalCode: "CAT_EMPLOYEE_STATUS",
      description: "Controla visibilidad operativa, analytics y salud del ciclo de vida del colaborador.",
      relatedModule: "Employees",
      catalogType: "simple",
      userEditable: false,
      requiresApproval: true,
      criticalCatalog: true,
      status: "active",
      values: [
        { id: "CATV-004", label: "Activo", value: "ACTIVO", description: "Colaborador habilitado y operativo.", sortOrder: 1, isDefault: true, status: "active", usageCount: 28 },
        { id: "CATV-005", label: "En onboarding", value: "ONBOARDING", description: "Alta en proceso con expediente en progreso.", sortOrder: 2, isDefault: false, status: "active", usageCount: 4 },
        { id: "CATV-006", label: "Suspendido", value: "SUSPENDIDO", description: "Cuenta con restricciones temporales.", sortOrder: 3, isDefault: false, status: "inactive", usageCount: 0 },
      ],
    },
    {
      id: "ENT-003",
      name: "Tipos de permiso",
      code: "CAT_PERMISSION_TYPES",
      internalCode: "CAT_PERMISSION_TYPES",
      description: "Define permisos cortos y causales que alimentan aprobaciones y control horario.",
      relatedModule: "Employees",
      catalogType: "simple",
      userEditable: true,
      requiresApproval: false,
      criticalCatalog: false,
      status: "active",
      values: [
        { id: "CATV-007", label: "Permiso medico", value: "MEDICO", description: "Ausencia breve por atencion medica.", sortOrder: 1, isDefault: true, status: "active", usageCount: 8 },
        { id: "CATV-008", label: "Tramite personal", value: "TRAMITE_PERSONAL", description: "Gestiones personales previamente notificadas.", sortOrder: 2, isDefault: false, status: "active", usageCount: 3 },
        { id: "CATV-009", label: "Estudio", value: "ESTUDIO", description: "Permiso para examenes o actividades academicas.", sortOrder: 3, isDefault: false, status: "active", usageCount: 1 },
      ],
    },
    {
      id: "ENT-004",
      name: "Categorias internas",
      code: "CAT_INTERNAL_CATEGORIES",
      internalCode: "CAT_INTERNAL_CATEGORIES",
      description: "Clasifica solicitudes, estructuras y registros administrativos de forma estandar.",
      relatedModule: "Administration",
      catalogType: "hierarchical",
      userEditable: true,
      requiresApproval: false,
      criticalCatalog: false,
      status: "active",
      values: [
        { id: "CATV-010", label: "Core", value: "CORE", description: "Configuraciones base de plataforma.", sortOrder: 1, isDefault: true, status: "active", usageCount: 5 },
        { id: "CATV-011", label: "Regional", value: "REGIONAL", description: "Ajustes por pais o sede.", sortOrder: 2, isDefault: false, status: "active", usageCount: 2 },
        { id: "CATV-012", label: "Temporal", value: "TEMPORAL", description: "Catalogos operativos de vigencia limitada.", sortOrder: 3, isDefault: false, status: "active", usageCount: 0 },
      ],
    },
  ];

  return { companies, levels, departments, locations, positions, entities };
}

function getSeedUsers() {
  return [
    {
      id: "USR-001",
      name: "Mariana Salvatierra",
      email: "mariana.salvatierra@mgahrcore.com",
      roleId: "ROL-001",
      companyId: "COM-001",
      status: "active",
      language: "es",
      lastAccess: "2026-03-17T12:25:00Z",
    },
    {
      id: "USR-002",
      name: "Oliver Brooks",
      email: "oliver.brooks@mgahrcore.com",
      roleId: "ROL-002",
      companyId: "COM-001",
      status: "active",
      language: "en",
      lastAccess: "2026-03-17T11:54:00Z",
    },
    {
      id: "USR-003",
      name: "Carla Rivera",
      email: "carla.rivera@mgahrcore.com",
      roleId: "ROL-003",
      companyId: "COM-002",
      status: "active",
      language: "es",
      lastAccess: "2026-03-16T22:42:00Z",
    },
  ];
}

function readRawOrganizations() {
  return {
    companies: readCollection(STORAGE_KEYS.companies, emptyCollections.companies),
    positions: readCollection(STORAGE_KEYS.positions, emptyCollections.positions),
    levels: readCollection(STORAGE_KEYS.levels, emptyCollections.levels),
    departments: readCollection(STORAGE_KEYS.departments, emptyCollections.departments),
    locations: readCollection(STORAGE_KEYS.locations, emptyCollections.locations),
    entities: readCollection(STORAGE_KEYS.entities, emptyCollections.entities),
  };
}

function hydrateOrganizations(raw) {
  const employeeRecords = readCollection("mgahrcore.employees.records", []);
  const employeeRequests = readCollection("mgahrcore.employees.requests", []);
  const jobRequests = readCollection("mgahrcore.recruitment.jobRequests", []);

  return {
    companies: raw.companies,
    levels: raw.levels.map((level) => ({
      ...level,
      internalCode: level.internalCode || level.code || "",
      hierarchyOrder: Number(level.hierarchyOrder) || 0,
      salaryMin: Number(level.salaryMin) || 0,
      salaryMax: Number(level.salaryMax) || 0,
      positionsCount: raw.positions.filter((item) => item.levelId === level.id).length,
      employeesCount: employeeRecords.filter((item) => item.levelId === level.id).length,
      parentLevelName: raw.levels.find((item) => item.id === level.parentLevelId)?.name || "",
    })),
    departments: raw.departments.map((department) => ({
      ...department,
      internalCode: department.internalCode || department.code || "",
      companyName: raw.companies.find((item) => item.id === department.companyId)?.name || "Sin compania",
      parentDepartmentName: raw.departments.find((item) => item.id === department.parentDepartmentId)?.name || "",
      locationName: raw.locations.find((item) => item.id === department.locationId)?.name || "Sin ubicacion",
      levelName: raw.levels.find((item) => item.id === department.levelId)?.name || "Sin nivel",
      positionsCount: raw.positions.filter((item) => item.departmentId === department.id).length,
      employeesCount: employeeRecords.filter((item) => item.department === department.name || item.departmentId === department.id).length,
      recruitmentCount: jobRequests.filter((item) => item.department === department.name || item.departmentId === department.id).length,
      pendingRequestsCount: employeeRequests.filter((item) => item.department === department.name || item.departmentId === department.id).length,
    })),
    locations: raw.locations.map((location) => ({
      ...location,
      companyName: raw.companies.find((item) => item.id === location.companyId)?.name || "Sin compania",
      employeesCount: employeeRecords.filter((item) => item.locationId === location.id || item.location === location.name).length,
      recruitmentCount: jobRequests.filter((item) => item.locationId === location.id || item.location === location.name).length,
      positionsCount: raw.positions.filter((item) => item.locationId === location.id).length,
    })),
    positions: raw.positions.map((position) => ({
      ...position,
      internalCode: position.internalCode || position.code || "",
      departmentName: raw.departments.find((item) => item.id === position.departmentId)?.name || "Sin departamento",
      levelName: raw.levels.find((item) => item.id === position.levelId)?.name || "Sin nivel",
      companyId: raw.departments.find((item) => item.id === position.departmentId)?.companyId || "",
      companyName:
        raw.companies.find((item) => item.id === raw.departments.find((department) => department.id === position.departmentId)?.companyId)?.name ||
        "Sin compania",
      reportsToName: raw.positions.find((item) => item.id === position.reportsToPositionId)?.name || "",
      locationName: raw.locations.find((item) => item.id === position.locationId)?.name || "Sin ubicacion",
    })),
    entities: raw.entities.map((entity) => enrichEntity(entity, employeeRecords, employeeRequests, jobRequests)),
  };
}

function buildUser(user, companies) {
  const role = getStoredRoles().find((item) => item.id === user.roleId);
  const company = companies.find((item) => item.id === user.companyId);

  return {
    ...user,
    roleName: role?.name || "Sin rol",
    companyName: company?.name || "Sin compania",
  };
}

export async function getUsers() {
  const rawOrganizations = readRawOrganizations();
  return readCollection(STORAGE_KEYS.users, emptyCollections.users).map((user) => buildUser(user, rawOrganizations.companies));
}

export async function saveUser(user) {
  const users = readCollection(STORAGE_KEYS.users, emptyCollections.users);
  const payload = {
    id: user.id || createId("USR"),
    lastAccess: user.lastAccess || new Date().toISOString(),
    ...user,
  };
  const index = users.findIndex((item) => item.id === payload.id);

  if (index >= 0) {
    users[index] = payload;
  } else {
    users.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.users, users);
  const organizations = readRawOrganizations();
  return buildUser(payload, organizations.companies);
}

export async function deleteUser(userId) {
  const users = readCollection(STORAGE_KEYS.users, emptyCollections.users).filter((item) => item.id !== userId);
  writeCollection(STORAGE_KEYS.users, users);
  return users;
}

export async function getRoles() {
  return getStoredRoles().map((role) => ({
    ...role,
    users: readCollection(STORAGE_KEYS.users, emptyCollections.users).filter((user) => user.roleId === role.id).length,
  }));
}

export async function saveRole(role) {
  const roles = getStoredRoles();
  const payload = {
    id: role.id || createId("ROL"),
    status: role.status || "active",
    permissions: role.permissions || {
      dashboard: [],
      recruitment: [],
      employees: [],
      vacations: [],
      administration: [],
    },
    ...role,
  };
  const index = roles.findIndex((item) => item.id === payload.id);

  if (index >= 0) {
    roles[index] = payload;
  } else {
    roles.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.roles, roles);
  return payload;
}

export async function updateRolePermission(roleId, moduleKey, actionKey, enabled) {
  const roles = getStoredRoles();
  const index = roles.findIndex((role) => role.id === roleId);
  if (index < 0) {
    return null;
  }

  const role = roles[index];
  const current = new Set(role.permissions?.[moduleKey] || []);

  if (enabled) {
    current.add(actionKey);
  } else {
    current.delete(actionKey);
  }

  roles[index] = {
    ...role,
    permissions: {
      ...role.permissions,
      [moduleKey]: [...current],
    },
  };

  writeCollection(STORAGE_KEYS.roles, roles);
  return roles[index];
}

export async function deleteRole(roleId) {
  const dependencies = buildRoleDeletionDependencies(roleId);

  if (dependencies.total > 0) {
    return createOperationResult(false, {
      error: "No se puede eliminar el rol porque sigue asignado a usuarios o flujos de aprobacion.",
      dependencies,
    });
  }

  const roles = getStoredRoles().filter((role) => role.id !== roleId);
  writeCollection(STORAGE_KEYS.roles, roles);
  return createOperationResult(true, { data: roles });
}

export async function getApprovalFlows() {
  return getStoredApprovalFlows().map(normalizeApprovalFlow);
}

export async function getApprovalQueue() {
  const flows = getStoredApprovalFlows().map(normalizeApprovalFlow);
  return getStoredApprovalQueue().map((item) => normalizeApprovalQueueItem(item, flows));
}

export async function saveApprovalFlow(flow) {
  const flows = getStoredApprovalFlows();
  const payload = normalizeApprovalFlow(flow);
  const index = flows.findIndex((item) => item.id === payload.id);

  if (index >= 0) {
    flows[index] = payload;
  } else {
    flows.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.approvalFlows, flows);
  return createOperationResult(true, { data: payload });
}

export async function deleteApprovalFlow(flowId) {
  const queueDependencies = getStoredApprovalQueue().filter((item) => item.flowId === flowId && item.status === "pending");

  if (queueDependencies.length) {
    return createOperationResult(false, {
      error: "No se puede eliminar el flujo mientras existan solicitudes pendientes asociadas.",
      dependencies: { queue: queueDependencies, total: queueDependencies.length },
    });
  }

  const flows = getStoredApprovalFlows().filter((item) => item.id !== flowId);
  writeCollection(STORAGE_KEYS.approvalFlows, flows);
  return createOperationResult(true, { data: flows });
}

export async function updateApprovalRequestStatus(requestId, status) {
  const flows = getStoredApprovalFlows().map(normalizeApprovalFlow);
  const queue = getStoredApprovalQueue().map((item) => normalizeApprovalQueueItem(item, flows));
  const index = queue.findIndex((item) => item.id === requestId);
  if (index < 0) {
    return createOperationResult(false, { error: "No se encontro la solicitud de aprobacion." });
  }

  const current = queue[index];
  const history = [...current.history];
  const now = new Date().toISOString();
  const actor = current.currentLevel;

  if (status === "approved" && current.currentStep < current.totalLevels) {
    const nextStep = current.currentStep + 1;
    history.push({ level: current.currentStep, actor, decision: "approved", actedAt: now });
    queue[index] = {
      ...current,
      status: "pending",
      currentStep: nextStep,
      currentLevel: current.responsibleChain[nextStep - 1] || current.currentLevel,
      lastActor: actor,
      lastDecisionAt: now,
      history,
    };
  } else {
    history.push({ level: current.currentStep, actor, decision: status, actedAt: now });
    queue[index] = {
      ...current,
      status,
      resolvedAt: status === "approved" || status === "rejected" ? now : current.resolvedAt,
      sla: status === "approved" || status === "rejected" ? "Cerrado" : current.sla,
      lastActor: actor,
      lastDecisionAt: now,
      history,
    };
  }

  writeCollection(STORAGE_KEYS.approvalQueue, queue);
  return createOperationResult(true, { data: queue[index] });
}

export async function getAuditFeed() {
  return [...getStoredSettingsAudit(), ...auditFeed]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

export async function getHealthChecks() {
  const settings = await getSettings();
  return [...buildDynamicHealthChecks(settings), ...healthChecks];
}

export async function getSettings() {
  const companies = readCollection(STORAGE_KEYS.companies, emptyCollections.companies);
  return normalizeSettings(readCollection(STORAGE_KEYS.settings, defaultSettings), companies);
}

export async function saveSettings(settings) {
  const companies = readCollection(STORAGE_KEYS.companies, emptyCollections.companies);
  const previous = normalizeSettings(readCollection(STORAGE_KEYS.settings, defaultSettings), companies);
  const next = normalizeSettings({
    ...previous,
    ...settings,
    security: {
      ...previous.security,
      ...(settings.security || {}),
    },
    updatedAt: new Date().toISOString(),
    updatedBy: settings.updatedBy || "Platform Administrator",
  }, companies);
  writeCollection(STORAGE_KEYS.settings, next);
  const auditEntries = createSettingsAuditEntries(previous, next, next.updatedBy);
  if (auditEntries.length) {
    writeCollection(STORAGE_KEYS.settingsAudit, [...auditEntries, ...getStoredSettingsAudit()].slice(0, 30));
  }
  return next;
}

export async function getOrganizations() {
  if (hasSupabaseConfig) {
    try {
      return await fetchOrganizationsFromSupabase();
    } catch {
      return hydrateOrganizations(readRawOrganizations());
    }
  }

  return hydrateOrganizations(readRawOrganizations());
}

export async function saveOrganizationItem(type, item) {
  if (hasSupabaseConfig) {
    try {
      const data = await saveOrganizationItemInSupabase(type, item);
      return createOperationResult(true, { data });
    } catch (error) {
      return createOperationResult(false, { error: error.message || "No se pudo guardar el registro." });
    }
  }

  const storageKey = STORAGE_KEYS[type];
  if (!storageKey) {
    return null;
  }

  const items = readCollection(storageKey, []);
  const prefixMap = {
    companies: "COM",
    positions: "POS",
    levels: "LVL",
    departments: "DEP",
    locations: "LOC",
    entities: "ENT",
  };
  const payload = {
    status: "active",
    ...item,
    id: item.id || createId(prefixMap[type] || "ADM"),
  };

  if (type === "positions") {
    payload.internalCode = item.internalCode || item.code || "";
    payload.code = item.code || item.internalCode || "";
  }

  if (type === "levels") {
    payload.internalCode = item.internalCode || item.code || "";
    payload.code = item.code || item.internalCode || "";
    payload.hierarchyOrder = Number(item.hierarchyOrder) || 0;
    payload.salaryMin = Number(item.salaryMin) || 0;
    payload.salaryMax = Number(item.salaryMax) || 0;
  }

  if (type === "departments") {
    payload.internalCode = item.internalCode || item.code || "";
    payload.code = item.code || item.internalCode || "";
    payload.head = item.departmentHead || item.head || "";
    payload.departmentHead = item.departmentHead || item.head || "";
    payload.budget = Number(item.budget) || 0;
    payload.estimatedTeamSize = Number(item.estimatedTeamSize) || 0;
  }

  if (type === "entities") {
    payload.internalCode = item.internalCode || item.code || "";
    payload.code = item.code || item.internalCode || "";
    payload.values = sanitizeCatalogValues(item.values || []);
  }

  const index = items.findIndex((current) => current.id === payload.id);
  if (index >= 0) {
    items[index] = payload;
  } else {
    items.unshift(payload);
  }

  writeCollection(storageKey, items);
  return createOperationResult(true, { data: payload });
}

export async function deleteOrganizationItem(type, itemId) {
  if (hasSupabaseConfig) {
    try {
      await deleteOrganizationItemInSupabase(type, itemId);
      return createOperationResult(true, { data: true });
    } catch (error) {
      return createOperationResult(false, { error: error.message || "No se pudo eliminar el registro." });
    }
  }

  const storageKey = STORAGE_KEYS[type];
  if (!storageKey) {
    return createOperationResult(false, { error: "Tipo de catalogo no soportado." });
  }

  const dependencyMeta = buildOrganizationDependencies(type, itemId);
  if (dependencyMeta.total > 0) {
    return createOperationResult(false, {
      error: "No se puede eliminar este registro porque sigue siendo utilizado por otras estructuras administrativas.",
      dependencies: dependencyMeta,
    });
  }

  const items = readCollection(storageKey, []).filter((item) => item.id !== itemId);
  writeCollection(storageKey, items);
  return createOperationResult(true, { data: items });
}

export async function getAdministrationCore() {
  const [users, settings, organizations, roleData, dynamicAuditFeed, dynamicHealthChecks] = await Promise.all([
    getUsers(),
    getSettings(),
    getOrganizations(),
    getRoles(),
    getAuditFeed(),
    getHealthChecks(),
  ]);

  return {
    users,
    roles: roleData,
    approvalFlows: await getApprovalFlows(),
    approvalQueue: await getApprovalQueue(),
    settings,
    organizations,
    auditFeed: dynamicAuditFeed,
    healthChecks: dynamicHealthChecks,
  };
}

export async function loadAdministrationDevelopmentSeed() {
  if (!canUseStorage()) {
    return null;
  }

  const seedOrganizations = getSeedOrganizations();
  writeCollection(STORAGE_KEYS.companies, seedOrganizations.companies);
  writeCollection(STORAGE_KEYS.positions, seedOrganizations.positions);
  writeCollection(STORAGE_KEYS.levels, seedOrganizations.levels);
  writeCollection(STORAGE_KEYS.departments, seedOrganizations.departments);
  writeCollection(STORAGE_KEYS.locations, seedOrganizations.locations);
  writeCollection(STORAGE_KEYS.entities, seedOrganizations.entities);
  writeCollection(STORAGE_KEYS.users, getSeedUsers());
  writeCollection(STORAGE_KEYS.roles, seedRoles);
  writeCollection(STORAGE_KEYS.approvalFlows, seedApprovalFlows);
  writeCollection(STORAGE_KEYS.approvalQueue, seedApprovalQueue);
  writeCollection(STORAGE_KEYS.settings, normalizeSettings(defaultSettings, seedOrganizations.companies));
  writeCollection(STORAGE_KEYS.settingsAudit, []);
  window.localStorage.setItem(STORAGE_KEYS.demoSeed, "true");
  return getAdministrationCore();
}

export async function clearAdministrationDevelopmentSeed() {
  if (!canUseStorage()) {
    return null;
  }

  writeCollection(STORAGE_KEYS.users, []);
  writeCollection(STORAGE_KEYS.companies, []);
  writeCollection(STORAGE_KEYS.positions, []);
  writeCollection(STORAGE_KEYS.levels, []);
  writeCollection(STORAGE_KEYS.departments, []);
  writeCollection(STORAGE_KEYS.locations, []);
  writeCollection(STORAGE_KEYS.entities, []);
  writeCollection(STORAGE_KEYS.roles, []);
  writeCollection(STORAGE_KEYS.approvalFlows, []);
  writeCollection(STORAGE_KEYS.approvalQueue, []);
  writeCollection(STORAGE_KEYS.settings, normalizeSettings(defaultSettings, []));
  writeCollection(STORAGE_KEYS.settingsAudit, []);
  window.localStorage.removeItem(STORAGE_KEYS.demoSeed);
  return getAdministrationCore();
}

export function hasAdministrationDevelopmentSeed() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEYS.demoSeed) === "true";
}

const administrationService = {
  getAdministrationCore,
  getUsers,
  saveUser,
  deleteUser,
  getRoles,
  saveRole,
  updateRolePermission,
  deleteRole,
  getApprovalFlows,
  getApprovalQueue,
  saveApprovalFlow,
  deleteApprovalFlow,
  updateApprovalRequestStatus,
  getSettings,
  saveSettings,
  getOrganizations,
  saveOrganizationItem,
  deleteOrganizationItem,
  getAuditFeed,
  getHealthChecks,
  loadAdministrationDevelopmentSeed,
  clearAdministrationDevelopmentSeed,
  hasAdministrationDevelopmentSeed,
};

export default administrationService;
