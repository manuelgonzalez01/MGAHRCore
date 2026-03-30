import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import { validatePersonnelActionInput } from "../schemas/personnelAction.schema";
import { validatePromotionInput } from "../schemas/promotion.schema";
import { validateTransferInput } from "../schemas/transfer.schema";
import { validateSalaryChangeInput } from "../schemas/salaryChange.schema";
import { validateTerminationInput } from "../schemas/termination.schema";
import {
  PERSONNEL_ACTION_TYPES,
  PERSONNEL_TRANSITIONS,
  PERSONNEL_WORKFLOW_ACTIONS,
  getActionStatusLabel,
  getActionTypeLabel,
} from "../utils/personnelActionLabels";
import {
  averageBy,
  buildFilterOptions,
  createPersonnelActionId,
  daysBetween,
  describeImpact,
} from "../utils/personnelActions.helpers";

const STORAGE_KEYS = {
  actions: "mgahrcore.personnelActions.records",
  audit: "mgahrcore.personnelActions.audit",
  exitLetters: "mgahrcore.personnelActions.exitLetters",
};

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
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(items));
  }
}

function getLanguage() {
  if (!canUseStorage()) {
    return "es";
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? "en" : "es";
}

function t(es, en) {
  return getLanguage() === "en" ? en : es;
}

function getActor() {
  if (!canUseStorage()) {
    return "MGAHRCore Super Admin";
  }

  try {
    const raw = window.localStorage.getItem("mgahrcore.auth.session");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed?.user?.displayName || parsed?.user?.name || "MGAHRCore Super Admin";
  } catch {
    return "MGAHRCore Super Admin";
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertValid(errors = []) {
  if (errors.length) {
    throw new Error(errors[0]);
  }
}

function resolveFlow(flows = []) {
  return flows.find((item) => item.module === "Personnel Actions" && item.status === "active")
    || flows.find((item) => item.module === "Employees" && item.status === "active")
    || {
      id: "FLOW-PACT-DEFAULT",
      name: t("Acciones de personal", "Personnel actions"),
      responsibleChain: ["Manager", "HR Operations", "HR Director"],
      levels: 3,
    };
}

function createTrail(status, flow, comment = "") {
  return [{
    id: createPersonnelActionId("TRAIL"),
    fromStatus: "",
    toStatus: status,
    action: "create",
    actor: getActor(),
    role: flow.responsibleChain?.[0] || "Requester",
    comment: comment || t("Solicitud creada.", "Request created."),
    changedAt: new Date().toISOString(),
  }];
}

function createAuditEntry({ entityId, action, employeeId = "", employeeName = "", before = null, after = null, summary }) {
  return {
    id: createPersonnelActionId("AUD"),
    entityId,
    action,
    employeeId,
    employeeName,
    actor: getActor(),
    timestamp: new Date().toISOString(),
    summary,
    before,
    after,
  };
}

function createSnapshot(employee = {}, organizations = {}) {
  const position = organizations.positions?.find((item) => item.id === employee.positionId);
  const department = organizations.departments?.find((item) => item.id === position?.departmentId || item.name === employee.department);
  const level = organizations.levels?.find((item) => item.id === employee.levelId || item.id === position?.levelId);
  const location = organizations.locations?.find((item) => item.id === employee.locationId || item.name === employee.location || item.id === position?.locationId);
  const company = organizations.companies?.find((item) => item.id === employee.companyId || item.name === employee.company);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    salary: Number(employee.salary?.baseSalary) || 0,
    currency: employee.salary?.currency || company?.baseCurrency || "BOB",
    companyId: company?.id || employee.companyId || "",
    companyName: company?.name || employee.company || "",
    departmentId: department?.id || employee.departmentId || "",
    departmentName: department?.name || employee.department || "",
    locationId: location?.id || employee.locationId || "",
    locationName: location?.name || employee.location || "",
    positionId: position?.id || employee.positionId || "",
    positionName: position?.name || employee.position || "",
    levelId: level?.id || employee.levelId || "",
    levelName: level?.name || employee.levelName || "",
    supervisorName: employee.manager || "",
    status: employee.status || "active",
  };
}

function buildFutureSnapshot(before, action, organizations) {
  const next = { ...before };
  const position = organizations.positions?.find((item) => item.id === action.targetPositionId);
  const department = organizations.departments?.find((item) => item.id === action.targetDepartmentId || item.id === position?.departmentId);
  const location = organizations.locations?.find((item) => item.id === action.targetLocationId || item.id === position?.locationId || item.id === department?.locationId);
  const level = organizations.levels?.find((item) => item.id === action.targetLevelId || item.id === position?.levelId);
  const company = organizations.companies?.find((item) => item.id === action.targetCompanyId || item.id === department?.companyId);

  if (company) {
    next.companyId = company.id;
    next.companyName = company.name;
    next.currency = company.baseCurrency || next.currency;
  }
  if (department) {
    next.departmentId = department.id;
    next.departmentName = department.name;
  }
  if (location) {
    next.locationId = location.id;
    next.locationName = location.name;
  }
  if (position) {
    next.positionId = position.id;
    next.positionName = position.name;
  }
  if (level) {
    next.levelId = level.id;
    next.levelName = level.name;
  }
  if (action.targetSupervisor) {
    next.supervisorName = action.targetSupervisor;
  }
  if (action.targetStatus) {
    next.status = action.targetStatus;
  }
  if (Number(action.targetSalary)) {
    next.salary = Number(action.targetSalary);
  }
  if (action.actionType === "termination") next.status = "terminated";
  if (action.actionType === "suspension") next.status = "suspended";
  if (action.actionType === "reinstatement" || action.actionType === "regularization") next.status = "active";

  return next;
}

function buildImpact(before, after) {
  const language = getLanguage();
  const labels = {
    salary: language === "en" ? "Salary" : "Salario",
    positionName: language === "en" ? "Position" : "Posicion",
    levelName: language === "en" ? "Level" : "Nivel",
    departmentName: language === "en" ? "Department" : "Departamento",
    locationName: language === "en" ? "Location" : "Localizacion",
    supervisorName: language === "en" ? "Supervisor" : "Supervisor",
    companyName: language === "en" ? "Company" : "Compania",
    status: language === "en" ? "Status" : "Estatus",
  };

  return Object.entries(labels).reduce((accumulator, [field, label]) => {
    const beforeValue = before?.[field] ?? "";
    const afterValue = after?.[field] ?? "";
    accumulator[field] = { label, before: beforeValue, after: afterValue, changed: beforeValue !== afterValue };
    return accumulator;
  }, {});
}

function hydrateAction(action, employees, organizations, flow) {
  const employee = employees.find((item) => item.id === action.employeeId);
  const beforeSnapshot = action.beforeSnapshot || createSnapshot(employee || {}, organizations);
  const afterSnapshot = action.afterSnapshot || buildFutureSnapshot(beforeSnapshot, action, organizations);
  const impact = buildImpact(beforeSnapshot, afterSnapshot);

  return {
    ...action,
    employeeName: action.employeeName || employee?.name || "",
    requestedBy: action.requestedBy || getActor(),
    approvalFlowId: action.approvalFlowId || flow.id,
    approvalFlowName: action.approvalFlowName || flow.name,
    approvalTrail: Array.isArray(action.approvalTrail) && action.approvalTrail.length
      ? action.approvalTrail
      : createTrail(action.status || "draft", flow),
    beforeSnapshot,
    afterSnapshot,
    impact,
    impactSummary: describeImpact(impact, getLanguage()),
    allowedActions: PERSONNEL_WORKFLOW_ACTIONS[action.status || "draft"] || [],
    typeLabel: getActionTypeLabel(action.actionType, getLanguage()),
    statusLabel: getActionStatusLabel(action.status || "draft", getLanguage()),
  };
}

function createSeedActions(employees, organizations, flow) {
  return employees.flatMap((employee) =>
    (employee.salary?.salaryHistory || []).slice(0, 1).map((movement) => hydrateAction({
      id: createPersonnelActionId("PACT"),
      employeeId: employee.id,
      employeeName: employee.name,
      actionType: "salary_change",
      title: t("Movimiento salarial historico", "Historic salary movement"),
      status: "effective",
      requestedBy: movement.changedBy || "Compensation Team",
      requestedAt: movement.effectiveDate || new Date().toISOString(),
      submittedAt: movement.effectiveDate || new Date().toISOString(),
      approvedAt: movement.effectiveDate || new Date().toISOString(),
      effectiveDate: movement.effectiveDate || new Date().toISOString().slice(0, 10),
      reason: movement.reason || t("Ajuste historico", "Historic adjustment"),
      targetSalary: Number(employee.salary?.baseSalary) || 0,
      beforeSnapshot: {
        ...createSnapshot(employee, organizations),
        salary: Number(movement.previousSalary) || Number(employee.salary?.baseSalary) || 0,
      },
      afterSnapshot: createSnapshot(employee, organizations),
      approvalTrail: [{
        id: createPersonnelActionId("TRAIL"),
        fromStatus: "",
        toStatus: "effective",
        action: "seed_effective",
        actor: movement.changedBy || "Compensation Team",
        role: flow.responsibleChain?.at(-1) || "HR Director",
        comment: t("Cargado desde historial salarial.", "Loaded from salary history."),
        changedAt: movement.effectiveDate || new Date().toISOString(),
      }],
    }, employees, organizations, flow)),
  );
}

function buildOptions(domain) {
  const allLabel = t("Todos", "All");
  return {
    employees: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.employees)],
    actionTypes: [{ value: "", label: allLabel }, ...PERSONNEL_ACTION_TYPES.map((item) => ({ value: item, label: getActionTypeLabel(item, getLanguage()) }))],
    statuses: [{ value: "", label: allLabel }, ...Object.keys(PERSONNEL_WORKFLOW_ACTIONS).map((item) => ({ value: item, label: getActionStatusLabel(item, getLanguage()) }))],
    departments: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.organizations.departments)],
    companies: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.organizations.companies)],
    positions: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.organizations.positions)],
    levels: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.organizations.levels)],
    locations: [{ value: "", label: allLabel }, ...buildFilterOptions(domain.organizations.locations)],
    supervisors: [{ value: "", label: allLabel }, ...domain.employees.map((item) => ({ value: item.name, label: item.name }))],
  };
}

