import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import {
  createVacationRequest,
  getVacationSubsystem,
  simulateVacationImpact,
  transitionVacationRequest,
} from "../../vacations/services/vacations.domain";
import { createSelfServiceId, sortByDateDesc, sumBy } from "../utils/selfService.helpers";

const STORAGE_KEYS = {
  profileChanges: "mgahrcore.selfService.profileChanges",
};

const PERMISSION_TRANSITIONS = {
  draft: ["submitted", "cancelled"],
  submitted: ["pending_manager_review", "cancelled", "returned_for_changes"],
  pending_manager_review: ["pending_hr_review", "approved", "rejected", "returned_for_changes", "cancelled"],
  pending_hr_review: ["approved", "rejected", "returned_for_changes", "cancelled"],
  returned_for_changes: ["submitted", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key) {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection(key, items) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(items));
  }
}

function getLanguage(settings) {
  return settings?.language === "en" ? "en" : "es";
}

function getActor() {
  if (!canUseStorage()) return "MGAHRCore Super Admin";
  try {
    const raw = window.localStorage.getItem("mgahrcore.auth.session");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed?.user?.displayName || parsed?.user?.name || "MGAHRCore Super Admin";
  } catch {
    return "MGAHRCore Super Admin";
  }
}

function t(language, es, en) {
  return language === "en" ? en : es;
}

function createAuditEvent(language, { actor, action, fromStatus, toStatus, note = "" }) {
  return {
    id: createSelfServiceId("SSA"),
    actor,
    action,
    fromStatus,
    toStatus,
    note,
    occurredAt: new Date().toISOString(),
    label: t(language, "Movimiento de autoservicio", "Self-service movement"),
  };
}

function getPermissionFlow(flows = []) {
  return flows.find((item) => item.module === "Employees" && item.requestType === "Permisos cortos")
    || flows.find((item) => item.module === "Employees")
    || {
      id: "FLOW-002",
      name: "Permisos y salidas",
      responsibleChain: ["Manager", "HR Operations"],
      levels: 2,
    };
}

function getProfileFlow(flows = []) {
  return flows.find((item) => item.module === "Employees" && item.requestType === "Alta o cambio critico")
    || flows.find((item) => item.module === "Employees")
    || {
      id: "FLOW-003",
      name: "Altas y cambios sensibles",
      responsibleChain: ["Business Manager", "HR Director", "Platform Administrator"],
      levels: 3,
    };
}

function resolveCurrentEmployee(employees = []) {
  const activeEmployeeId = employeesService.getActiveEmployeeId();
  return employees.find((item) => item.id === activeEmployeeId)
    || employees.find((item) => item.status === "active")
    || employees[0]
    || null;
}

function createEmployeeOptions(employees = [], language = "es") {
  return [
    { value: "", label: t(language, "Selecciona", "Select") },
    ...employees.map((employee) => ({
      value: employee.id,
      label: `${employee.name} | ${employee.position || t(language, "Sin posicion", "No position")}`,
    })),
  ];
}

