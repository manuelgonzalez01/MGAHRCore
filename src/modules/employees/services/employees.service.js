import { getCandidates } from "../../recruitment/services/recruitment.service";
import administrationService from "../../administration/services/administration.service";
import { hasSupabaseConfig } from "../../../services/supabase/client";
import {
  approveEmployeeRequestInSupabase,
  createEmployeeRequestInSupabase,
  fetchEmployeeByIdFromSupabase,
  fetchEmployeeRequestsFromSupabase,
  fetchEmployeesFromSupabase,
  saveEmployeeInSupabase,
} from "../../../services/supabase/mgahrcore.repository";
import {
  invalidateCachedResource,
  invalidateCachedResourcesByPrefix,
  loadCachedResource,
} from "../../../utils/resourceCache";
import { getInitials } from "../utils/employee.helpers";
import compensationSchema from "../schemas/compensation.schema";
import contractSchema from "../schemas/contract.schema";
import { employeeLifecycleSchema } from "../schemas/employee.schema";

const EMPLOYEES_KEY = "mgahrcore.employees.records";
const REQUESTS_KEY = "mgahrcore.employees.requests";
const ACTIVE_EMPLOYEE_KEY = "mgahrcore.employees.activeEmployeeId";
const DEMO_EMAIL_DOMAIN = "@mgahrcore.demo";
const EMPLOYEES_CACHE_TTL_MS = 20_000;