function filterActions(actions, filters = {}) {
  return actions.filter((item) => {
    if (filters.actionType && item.actionType !== filters.actionType) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.employeeId && item.employeeId !== filters.employeeId) return false;
    if (filters.departmentId && item.beforeSnapshot.departmentId !== filters.departmentId && item.afterSnapshot.departmentId !== filters.departmentId) return false;
    if (filters.companyId && item.beforeSnapshot.companyId !== filters.companyId && item.afterSnapshot.companyId !== filters.companyId) return false;
    if (filters.from && item.effectiveDate < filters.from) return false;
    if (filters.to && item.effectiveDate > filters.to) return false;
    return true;
  });
}

function applyActionToEmployee(employee, action) {
  const next = deepClone(employee);
  const target = action.afterSnapshot;
  next.companyId = target.companyId;
  next.company = target.companyName;
  next.department = target.departmentName;
  next.positionId = target.positionId;
  next.position = target.positionName;
  next.levelId = target.levelId;
  next.levelName = target.levelName;
  next.location = target.locationName;
  next.manager = target.supervisorName;
  next.status = target.status;
  next.salary = {
    ...(next.salary || {}),
    baseSalary: target.salary,
    salaryHistory: [
      {
        effectiveDate: action.effectiveDate,
        change: `${target.salary}`,
        reason: action.reason,
        changedBy: getActor(),
        previousSalary: Number(employee.salary?.baseSalary) || 0,
      },
      ...((next.salary?.salaryHistory || [])),
    ].slice(0, 10),
  };
  next.actions = [
    {
      id: action.id,
      type: action.actionType,
      title: action.title,
      owner: action.requestedBy,
      status: action.status,
      effectiveDate: action.effectiveDate,
    },
    ...(next.actions || []),
  ].slice(0, 20);
  return next;
}