function normalizePermissionRequest(raw = {}, employee, flow, language) {
  const status = raw.workflowStatus || raw.status || "submitted";
  const responsibleChain = Array.isArray(raw.responsibleChain) && raw.responsibleChain.length
    ? raw.responsibleChain
    : flow.responsibleChain || ["Manager", "HR Operations"];
  const totalLevels = raw.totalLevels || responsibleChain.length || 2;
  const currentLevel = raw.currentLevel || (status === "pending_hr_review" ? 2 : 1);
  const currentApprover = raw.currentApprover
    || (status === "pending_hr_review" ? responsibleChain[1] : responsibleChain[0])
    || employee.manager
    || "HR Operations";

  return {
    id: raw.id || createSelfServiceId("PER"),
    requestType: "permission",
    type: raw.type || t(language, "Permiso personal", "Personal permission"),
    title: raw.title || raw.type || t(language, "Permiso personal", "Personal permission"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId || "",
    companyName: employee.company || "",
    department: employee.department || "",
    position: employee.position || "",
    startDate: raw.startDate || "",
    endDate: raw.endDate || raw.startDate || "",
    effectiveDate: raw.effectiveDate || raw.startDate || "",
    reason: raw.reason || "",
    approver: raw.approver || employee.manager || "",
    attachments: raw.attachments || [],
    notes: raw.notes || "",
    status,
    workflowStatus: status,
    currentApprover,
    currentLevel,
    totalLevels,
    approvalFlowId: raw.approvalFlowId || flow.id,
    approvalFlowName: raw.approvalFlowName || flow.name,
    responsibleChain,
    requestedAt: raw.requestedAt || raw.createdAt || new Date().toISOString(),
    createdAt: raw.createdAt || raw.requestedAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.requestedAt || new Date().toISOString(),
    auditTrail: Array.isArray(raw.auditTrail) && raw.auditTrail.length
      ? raw.auditTrail
      : [createAuditEvent(language, { actor: employee.name, action: "request_created", fromStatus: "draft", toStatus: status, note: raw.reason || "" })],
    source: raw.source || "self_service",
  };
}

function normalizeProfileChangeRequest(raw = {}, employee, flow, language) {
  return {
    id: raw.id || createSelfServiceId("PRF"),
    requestType: "profile_change",
    title: raw.title || t(language, "Actualizacion de datos personales", "Personal data update"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId || "",
    companyName: employee.company || "",
    department: employee.department || "",
    position: employee.position || "",
    field: raw.field || "phone",
    beforeValue: raw.beforeValue || "",
    afterValue: raw.afterValue || "",
    status: raw.status || "submitted",
    workflowStatus: raw.workflowStatus || raw.status || "submitted",
    currentApprover: raw.currentApprover || flow.responsibleChain?.[0] || "HR Director",
    currentLevel: raw.currentLevel || 1,
    totalLevels: raw.totalLevels || flow.levels || flow.responsibleChain?.length || 2,
    requestedAt: raw.requestedAt || raw.createdAt || new Date().toISOString(),
    createdAt: raw.createdAt || raw.requestedAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.requestedAt || new Date().toISOString(),
    notes: raw.notes || "",
    auditTrail: Array.isArray(raw.auditTrail) && raw.auditTrail.length
      ? raw.auditTrail
      : [createAuditEvent(language, { actor: employee.name, action: "profile_change_created", fromStatus: "draft", toStatus: raw.status || "submitted", note: raw.notes || "" })],
    source: "self_service",
  };
}

function normalizeVacationRequest(request = {}, language = "es") {
  return {
    id: request.id,
    requestType: "vacation",
    title: t(language, "Solicitud de vacaciones", "Vacation request"),
    employeeId: request.employeeId,
    employeeName: request.employeeName,
    companyId: request.companyId || "",
    companyName: request.company || request.companyName || "",
    department: request.department || "",
    position: request.position || "",
    startDate: request.startDate,
    endDate: request.endDate,
    effectiveDate: request.startDate,
    days: request.balanceImpactDays || request.chargeableDays || 0,
    reason: request.note || "",
    status: request.status,
    workflowStatus: request.status,
    currentApprover: request.currentApprover || "",
    currentLevel: request.currentLevel || 0,
    totalLevels: request.totalLevels || 0,
    requestedAt: request.requestedAt || request.createdAt || new Date().toISOString(),
    createdAt: request.requestedAt || request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || request.requestedAt || new Date().toISOString(),
    impactPreview: request.impactPreview || null,
    exceptions: request.exceptions || [],
    auditTrail: request.auditTrail || [],
    source: "vacations",
  };
}

function buildApprovalsVisible(permissions = [], profileChanges = [], vacationRequests = [], administrationQueue = [], employee) {
  const requestApprovals = [...permissions, ...profileChanges, ...vacationRequests]
    .filter((item) => ["submitted", "pending_manager_review", "pending_hr_review", "under_review", "pending_manager_approval", "pending_final_approval"].includes(item.workflowStatus || item.status))
    .map((item) => ({
      id: item.id,
      module: item.requestType === "vacation" ? "Vacations" : "Self-Service",
      type: item.title || item.type,
      requester: item.employeeName,
      currentLevel: item.currentApprover || "",
      status: item.workflowStatus || item.status,
      source: item.requestType,
    }));

  const visibleAdministration = (administrationQueue || []).filter((item) => item.requester === employee?.name);
  return [...requestApprovals, ...visibleAdministration];
}

function buildRequestSummary(requests = [], approvals = [], vacationBalance = 0) {
  const pendingRequests = requests.filter((item) => !["approved", "rejected", "cancelled", "consumed"].includes(item.status)).length;
  const approvedRequests = requests.filter((item) => ["approved", "scheduled", "consumed"].includes(item.status)).length;

  return {
    pendingRequests,
    approvedRequests,
    visibleApprovals: approvals.length,
    vacationBalance,
  };
}

function buildByType(requests = [], language = "es") {
  const catalog = new Map();
  requests.forEach((item) => {
    const key = item.requestType;
    catalog.set(key, (catalog.get(key) || 0) + 1);
  });

  const labels = {
    vacation: t(language, "Vacaciones", "Vacations"),
    permission: t(language, "Permisos", "Permissions"),
    profile_change: t(language, "Cambios de perfil", "Profile changes"),
  };

  return [...catalog.entries()].map(([key, value]) => ({
    label: labels[key] || key,
    value,
  }));
}

async function savePermissionToEmployee(permissionRecord) {
  const employee = await employeesService.getEmployeeById(permissionRecord.employeeId);
  if (!employee) {
    throw new Error("Employee not found for permission request.");
  }

  const permissions = [...(employee.permissions || [])];
  const index = permissions.findIndex((item) => item.id === permissionRecord.id);
  if (index >= 0) {
    permissions[index] = permissionRecord;
  } else {
    permissions.unshift(permissionRecord);
  }

  await employeesService.saveEmployee({
    ...employee,
    permissions,
  });
}

async function getPermissionRequestById(requestId) {
  const employees = await employeesService.getEmployees();
  for (const employee of employees) {
    const record = (employee.permissions || []).find((item) => item.id === requestId);
    if (record) {
      return { employee, record };
    }
  }
  return { employee: null, record: null };
}

function assertTransition(currentStatus, nextStatus, language) {
  if (!(PERMISSION_TRANSITIONS[currentStatus] || []).includes(nextStatus)) {
    throw new Error(t(language, `La transicion ${currentStatus} -> ${nextStatus} no es valida.`, `Transition ${currentStatus} -> ${nextStatus} is invalid.`));
  }
}

export async function getSelfServiceDomain() {
  const [
    employeesDashboardResult,
    administrationCoreResult,
    vacationsSubsystemResult,
    profileChangeRecordsResult,
  ] = await Promise.allSettled([
    employeesService.getEmployeesDashboard(),
    administrationService.getAdministrationCore(),
    getVacationSubsystem(),
    Promise.resolve(readCollection(STORAGE_KEYS.profileChanges)),
  ]);

  const employeesDashboard = employeesDashboardResult.status === "fulfilled"
    ? employeesDashboardResult.value
    : { employees: [], requests: [], stats: [], insights: {} };
  const administrationCore = administrationCoreResult.status === "fulfilled"
    ? administrationCoreResult.value
    : { settings: { language: "es" }, approvalFlows: [], approvalQueue: [] };
  const vacationsSubsystem = vacationsSubsystemResult.status === "fulfilled"
    ? vacationsSubsystemResult.value
    : { requests: [], balances: [], plans: [] };
  const profileChangeRecords = profileChangeRecordsResult.status === "fulfilled"
    ? profileChangeRecordsResult.value
    : [];

  const language = getLanguage(administrationCore.settings);
  const employees = employeesDashboard.employees || [];
  const employee = resolveCurrentEmployee(employees);
  const permissionFlow = getPermissionFlow(administrationCore.approvalFlows);
  const profileFlow = getProfileFlow(administrationCore.approvalFlows);

  const permissions = employee
    ? sortByDateDesc((employee.permissions || []).map((item) => normalizePermissionRequest(item, employee, permissionFlow, language)), "createdAt")
    : [];

  const profileChanges = employee
    ? sortByDateDesc(profileChangeRecords.filter((item) => item.employeeId === employee.id).map((item) => normalizeProfileChangeRequest(item, employee, profileFlow, language)), "createdAt")
    : [];

  const vacationRequests = employee
    ? sortByDateDesc((vacationsSubsystem.requests || []).filter((item) => item.employeeId === employee.id).map((item) => normalizeVacationRequest(item, language)), "createdAt")
    : [];

  const requests = sortByDateDesc([...permissions, ...profileChanges, ...vacationRequests], "createdAt");
  const vacationBalance = vacationsSubsystem.balances.find((item) => item.employeeId === employee?.id)?.available || 0;
  const approvals = buildApprovalsVisible(permissions, profileChanges, vacationRequests, administrationCore.approvalQueue, employee);

  return {
    language,
    employee,
    employees,
    options: {
      employees: createEmployeeOptions(employees, language),
      statuses: [
        { value: "", label: t(language, "Todos", "All") },
        { value: "submitted", label: t(language, "Enviado", "Submitted") },
        { value: "pending_manager_review", label: t(language, "Revision manager", "Manager review") },
        { value: "pending_hr_review", label: t(language, "Revision HR", "HR review") },
        { value: "approved", label: t(language, "Aprobado", "Approved") },
        { value: "rejected", label: t(language, "Rechazado", "Rejected") },
        { value: "returned_for_changes", label: t(language, "Devuelto", "Returned") },
        { value: "cancelled", label: t(language, "Cancelado", "Cancelled") },
      ],
      requestTypes: [
        { value: "", label: t(language, "Todos", "All") },
        { value: "vacation", label: t(language, "Vacaciones", "Vacations") },
        { value: "permission", label: t(language, "Permisos", "Permissions") },
        { value: "profile_change", label: t(language, "Cambios de perfil", "Profile changes") },
      ],
    },
    requests,
    permissions,
    profileChanges,
    vacationRequests,
    approvals,
    balances: vacationsSubsystem.balances.filter((item) => item.employeeId === employee?.id),
    plans: vacationsSubsystem.plans.filter((item) => item.employeeId === employee?.id),
    stats: {
      pendingRequests: requests.filter((item) => !["approved", "rejected", "cancelled", "consumed"].includes(item.status)).length,
      approvedRequests: requests.filter((item) => ["approved", "scheduled", "consumed"].includes(item.status)).length,
      vacationBalance,
      approvalsVisible: approvals.length,
      upcomingDays: sumBy(vacationRequests.filter((item) => ["approved", "scheduled"].includes(item.status)), (item) => item.days),
      permissionRequests: permissions.length,
    },
    summary: buildRequestSummary(requests, approvals, vacationBalance),
    byType: buildByType(requests, language),
    quickActions: [
      { key: "vacation", path: "/self-service/vacation-requests", label: t(language, "Solicitar vacaciones", "Request vacation") },
      { key: "permission", path: "/self-service/permission-requests", label: t(language, "Registrar permiso", "Register permission") },
      { key: "approvals", path: "/self-service/approvals", label: t(language, "Ver aprobaciones", "View approvals") },
    ],
  };
}

export async function setSelfServiceEmployeeContext(employeeId) {
  employeesService.setActiveEmployeeId(employeeId);
  return getSelfServiceDomain();
}

export async function createPermissionRequest(payload) {
  const domain = await getSelfServiceDomain();
  const employee = domain.employees.find((item) => item.id === payload.employeeId) || domain.employee;
  if (!employee) {
    throw new Error(t(domain.language, "Debes seleccionar un colaborador valido.", "A valid employee is required."));
  }

  const flow = getPermissionFlow((await administrationService.getApprovalFlows()) || []);
  const record = normalizePermissionRequest({
    ...payload,
    status: "submitted",
    workflowStatus: "submitted",
    currentApprover: employee.manager || flow.responsibleChain?.[0] || "Manager",
    currentLevel: 1,
    totalLevels: flow.levels || flow.responsibleChain?.length || 2,
    requestedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditTrail: [
      createAuditEvent(domain.language, {
        actor: employee.name,
        action: "permission_requested",
        fromStatus: "draft",
        toStatus: "submitted",
        note: payload.reason || "",
      }),
    ],
  }, employee, flow, domain.language);

  await savePermissionToEmployee(record);
  return record;
}

export async function transitionPermissionRequest(requestId, action, payload = {}) {
  const [domain, lookup] = await Promise.all([getSelfServiceDomain(), getPermissionRequestById(requestId)]);
  const employee = lookup.employee;
  const current = lookup.record;

  if (!employee || !current) {
    throw new Error(t(domain.language, "No se encontro la solicitud de permiso.", "Permission request not found."));
  }

  const actor = payload.actor || getActor();
  const flow = getPermissionFlow((await administrationService.getApprovalFlows()) || []);
  const normalized = normalizePermissionRequest(current, employee, flow, domain.language);
  let nextStatus = normalized.status;
  let currentApprover = normalized.currentApprover;
  let currentLevel = normalized.currentLevel;

  switch (action) {
    case "queue_manager":
      assertTransition(normalized.status, "pending_manager_review", domain.language);
      nextStatus = "pending_manager_review";
      currentApprover = employee.manager || flow.responsibleChain?.[0] || "Manager";
      currentLevel = 1;
      break;
    case "approve_manager":
      assertTransition(normalized.status, "pending_hr_review", domain.language);
      nextStatus = "pending_hr_review";
      currentApprover = flow.responsibleChain?.[1] || "HR Operations";
      currentLevel = 2;
      break;
    case "approve_hr":
      assertTransition(normalized.status, "approved", domain.language);
      nextStatus = "approved";
      currentApprover = t(domain.language, "Cerrado", "Closed");
      currentLevel = normalized.totalLevels;
      break;
    case "reject":
      assertTransition(normalized.status, "rejected", domain.language);
      nextStatus = "rejected";
      currentApprover = t(domain.language, "Cerrado", "Closed");
      break;
    case "return":
      assertTransition(normalized.status, "returned_for_changes", domain.language);
      nextStatus = "returned_for_changes";
      currentApprover = employee.name;
      currentLevel = 0;
      break;
    case "cancel":
      assertTransition(normalized.status, "cancelled", domain.language);
      nextStatus = "cancelled";
      currentApprover = t(domain.language, "Cerrado", "Closed");
      currentLevel = 0;
      break;
    case "resubmit":
      assertTransition(normalized.status, "submitted", domain.language);
      nextStatus = "submitted";
      currentApprover = employee.manager || flow.responsibleChain?.[0] || "Manager";
      currentLevel = 1;
      break;
    default:
      throw new Error(t(domain.language, "Accion no soportada para permisos.", "Unsupported permission action."));
  }

  const nextRecord = {
    ...normalized,
    status: nextStatus,
    workflowStatus: nextStatus,
    currentApprover,
    currentLevel,
    updatedAt: new Date().toISOString(),
    auditTrail: [
      ...(normalized.auditTrail || []),
      createAuditEvent(domain.language, {
        actor,
        action,
        fromStatus: normalized.status,
        toStatus: nextStatus,
        note: payload.note || "",
      }),
    ],
  };

  await savePermissionToEmployee(nextRecord);
  return nextRecord;
}

export async function createProfileChangeRequest(payload) {
  const domain = await getSelfServiceDomain();
  const employee = domain.employees.find((item) => item.id === payload.employeeId) || domain.employee;
  if (!employee) {
    throw new Error(t(domain.language, "Debes seleccionar un colaborador valido.", "A valid employee is required."));
  }

  const flow = getProfileFlow((await administrationService.getApprovalFlows()) || []);
  const items = readCollection(STORAGE_KEYS.profileChanges);
  const record = normalizeProfileChangeRequest({
    ...payload,
    status: "submitted",
    workflowStatus: "submitted",
    currentApprover: flow.responsibleChain?.[0] || "HR Director",
    currentLevel: 1,
    totalLevels: flow.levels || flow.responsibleChain?.length || 2,
    requestedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, employee, flow, domain.language);

  items.unshift(record);
  writeCollection(STORAGE_KEYS.profileChanges, items);
  return record;
}

export async function createVacationSelfServiceRequest(payload) {
  const created = await createVacationRequest({
    ...payload,
    status: "draft",
    requestMode: "self_service",
  });

  await transitionVacationRequest(created.id, "submit", { actor: payload.requestedBy || payload.employeeName || "Self-Service" });
  await transitionVacationRequest(created.id, "route_to_review", { actor: "Self-Service Portal" });
  return transitionVacationRequest(created.id, "manager_queue", { actor: "Self-Service Portal" });
}

export async function simulateSelfServiceVacationRequest(payload) {
  return simulateVacationImpact(payload);
}

export async function exportSelfServiceWorkspace(section = "dashboard") {
  const domain = await getSelfServiceDomain();
  return {
    fileName: `self-service-${section}-${new Date().toISOString().slice(0, 10)}.json`,
    content: JSON.stringify({
      section,
      generatedAt: new Date().toISOString(),
      employee: domain.employee,
      requests: domain.requests,
      approvals: domain.approvals,
      stats: domain.stats,
    }, null, 2),
  };
}