function getCurrentLanguage() {
  if (!canUseStorage()) {
    return "es";
  }

  const directLanguage = window.localStorage.getItem("mgahrcore.language");
  if (directLanguage === "en" || directLanguage === "es") {
    return directLanguage;
  }

  try {
    const settingsRaw = window.localStorage.getItem("mgahrcore.administration.settings");
    if (!settingsRaw) {
      return "es";
    }

    const parsed = JSON.parse(settingsRaw);
    return parsed?.language === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

function getLocalizedWorkMode(employeeType = "hybrid", language = "es") {
  const maps = {
    es: {
      remote: "Remoto",
      onsite: "Presencial",
      hybrid: "Hibrido",
    },
    en: {
      remote: "Remote",
      onsite: "On site",
      hybrid: "Hybrid",
    },
  };

  return maps[language]?.[employeeType] || maps[language]?.hybrid || "Hibrido";
}

function getLocalizedEmployeeDefaults(language = "es") {
  if (language === "en") {
    return {
      performanceLabel: "Pending review",
      salaryBand: "Band pending",
      costCenter: "Cost center pending",
      businessUnit: "Business unit pending",
      shift: "Shift pending",
      schedule: "Schedule pending",
      summary:
        "Employee profile with core information loaded. Complete dossier, compensation, and lifecycle details to strengthen the HR workspace.",
      executiveInsight:
        "No executive insight available yet. Add milestones, context, and employee signals to enrich the readout.",
      nextMilestone: "Complete file and compensation review",
    };
  }

  return {
    performanceLabel: "Revision pendiente",
    salaryBand: "Banda pendiente",
    costCenter: "Centro de costo pendiente",
    businessUnit: "Unidad pendiente",
    shift: "Turno pendiente",
    schedule: "Horario pendiente",
    summary:
      "Perfil del colaborador con informacion central cargada. Completa expediente, compensacion y ciclo de vida para fortalecer la lectura de RRHH.",
    executiveInsight:
      "Aun no hay insight ejecutivo disponible. Agrega hitos, contexto y senales del colaborador para enriquecer la lectura.",
    nextMilestone: "Completar expediente y revision salarial",
  };
}

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

function writeCollection(key, items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(items));
}

function isDemoEmployeeRecord(record = {}) {
  return String(record.id || "").startsWith("EMP-DEMO")
    || String(record.email || "").toLowerCase().endsWith(DEMO_EMAIL_DOMAIN);
}

function isDemoRequestRecord(record = {}) {
  return String(record.id || "").startsWith("REQ-DEMO")
    || String(record.email || "").toLowerCase().endsWith(DEMO_EMAIL_DOMAIN)
    || String(record.name || "").toLowerCase() === "camila velasco";
}

function purgeDemoEmployeeData() {
  if (!canUseStorage()) {
    return;
  }

  const employeeRecords = readCollection(EMPLOYEES_KEY);
  const requestRecords = readCollection(REQUESTS_KEY);
  const cleanedEmployees = employeeRecords.filter((item) => !isDemoEmployeeRecord(item));
  const cleanedRequests = requestRecords.filter((item) => !isDemoRequestRecord(item));

  if (cleanedEmployees.length !== employeeRecords.length) {
    writeCollection(EMPLOYEES_KEY, cleanedEmployees);
  }

  if (cleanedRequests.length !== requestRecords.length) {
    writeCollection(REQUESTS_KEY, cleanedRequests);
  }
}

function readEmployeesSync() {
  purgeDemoEmployeeData();
  return readCollection(EMPLOYEES_KEY).map(normalizeEmployee);
}

function emptySalary() {
  return compensationSchema;
}

function emptyContract() {
  return contractSchema;
}

function normalizeEmployee(employee = {}) {
  const resolvedLanguage = employee.locale || getCurrentLanguage();
  const localizedDefaults = getLocalizedEmployeeDefaults(resolvedLanguage);
  const contract = {
    ...emptyContract(),
    ...(employee.contract || {}),
    contractType: employee.contract?.contractType || employee.contractType || contractSchema.contractType,
    employeeType: employee.contract?.employeeType || employee.employeeType || contractSchema.employeeType,
    workMode: employee.contract?.workMode || employee.workMode || getLocalizedWorkMode(employee.employeeType, resolvedLanguage),
    startDate: employee.contract?.startDate || employee.startDate || "",
    probationEndDate: employee.contract?.probationEndDate || "",
    seniorityDate: employee.contract?.seniorityDate || employee.startDate || "",
    legalEntity: employee.contract?.legalEntity || employee.company || "MGAHRCore",
    payrollGroup: employee.contract?.payrollGroup || employee.payrollGroup || "",
    laborRegime: employee.contract?.laborRegime || "",
  };

  return {
    id: employee.id || `EMP-${Date.now()}`,
    name: employee.name || "",
    initials: employee.initials || getInitials(employee.name),
    positionId: employee.positionId || "",
    position: employee.position || "",
    department: employee.department || "",
    levelId: employee.levelId || "",
    levelName: employee.levelName || "",
    manager: employee.manager || "",
    reportsToPositionId: employee.reportsToPositionId || "",
    location: employee.location || "",
    contractType: contract.contractType,
    employeeType: contract.employeeType,
    status: employee.status || "active",
    email: employee.email || "",
    phone: employee.phone || "",
    companyId: employee.companyId || "",
    company: employee.company || "MGAHRCore",
    locale: resolvedLanguage,
    workMode: contract.workMode,
    startDate: contract.startDate,
    profileCompletion: Number(employee.profileCompletion) || 35,
    dossierReadiness: Number(employee.dossierReadiness) || 0,
    engagementScore: Number(employee.engagementScore) || 0,
    performanceLabel: employee.performanceLabel || localizedDefaults.performanceLabel,
    salaryBand: employee.salaryBand || localizedDefaults.salaryBand,
    costCenter: employee.costCenter || localizedDefaults.costCenter,
    businessUnit: employee.businessUnit || localizedDefaults.businessUnit,
    shift: employee.shift || localizedDefaults.shift,
    schedule: employee.schedule || localizedDefaults.schedule,
    legalEntity: employee.legalEntity || contract.legalEntity,
    payrollGroup: employee.payrollGroup || contract.payrollGroup,
    reportsToPositionName: employee.reportsToPositionName || "",
    summary: employee.summary || localizedDefaults.summary,
    executiveInsight: employee.executiveInsight || localizedDefaults.executiveInsight,
    nextMilestone: employee.nextMilestone || localizedDefaults.nextMilestone,
    recruitmentSource: employee.recruitmentSource || { origin: "Manual" },
    documents: employee.documents || [],
    dependents: employee.dependents || [],
    assignments: employee.assignments || [],
    studies: employee.studies || [],
    experience: employee.experience || [],
    permissions: employee.permissions || [],
    leaves: employee.leaves || [],
    salary: {
      ...emptySalary(),
      ...(employee.salary || {}),
      salaryHistory: employee.salary?.salaryHistory || [],
      benefits: employee.salary?.benefits || [],
    },
    contract,
    history: employee.history || employeeLifecycleSchema.history,
    actions: employee.actions || employeeLifecycleSchema.actions,
    onboarding: {
      ...employeeLifecycleSchema.onboarding,
      ...(employee.onboarding || {}),
    },
  };
}

function normalizeRequest(request = {}) {
  return {
    id: request.id || `REQ-${Date.now()}`,
    name: request.name || "",
    companyId: request.companyId || "",
    companyName: request.companyName || request.company || "",
    positionId: request.positionId || "",
    position: request.position || "",
    departmentId: request.departmentId || "",
    department: request.department || "",
    levelId: request.levelId || "",
    levelName: request.levelName || "",
    manager: request.manager || "",
    reportsToPositionId: request.reportsToPositionId || "",
    locationId: request.locationId || "",
    location: request.location || "",
    contractType: request.contractType || "Indefinido",
    employeeType: request.employeeType || "hybrid",
    email: request.email || "",
    startDate: request.startDate || "",
    requestedBy: request.requestedBy || "HR Operations",
    submittedAt: request.submittedAt || new Date().toISOString().slice(0, 10),
    approvalStatus: request.approvalStatus || "pending",
    approvalFlowId: request.approvalFlowId || "",
    approvalFlowName: request.approvalFlowName || "",
    requestedLanguage: request.requestedLanguage || "es",
    recruitmentSource: request.recruitmentSource || { origin: "Manual" },
  };
}

async function getConfigurationSnapshot() {
  const [organizations, settings, flows] = await Promise.all([
    administrationService.getOrganizations(),
    administrationService.getSettings(),
    administrationService.getApprovalFlows(),
  ]);

  return { organizations, settings, flows };
}

function resolvePositionContext(payload = {}, organizations) {
  const selectedPosition = organizations.positions.find((item) => item.id === payload.positionId)
    || organizations.positions.find((item) => item.name === payload.position);
  const selectedDepartment = organizations.departments.find((item) => item.id === payload.departmentId)
    || organizations.departments.find((item) => item.name === payload.department)
    || organizations.departments.find((item) => item.id === selectedPosition?.departmentId);
  const selectedLocation = organizations.locations.find((item) => item.id === payload.locationId)
    || organizations.locations.find((item) => item.name === payload.location)
    || organizations.locations.find((item) => item.id === selectedPosition?.locationId)
    || organizations.locations.find((item) => item.id === selectedDepartment?.locationId);
  const selectedCompany = organizations.companies.find((item) => item.id === payload.companyId)
    || organizations.companies.find((item) => item.id === selectedPosition?.companyId)
    || organizations.companies.find((item) => item.id === selectedDepartment?.companyId);

  return {
    companyId: selectedCompany?.id || payload.companyId || "",
    companyName: selectedCompany?.name || payload.companyName || payload.company || "MGAHRCore",
    positionId: selectedPosition?.id || payload.positionId || "",
    position: selectedPosition?.name || payload.position || "",
    departmentId: selectedDepartment?.id || payload.departmentId || "",
    department: selectedDepartment?.name || payload.department || "",
    levelId: selectedPosition?.levelId || payload.levelId || "",
    levelName: selectedPosition?.levelName || payload.levelName || "",
    manager: payload.manager || selectedDepartment?.departmentHead || "",
    reportsToPositionId: selectedPosition?.reportsToPositionId || payload.reportsToPositionId || "",
    locationId: selectedLocation?.id || payload.locationId || "",
    location: selectedLocation?.name || payload.location || "",
    contractType: payload.contractType || selectedPosition?.hiringType || "Indefinido",
  };
}

export async function getRecruitmentBridge() {
  const candidates = await getCandidates();

  return candidates.map((candidate, index) => ({
    id: candidate.id || `CAN-${index}`,
    name: candidate.name || "Candidato",
    positionId: candidate.positionId || "",
    position: candidate.position || candidate.vacancy || "",
    department: candidate.department || "",
    levelId: candidate.levelId || "",
    levelName: candidate.levelName || "",
    location: candidate.location || "",
    source: candidate.source || "Recruitment",
    stage: candidate.stage || candidate.status || "screening",
    score: Number(candidate.score) || 0,
  }));
}

export async function getEmployees() {
  return loadCachedResource(
    "employees:list",
    async () => {
      if (hasSupabaseConfig) {
        try {
          return await fetchEmployeesFromSupabase();
        } catch {
          return readEmployeesSync();
        }
      }

      return readEmployeesSync();
    },
    EMPLOYEES_CACHE_TTL_MS,
  );
}

export async function getEmployeeById(id) {
  if (hasSupabaseConfig) {
    try {
      return await fetchEmployeeByIdFromSupabase(id);
    } catch {
      const items = await getEmployees();
      return items.find((item) => item.id === id) || null;
    }
  }

  const items = await getEmployees();
  return items.find((item) => item.id === id) || null;
}

export async function saveEmployee(employee) {
  if (hasSupabaseConfig) {
    try {
      const saved = await saveEmployeeInSupabase(employee);
      setActiveEmployeeId(saved.id);
      invalidateCachedResourcesByPrefix("employees:");
      return saved;
    } catch {
      // Falls back to local persistence during partial migration or unavailable tables.
    }
  }

  const items = readCollection(EMPLOYEES_KEY);
  const { organizations } = await getConfigurationSnapshot();
  const normalized = normalizeEmployee({
    ...employee,
    ...resolvePositionContext(employee, organizations),
  });
  const index = items.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    items[index] = normalized;
  } else {
    items.unshift(normalized);
  }

  writeCollection(EMPLOYEES_KEY, items);
  setActiveEmployeeId(normalized.id);
  invalidateCachedResourcesByPrefix("employees:");
  return normalized;
}