async function loadDomain() {
  const [employees, organizations, approvalFlows] = await Promise.all([
    employeesService.getEmployees(),
    administrationService.getOrganizations(),
    administrationService.getApprovalFlows(),
  ]);

  const flow = resolveFlow(approvalFlows);
  const rawActions = readCollection(STORAGE_KEYS.actions);
  const rawAudit = readCollection(STORAGE_KEYS.audit);
  const rawExitLetters = readCollection(STORAGE_KEYS.exitLetters);
  const needsSeed = rawActions.length === 0;
  const actions = (needsSeed ? createSeedActions(employees, organizations, flow) : rawActions)
    .map((item) => hydrateAction(item, employees, organizations, flow));
  const auditLog = rawAudit.filter((entry) => !entry.employeeId || employees.some((item) => item.id === entry.employeeId));
  const exitLetters = rawExitLetters.length
    ? rawExitLetters
    : actions.filter((item) => item.actionType === "termination").map((item) => ({
      id: createPersonnelActionId("EXIT"),
      actionId: item.id,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      documentNumber: `EXT-${item.id.slice(-5)}`,
      generatedAt: item.effectiveDate,
      effectiveDate: item.effectiveDate,
      status: item.status === "effective" ? "issued" : "draft",
      title: t("Carta de salida", "Exit letter"),
      summary: item.reason,
    }));

  if (needsSeed) {
    writeCollection(STORAGE_KEYS.actions, actions);
    writeCollection(STORAGE_KEYS.exitLetters, exitLetters);
    writeCollection(STORAGE_KEYS.audit, [
      createAuditEntry({
        entityId: "personnel-actions-domain",
        action: "seed_initialized",
        summary: t("Modulo inicializado a partir de historial real de colaboradores.", "Module initialized from employee history."),
      }),
    ]);
  }

  return { employees, organizations, approvalFlows, flow, actions, auditLog, exitLetters };
}

export async function getPersonnelActionsDomain(filters = {}) {
  const domain = await loadDomain();
  const filteredActions = filterActions(domain.actions, filters);
  const pendingActions = domain.actions.filter((item) => ["submitted", "pending_manager_review", "pending_hr_review", "pending_final_approval"].includes(item.status));
  const approvedActions = domain.actions.filter((item) => item.status === "approved");
  const effectiveActions = domain.actions.filter((item) => item.status === "effective");

  return {
    ...domain,
    filteredActions,
    options: buildOptions(domain),
    pendingActions,
    recentActions: [...domain.actions].sort((left, right) => new Date(right.updatedAt || right.requestedAt) - new Date(left.updatedAt || left.requestedAt)).slice(0, 8),
    kpis: {
      totalActions: domain.actions.length,
      pendingApprovals: pendingActions.length,
      approved: approvedActions.length,
      effective: effectiveActions.length,
      salaryChanges: domain.actions.filter((item) => item.actionType === "salary_change").length,
      promotions: domain.actions.filter((item) => item.actionType === "promotion").length,
      transfers: domain.actions.filter((item) => item.actionType === "transfer").length,
      terminations: domain.actions.filter((item) => item.actionType === "termination").length,
      avgApprovalDays: averageBy(
        domain.actions.filter((item) => item.status === "approved" || item.status === "effective"),
        (item) => daysBetween(item.submittedAt || item.requestedAt, item.approvedAt || item.updatedAt),
      ),
    },
  };
}

export async function savePersonnelAction(input) {
  const domain = await loadDomain();
  const employee = domain.employees.find((item) => item.id === input.employeeId);
  const existing = domain.actions.find((item) => item.id === input.id) || null;

  assertValid(validatePersonnelActionInput(input));
  assertValid(validatePromotionInput(input));
  assertValid(validateTransferInput(input));
  assertValid(validateSalaryChangeInput(input, employee?.salary?.baseSalary));
  assertValid(validateTerminationInput(input));

  const beforeSnapshot = existing?.beforeSnapshot || createSnapshot(employee || {}, domain.organizations);
  const basePayload = {
    ...existing,
    ...input,
    id: input.id || createPersonnelActionId("PACT"),
    title: input.title || getActionTypeLabel(input.actionType, getLanguage()),
    employeeName: employee?.name || existing?.employeeName || "",
    requestedBy: existing?.requestedBy || getActor(),
    requestedAt: existing?.requestedAt || new Date().toISOString(),
    submittedAt: input.status === "submitted" ? new Date().toISOString() : existing?.submittedAt || "",
    status: input.status || existing?.status || "draft",
  };
  const payload = hydrateAction({
    ...basePayload,
    beforeSnapshot,
    afterSnapshot: buildFutureSnapshot(beforeSnapshot, basePayload, domain.organizations),
    updatedAt: new Date().toISOString(),
    approvalTrail: existing?.approvalTrail || createTrail(basePayload.status, domain.flow),
  }, domain.employees, domain.organizations, domain.flow);

  const actions = [...domain.actions];
  const index = actions.findIndex((item) => item.id === payload.id);
  if (index >= 0) {
    actions[index] = payload;
  } else {
    actions.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.actions, actions);
  writeCollection(STORAGE_KEYS.audit, [
    createAuditEntry({
      entityId: payload.id,
      action: existing ? "action_updated" : "action_created",
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      before: existing,
      after: payload,
      summary: existing ? t("Accion actualizada.", "Action updated.") : t("Accion creada.", "Action created."),
    }),
    ...domain.auditLog,
  ].slice(0, 300));

  return payload;
}