export async function getEmployeeRequests() {
  return loadCachedResource(
    "employees:requests",
    async () => {
      if (hasSupabaseConfig) {
        try {
          return await fetchEmployeeRequestsFromSupabase();
        } catch {
          return readCollection(REQUESTS_KEY).map(normalizeRequest);
        }
      }

      purgeDemoEmployeeData();
      return readCollection(REQUESTS_KEY).map(normalizeRequest);
    },
    EMPLOYEES_CACHE_TTL_MS,
  );
}

export async function createEmployeeRequest(request) {
  if (hasSupabaseConfig) {
    try {
      return await createEmployeeRequestInSupabase(request);
    } catch {
      // Falls back to local persistence during partial migration or unavailable tables.
    }
  }

  const items = readCollection(REQUESTS_KEY);
  const { organizations, settings, flows } = await getConfigurationSnapshot();
  const primaryEmployeesFlow = flows.find((flow) => flow.module === "Employees" && flow.status === "active");
  const normalized = normalizeRequest({
    ...request,
    ...resolvePositionContext(request, organizations),
    requestedLanguage: settings.language,
    approvalFlowId: request.approvalFlowId || primaryEmployeesFlow?.id || "",
    approvalFlowName: request.approvalFlowName || primaryEmployeesFlow?.name || "",
  });
  items.unshift(normalized);
  writeCollection(REQUESTS_KEY, items);
  invalidateCachedResource("employees:requests");
  invalidateCachedResource("employees:dashboard");
  return normalized;
}