export async function transitionPersonnelAction({ actionId, transition, comment = "" }) {
  const domain = await loadDomain();
  const actions = [...domain.actions];
  const index = actions.findIndex((item) => item.id === actionId);
  if (index < 0) {
    throw new Error(t("No encontramos la accion.", "Personnel action not found."));
  }

  const current = actions[index];
  if (!(PERSONNEL_WORKFLOW_ACTIONS[current.status] || []).includes(transition)) {
    throw new Error(t("La transicion no esta permitida.", "Transition is not allowed."));
  }

  const nextStatus = PERSONNEL_TRANSITIONS[transition];
  const next = hydrateAction({
    ...current,
    status: nextStatus,
    approvedAt: transition === "approve_final" ? new Date().toISOString() : current.approvedAt,
    updatedAt: new Date().toISOString(),
    approvalTrail: [
      ...(current.approvalTrail || []),
      {
        id: createPersonnelActionId("TRAIL"),
        fromStatus: current.status,
        toStatus: nextStatus,
        action: transition,
        actor: getActor(),
        role: domain.flow.responsibleChain?.[Math.min((current.approvalTrail || []).length, (domain.flow.responsibleChain || []).length - 1)] || getActor(),
        comment,
        changedAt: new Date().toISOString(),
      },
    ],
  }, domain.employees, domain.organizations, domain.flow);

  actions[index] = next;
  writeCollection(STORAGE_KEYS.actions, actions);
  writeCollection(STORAGE_KEYS.audit, [
    createAuditEntry({
      entityId: next.id,
      action: `workflow_${transition}`,
      employeeId: next.employeeId,
      employeeName: next.employeeName,
      before: current,
      after: next,
      summary: `${getActionStatusLabel(current.status, getLanguage())} -> ${getActionStatusLabel(nextStatus, getLanguage())}`,
    }),
    ...domain.auditLog,
  ].slice(0, 300));

  if (nextStatus === "effective") {
    const employee = domain.employees.find((item) => item.id === next.employeeId);
    if (employee) {
      await employeesService.saveEmployee(applyActionToEmployee(employee, next));
    }
  }

  return next;
}

export async function getPersonnelActionById(actionId) {
  const domain = await getPersonnelActionsDomain();
  const action = domain.filteredActions.find((item) => item.id === actionId) || domain.actions.find((item) => item.id === actionId);
  if (!action) {
    return null;
  }

  const employee = domain.employees.find((item) => item.id === action.employeeId);
  return {
    ...action,
    employeeSummary: employee
      ? {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        manager: employee.manager,
        status: employee.status,
        company: employee.company,
        levelName: employee.levelName,
        location: employee.location,
      }
      : null,
    auditEntries: domain.auditLog.filter((entry) => entry.entityId === action.id || entry.employeeId === action.employeeId),
    exitLetter: domain.exitLetters.find((item) => item.actionId === action.id) || null,
  };
}

export async function getPersonnelActionsDashboard() {
  const domain = await getPersonnelActionsDomain();
  return {
    actions: domain.actions,
    salaryMovements: domain.actions.filter((item) => item.actionType === "salary_change").map((item) => ({
      employeeName: item.employeeName,
      change: `${item.beforeSnapshot.salary} -> ${item.afterSnapshot.salary}`,
      reason: item.reason,
      effectiveDate: item.effectiveDate,
    })),
    approvals: domain.pendingActions.map((item) => ({
      id: item.id,
      requester: item.requestedBy,
      type: item.typeLabel,
      module: "Personnel Actions",
      currentLevel: item.statusLabel,
      status: item.status,
      sla: `${daysBetween(item.submittedAt || item.requestedAt, new Date().toISOString())}d`,
    })),
    stats: {
      actionsLogged: domain.kpis.totalActions,
      activeActions: domain.pendingActions.length,
      salaryMovements: domain.kpis.salaryChanges,
      pendingApprovals: domain.kpis.pendingApprovals,
    },
    kpis: domain.kpis,
    pendingActions: domain.pendingActions,
    recentActions: domain.recentActions,
    auditLog: domain.auditLog,
    options: domain.options,
    employees: domain.employees,
    organizations: domain.organizations,
  };
}

export async function getExitLettersWorkspace() {
  const domain = await getPersonnelActionsDomain();
  return {
    letters: domain.exitLetters,
    actions: domain.actions.filter((item) => item.actionType === "termination"),
  };
}

export default {
  getPersonnelActionsDomain,
  getPersonnelActionsDashboard,
  getPersonnelActionById,
  getExitLettersWorkspace,
  savePersonnelAction,
  transitionPersonnelAction,
};