export async function approveEmployeeRequest(requestId) {
  if (hasSupabaseConfig) {
    try {
      const employee = await approveEmployeeRequestInSupabase(requestId);
      setActiveEmployeeId(employee.id);
      invalidateCachedResourcesByPrefix("employees:");
      return employee;
    } catch {
      // Falls back to local persistence during partial migration or unavailable tables.
    }
  }

  const requests = readCollection(REQUESTS_KEY);
  const index = requests.findIndex((item) => item.id === requestId);

  if (index < 0) {
    return null;
  }

  const { organizations, settings } = await getConfigurationSnapshot();
  const request = normalizeRequest({
    ...requests[index],
    ...resolvePositionContext(requests[index], organizations),
  });
  const employee = await saveEmployee({
    ...request,
    workMode: getLocalizedWorkMode(request.employeeType, settings.language),
    company: request.companyName,
    companyId: request.companyId,
    locale: settings.language,
    recruitmentSource: request.recruitmentSource,
  });

  requests[index] = {
    ...request,
    approvalStatus: "approved",
    employeeId: employee.id,
  };
  writeCollection(REQUESTS_KEY, requests);
  setActiveEmployeeId(employee.id);
  invalidateCachedResourcesByPrefix("employees:");
  return employee;
}

export async function getEmployeesDashboard() {
  return loadCachedResource(
    "employees:dashboard",
    async () => {
      const [employeesResult, requestsResult, recruitmentBridgeResult] = await Promise.allSettled([
        getEmployees(),
        getEmployeeRequests(),
        getRecruitmentBridge(),
      ]);
      const employees = employeesResult.status === "fulfilled" ? employeesResult.value : [];
      const requests = requestsResult.status === "fulfilled" ? requestsResult.value : [];
      const recruitmentBridge = recruitmentBridgeResult.status === "fulfilled" ? recruitmentBridgeResult.value : [];
      const language = getCurrentLanguage();
      const isEnglish = language === "en";
      const activeEmployees = employees.filter((item) => item.status === "active");
      const onLeaveEmployees = employees.filter((item) => item.status === "leave");
      const recentHires = employees.filter((item) => {
        if (!item.startDate) {
          return false;
        }

        const startDate = new Date(item.startDate).getTime();
        return Number.isFinite(startDate) && Date.now() - startDate <= 1000 * 60 * 60 * 24 * 90;
      });
      const pendingDocuments = employees.reduce(
        (acc, item) => acc + item.documents.filter((doc) => doc.status !== "approved").length,
        0,
      );
      const averageProfileCompletion = employees.length
        ? Math.round(
            employees.reduce((acc, item) => acc + (Number(item.profileCompletion) || 0), 0) / employees.length,
          )
        : 0;

      return {
        employees,
        requests,
        recruitmentBridge,
        insights: {
          activeEmployees: activeEmployees.length,
          onLeaveEmployees: onLeaveEmployees.length,
          recentHires: recentHires.length,
          pendingDocuments,
          averageProfileCompletion,
          activeRecruitmentBridge: recruitmentBridge.filter((item) => item.stage !== "offer").length,
        },
        stats: [
          {
            key: "headcount",
            label: "Headcount",
            value: employees.length,
            trend: isEnglish ? `${activeEmployees.length} active in structure` : `${activeEmployees.length} activos en estructura`,
          },
          {
            key: "approvals",
            label: isEnglish ? "Pending hires" : "Altas por aprobar",
            value: requests.filter((item) => item.approvalStatus === "pending").length,
            trend: isEnglish ? "active approval flow" : "flujo de autorizacion vigente",
          },
          {
            key: "documents",
            label: isEnglish ? "Pending docs" : "Docs pendientes",
            value: pendingDocuments,
            trend: isEnglish ? `${averageProfileCompletion}% average completion` : `${averageProfileCompletion}% promedio de completitud`,
          },
          {
            key: "recruitment",
            label: isEnglish ? "Recruitment bridge" : "Puente Recruitment",
            value: recruitmentBridge.length,
            trend: isEnglish ? `${recentHires.length} recent hires` : `${recentHires.length} ingresos recientes`,
          },
        ],
      };
    },
    EMPLOYEES_CACHE_TTL_MS,
  );
}

export async function loadEmployeesDevelopmentSeed() {
  return getEmployeesDashboard();
}

export async function clearEmployeesDevelopmentSeed() {
  if (!canUseStorage()) {
    return null;
  }

  writeCollection(EMPLOYEES_KEY, []);
  writeCollection(REQUESTS_KEY, []);
  window.localStorage.removeItem(ACTIVE_EMPLOYEE_KEY);
  invalidateCachedResourcesByPrefix("employees:");
  return getEmployeesDashboard();
}

export function hasEmployeesDevelopmentSeed() {
  return false;
}

export function setActiveEmployeeId(employeeId) {
  if (!canUseStorage() || !employeeId) {
    return;
  }

  window.localStorage.setItem(ACTIVE_EMPLOYEE_KEY, employeeId);
}

export function getActiveEmployeeId() {
  if (!canUseStorage()) {
    return "";
  }

  return window.localStorage.getItem(ACTIVE_EMPLOYEE_KEY) || "";
}

export function getEmployeesNavigationId() {
  const activeEmployeeId = getActiveEmployeeId();

  if (activeEmployeeId) {
    return activeEmployeeId;
  }

  const firstEmployee = readEmployeesSync()[0];
  return firstEmployee?.id || "";
}

const employeesService = {
  getEmployees,
  getEmployeeById,
  saveEmployee,
  getEmployeeRequests,
  createEmployeeRequest,
  approveEmployeeRequest,
  getEmployeesDashboard,
  getRecruitmentBridge,
  loadEmployeesDevelopmentSeed,
  clearEmployeesDevelopmentSeed,
  hasEmployeesDevelopmentSeed,
  setActiveEmployeeId,
  getActiveEmployeeId,
  getEmployeesNavigationId,
};

export default employeesService;
