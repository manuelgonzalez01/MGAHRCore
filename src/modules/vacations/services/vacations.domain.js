import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import { vacationApprovalStepSchema, vacationAuditEventSchema } from "../schemas/vacationApproval.schema";
import { vacationBalanceMovementSchema, vacationBalanceSchema } from "../schemas/vacationBalance.schema";
import { vacationCalendarEventSchema, vacationConflictSchema, vacationPlanSchema } from "../schemas/vacationPlanning.schema";
import vacationPolicySchema from "../schemas/vacationPolicy.schema";
import vacationRequestSchema from "../schemas/vacationRequest.schema";
import {
  addDays,
  buildHolidayCatalog,
  formatIsoDate,
  getDaysBetween,
  getStatusLabel,
  getStatusTone,
  isWeekend,
  monthsBetween,
  rangesOverlap,
} from "../utils/vacation.helpers";

const STORAGE_KEYS = {
  policies: "mgahrcore.vacations.policies",
  requests: "mgahrcore.vacations.requests",
  plans: "mgahrcore.vacations.plans",
  rules: "mgahrcore.vacations.rules",
};

const ACTIVE_REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "pending_manager_approval",
  "pending_hr_approval",
  "approved",
  "scheduled",
  "consumed",
];

const APPROVAL_TERMINAL_STATUSES = ["approved", "rejected", "cancelled", "returned_for_changes", "consumed", "expired"];

const REQUEST_TRANSITIONS = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "cancelled", "returned_for_changes"],
  under_review: ["pending_manager_approval", "cancelled", "returned_for_changes"],
  pending_manager_approval: ["pending_hr_approval", "approved", "rejected", "returned_for_changes", "cancelled"],
  pending_hr_approval: ["approved", "rejected", "returned_for_changes", "cancelled"],
  approved: ["scheduled", "cancelled", "consumed"],
  returned_for_changes: ["draft", "submitted", "cancelled"],
  scheduled: ["consumed", "cancelled", "expired"],
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
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(items));
}

export function createVacationId(prefix = "VAC") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function resolveCurrentLanguage(settings) {
  return settings?.language === "en" ? "en" : "es";
}

function getDomainMessage(key, language = "es", meta = {}) {
  const messages = {
    transition_not_allowed: {
      es: `La transicion de ${meta.currentStatus} a ${meta.nextStatus} no esta permitida.`,
      en: `Transition from ${meta.currentStatus} to ${meta.nextStatus} is not allowed.`,
    },
    employee_not_found_request: {
      es: "No se encontro el colaborador para la solicitud vacacional.",
      en: "Employee not found for vacation request.",
    },
    request_not_found: {
      es: "No se encontro la solicitud vacacional.",
      en: "Vacation request not found.",
    },
    only_draft_or_returned_editable: {
      es: "Solo se pueden editar solicitudes en borrador o devueltas para cambios.",
      en: "Only draft or returned requests can be edited.",
    },
    source_request_not_found: {
      es: "No se encontro la solicitud vacacional de origen.",
      en: "Source vacation request not found.",
    },
    only_approved_or_scheduled_amendable: {
      es: "Solo se pueden modificar solicitudes aprobadas o programadas.",
      en: "Only approved or scheduled requests can be amended.",
    },
    no_pending_step: {
      es: "No hay un paso de aprobacion pendiente disponible.",
      en: "No pending approval step available.",
    },
    reject_reason_required: {
      es: "El motivo de rechazo es obligatorio.",
      en: "Reject reason is required.",
    },
    return_reason_required: {
      es: "El motivo de devolucion es obligatorio.",
      en: "Return reason is required.",
    },
    delegate_target_required: {
      es: "El aprobador delegado es obligatorio.",
      en: "Delegate target is required.",
    },
    only_approved_or_scheduled_expire: {
      es: "Solo pueden vencer solicitudes aprobadas o programadas.",
      en: "Only approved or scheduled requests can expire.",
    },
    unsupported_action: {
      es: `Accion vacacional no soportada: ${meta.action}`,
      en: `Unsupported vacation action: ${meta.action}`,
    },
    employee_not_found_simulation: {
      es: "No se encontro el colaborador para la simulacion vacacional.",
      en: "Employee not found for vacation simulation.",
    },
  };

  return messages[key]?.[language] || messages[key]?.es || key;
}

function localizeOrgLabel(value, language = "es") {
  const dictionary = {
    "People & Culture": {
      es: "Personas y Cultura",
      en: "People & Culture",
    },
    Finance: {
      es: "Finanzas",
      en: "Finance",
    },
    "Finance Manager": {
      es: "Gerente de Finanzas",
      en: "Finance Manager",
    },
    "HR Director": {
      es: "Director de RRHH",
      en: "HR Director",
    },
    "HR Operations": {
      es: "Operaciones de RRHH",
      en: "HR Operations",
    },
    "People Director": {
      es: "Director de Personas",
      en: "People Director",
    },
    "Business Manager": {
      es: "Gerente de Negocio",
      en: "Business Manager",
    },
    "Lider directo": {
      es: "Lider directo",
      en: "Direct manager",
    },
    Closed: {
      es: "Cerrado",
      en: "Closed",
    },
  };

  return dictionary[value]?.[language] || value;
}

function resolveCurrentDate() {
  return formatIsoDate(new Date());
}

function getVacationsFlow(flows = []) {
  return (
    flows.find((item) => item.module === "Vacations" && item.status === "active")
    || {
      id: "FLOW-001",
      name: "Vacaciones corporativas",
      module: "Vacations",
      levels: 2,
      priority: "Alta",
      requestType: "Solicitud de vacaciones",
      responsibleChain: ["Lider directo", "HR Director"],
    }
  );
}

function createDefaultRules({ organizations }) {
  const companies = organizations.companies || [];
  const [primaryCompany] = companies;

  return [
    {
      id: "RULE-VAC-001",
      code: "max_days_per_request",
      label: "Dias maximos por solicitud",
      value: 15,
      severity: "critical",
      active: true,
      companyId: primaryCompany?.id || "",
      employeeCategory: "all",
    },
    {
      id: "RULE-VAC-002",
      code: "retroactive_limit_days",
      label: "Retroactividad permitida",
      value: 5,
      severity: "warning",
      active: true,
      companyId: primaryCompany?.id || "",
      employeeCategory: "all",
    },
    {
      id: "RULE-VAC-003",
      code: "restricted_high_season",
      label: "Temporada alta restringida",
      value: [11, 12],
      severity: "critical",
      active: true,
      companyId: primaryCompany?.id || "",
      employeeCategory: "onsite",
    },
    {
      id: "RULE-VAC-004",
      code: "planning_required",
      label: "Planificacion anual obligatoria",
      value: true,
      severity: "warning",
      active: true,
      companyId: primaryCompany?.id || "",
      employeeCategory: "all",
    },
  ];
}

function normalizeVacationRule(rule = {}, organizations = {}) {
  const companies = organizations.companies || [];
  const company = companies.find((item) => item.id === rule.companyId) || null;

  return {
    id: rule.id || createVacationId("RULE"),
    code: rule.code || "",
    label: rule.label || "",
    value: rule.value ?? "",
    severity: rule.severity || "warning",
    active: rule.active !== false,
    companyId: rule.companyId || company?.id || "",
    companyName: rule.companyName || company?.name || "",
    employeeCategory: rule.employeeCategory || "all",
    policyFamily: rule.policyFamily || "annual-leave",
    createdManually: rule.createdManually !== false,
  };
}

function normalizeVacationPolicy(policy = {}, organizations = {}) {
  const companies = organizations.companies || [];
  const locations = organizations.locations || [];
  const company = companies.find((item) => item.id === policy.companyId || item.name === policy.companyName) || null;
  const location = locations.find((item) => item.id === policy.locationId || item.name === policy.locationName) || null;

  return {
    ...vacationPolicySchema,
    ...policy,
    companyId: policy.companyId || company?.id || "",
    companyName: policy.companyName || company?.name || "",
    locationId: policy.locationId || location?.id || "",
    locationName: policy.locationName || location?.name || "",
    countryCode: policy.countryCode || location?.countryCode || location?.country || "",
    policyCode: policy.policyCode || `VAC-${policy.companyId || company?.id || "GEN"}-${(policy.employeeCategory || "all").toUpperCase()}`,
    version: Number(policy.version) || 1,
    versionLabel: policy.versionLabel || `v${Number(policy.version) || 1}.0`,
    effectiveFrom: policy.effectiveFrom || resolveCurrentDate(),
    effectiveTo: policy.effectiveTo || "",
    maxDaysPerRequest: Number(policy.maxDaysPerRequest) || Number(vacationPolicySchema.maxDaysPerRequest) || 15,
    entitlementDays: Number(policy.entitlementDays) || Number(vacationPolicySchema.entitlementDays) || 18,
    minServiceMonths: Number(policy.minServiceMonths) || Number(vacationPolicySchema.minServiceMonths) || 3,
    carryOverLimit: Number(policy.carryOverLimit) || Number(vacationPolicySchema.carryOverLimit) || 5,
    expiresAfterMonths: Number(policy.expiresAfterMonths) || Number(vacationPolicySchema.expiresAfterMonths) || 12,
    hrApprovalThresholdDays: Number(policy.hrApprovalThresholdDays) || Number(vacationPolicySchema.hrApprovalThresholdDays) || 5,
    minCoverageRatio: Number(policy.minCoverageRatio) || Number(vacationPolicySchema.minCoverageRatio) || 0.65,
    requestLeadDays: Number(policy.requestLeadDays) || Number(vacationPolicySchema.requestLeadDays) || 7,
    bookingWindowMonths: Number(policy.bookingWindowMonths) || Number(vacationPolicySchema.bookingWindowMonths) || 12,
    status: policy.status || "active",
  };
}

function isLegacySeedPolicy(policy = {}) {
  return /^POL-VAC-00\d+$/.test(policy.id || "") && !policy.createdManually;
}

function buildRuntimeFallbackPolicy(employee = {}, organizations = {}) {
  const companies = organizations.companies || [];
  const locations = organizations.locations || [];
  const company = companies.find((item) => item.id === employee.companyId || item.name === employee.company) || companies[0] || {};
  const location = locations.find((item) => item.id === employee.locationId || item.name === employee.location) || locations[0] || {};

  return normalizeVacationPolicy({
    ...vacationPolicySchema,
    id: "POL-RUNTIME",
    policyCode: "VAC-RUNTIME",
    version: 1,
    versionLabel: "runtime",
    effectiveFrom: resolveCurrentDate(),
    companyId: company.id || employee.companyId || "",
    companyName: company.name || employee.company || "",
    locationId: location.id || employee.locationId || "",
    locationName: location.name || employee.location || "",
    countryCode: location.countryCode || location.country || "",
    employeeCategory: employee.employeeType || "all",
    leaveType: "annual",
    status: "active",
  }, organizations);
}

function buildApplicablePolicy(employee, policies, organizations = {}) {
  const today = resolveCurrentDate();
  const eligible = policies
    .filter((item) =>
      item.status === "active"
      && (!item.effectiveFrom || item.effectiveFrom <= today)
      && (!item.effectiveTo || item.effectiveTo >= today)
      && (item.companyId === employee.companyId || item.companyName === employee.company || !item.companyId)
      && (item.locationId === employee.locationId || item.locationName === employee.location || !item.locationId)
      && (item.employeeCategory === "all" || item.employeeCategory === employee.employeeType),
    )
    .sort((left, right) => {
      if ((right.version || 0) !== (left.version || 0)) {
        return (right.version || 0) - (left.version || 0);
      }
      return (right.effectiveFrom || "").localeCompare(left.effectiveFrom || "");
    });

  return eligible[0] || policies[0] || buildRuntimeFallbackPolicy(employee, organizations);
}

function getApplicableRules(employee, rules = [], policy) {
  return rules.filter((rule) =>
    rule.active
    && (!rule.companyId || rule.companyId === employee.companyId)
    && (!rule.employeeCategory || rule.employeeCategory === "all" || rule.employeeCategory === employee.employeeType)
    && (!rule.policyFamily || rule.policyFamily === policy.policyFamily),
  );
}

function calculateChargeableDays({ startDate, endDate, companyId, locationId }, policy, holidays = []) {
  const dates = getDaysBetween(startDate, endDate);
  const holidaySet = new Set(
    holidays
      .filter((item) => (!item.companyId || item.companyId === companyId) && (!item.locationId || item.locationId === locationId))
      .map((item) => item.date),
  );

  const chargeableDates = dates.filter((date) => {
    if (policy.excludeWeekends && isWeekend(date)) {
      return false;
    }
    if (policy.excludeHolidays && holidaySet.has(date)) {
      return false;
    }
    return true;
  });

  return {
    requestedDays: dates.length,
    chargeableDays: chargeableDates.length,
    holidaysExcluded: dates.filter((date) => holidaySet.has(date)).length,
    weekendsExcluded: dates.filter((date) => isWeekend(date)).length,
    balanceImpactDays: chargeableDates.length,
  };
}

function buildApprovalSteps(request, flow, policy, employee) {
  const managerActor = employee.manager || flow.responsibleChain?.[0] || "Lider directo";
  const steps = [
    {
      ...vacationApprovalStepSchema,
      id: createVacationId("APR"),
      requestId: request.id,
      sequence: 1,
      role: "manager",
      actor: managerActor,
      status: "pending",
    },
  ];

  if (request.balanceImpactDays >= policy.hrApprovalThresholdDays) {
    steps.push({
      ...vacationApprovalStepSchema,
      id: createVacationId("APR"),
      requestId: request.id,
      sequence: 2,
      role: "hr",
      actor: flow.responsibleChain?.[1] || "HR Director",
      status: "pending",
    });
  }

  return steps;
}

function buildAuditEvent(requestId, actor, action, fromStatus, toStatus, note = "", meta = {}) {
  return {
    ...vacationAuditEventSchema,
    id: createVacationId("AUD"),
    requestId,
    actor,
    action,
    fromStatus,
    toStatus,
    occurredAt: new Date().toISOString(),
    note,
    meta,
  };
}

function seedRequestTimeline(requestId, employeeName, manager) {
  return [
    buildAuditEvent(requestId, employeeName, "request_created", "draft", "submitted", "Solicitud migrada desde expediente historico del colaborador."),
    buildAuditEvent(requestId, manager || "Lider directo", "manager_review", "pending_manager_approval", "approved", "Aprobacion inicial emitida por jefatura."),
  ];
}

function normalizeAuditTrail(request, auditTrail = []) {
  return auditTrail.map((item) => ({
    ...vacationAuditEventSchema,
    ...item,
    id: item.id || createVacationId("AUD"),
    requestId: request.id,
  }));
}

function normalizeRequest(raw, employee, policy, flow, holidays, language = "es") {
  const base = {
    ...vacationRequestSchema,
    ...raw,
  };
  const calculated = calculateChargeableDays(base, policy, holidays);
  const approvalSteps = Array.isArray(raw.approvalSteps) && raw.approvalSteps.length
    ? raw.approvalSteps
    : buildApprovalSteps({ ...base, ...calculated }, flow, policy, employee);
  const currentStep = approvalSteps.find((item) => item.status === "pending");

  return {
    ...base,
    id: base.id || createVacationId("REQ"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId,
    company: employee.company,
    locationId: employee.locationId || "",
    location: localizeOrgLabel(employee.location || "", language),
    department: localizeOrgLabel(employee.department, language),
    employeeCategory: employee.employeeType,
    manager: localizeOrgLabel(employee.manager, language),
    requestedBy: base.requestedBy || employee.name,
    requestedAt: base.requestedAt || resolveCurrentDate(),
    policyId: policy.id,
    policyName: `${policy.companyName} / ${policy.locationName}`,
    status: base.status || "draft",
    approvalSteps,
    currentStepId: currentStep?.id || "",
    currentApprover: localizeOrgLabel(currentStep?.delegatedTo || currentStep?.actor || "Closed", language),
    currentLevel: currentStep?.sequence || approvalSteps.length,
    totalLevels: approvalSteps.length,
    detailStatus: base.detailStatus || "on_time",
    requestedDays: calculated.requestedDays,
    chargeableDays: calculated.chargeableDays,
    holidaysExcluded: calculated.holidaysExcluded,
    weekendsExcluded: calculated.weekendsExcluded,
    balanceImpactDays: calculated.balanceImpactDays,
    auditTrail: normalizeAuditTrail(base, base.auditTrail || []),
  };
}

function deriveLeaveStatus(requestStatus) {
  if (["approved", "scheduled", "consumed"].includes(requestStatus)) {
    return "approved";
  }
  if (requestStatus === "cancelled") {
    return "cancelled";
  }
  return "pending";
}

async function syncEmployeeLeave(request, nextStatus) {
  const employee = await employeesService.getEmployeeById(request.employeeId);
  if (!employee) {
    return;
  }

  const existingLeaves = (employee.leaves || []).filter((item) => item.id !== request.id);

  if (["approved", "scheduled", "consumed"].includes(nextStatus)) {
    existingLeaves.unshift({
      id: request.id,
      type: "Vacacion anual",
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.balanceImpactDays,
      status: deriveLeaveStatus(nextStatus),
    });
  }

  await employeesService.saveEmployee({
    ...employee,
    leaves: existingLeaves,
  });
}

function buildSeedRequests(employees, policies, flow, holidays, language = "es") {
  const seeded = [];

  employees.forEach((employee, index) => {
    const policy = buildApplicablePolicy(employee, policies);
    (employee.leaves || []).forEach((leave) => {
      seeded.push(
        normalizeRequest(
          {
            id: leave.id,
            employeeId: employee.id,
            leaveType: "annual",
            status: leave.status === "approved" ? "consumed" : "submitted",
            requestedAt: leave.startDate,
            startDate: leave.startDate,
            endDate: leave.endDate,
            note: "Registro historico migrado desde Employees.",
            requestedBy: employee.name,
            auditTrail: seedRequestTimeline(leave.id, employee.name, employee.manager),
          },
          employee,
          policy,
          flow,
          holidays,
          language,
        ),
      );
    });

    if (index < 3) {
      const draftStart = addDays(resolveCurrentDate(), 14 + (index * 7));
      const draftEnd = addDays(draftStart, 4 + index);
      const requestId = createVacationId("REQ");
      seeded.push(
        normalizeRequest(
          {
            id: requestId,
            employeeId: employee.id,
            leaveType: "annual",
            status: index === 0 ? "pending_manager_approval" : index === 1 ? "returned_for_changes" : "submitted",
            requestedAt: resolveCurrentDate(),
            startDate: draftStart,
            endDate: draftEnd,
            note: index === 1 ? "Ajustar cobertura con el relevo del equipo." : "Solicitud operativa de vacaciones semestrales.",
            rejectionReason: "",
            returnReason: index === 1 ? "Ajustar fechas para mantener cobertura minima." : "",
            requestedBy: employee.name,
            auditTrail: [
              buildAuditEvent(requestId, employee.name, "request_created", "draft", "submitted", "Solicitud generada por colaborador."),
            ],
          },
          employee,
          policy,
          flow,
          holidays,
          language,
        ),
      );
    }
  });

  return seeded;
}

function buildSeedPlans(employees, requests, language = "es") {
  return employees.slice(0, 6).map((employee, index) => {
    const employeeRequests = requests.filter((item) => item.employeeId === employee.id && ["approved", "scheduled"].includes(item.status));
    const referenceRequest = employeeRequests[0];

    return {
      ...vacationPlanSchema,
      id: createVacationId("PLN"),
      employeeId: employee.id,
      employeeName: employee.name,
      department: localizeOrgLabel(employee.department, language),
      month: referenceRequest?.startDate?.slice(0, 7) || `2026-${String(index + 4).padStart(2, "0")}`,
      plannedDays: referenceRequest?.balanceImpactDays || 5 + index,
      status: referenceRequest ? "scheduled" : "draft",
      coverageRisk: index % 3 === 0 ? "watch" : "healthy",
    };
  });
}

function buildPoliciesSnapshot(employees, policies) {
  return employees.reduce((acc, employee) => {
    acc[employee.id] = buildApplicablePolicy(employee, policies);
    return acc;
  }, {});
}

function buildBalances(employees, requests, policiesByEmployee, language = "es") {
  return employees.map((employee) => {
    const policy = policiesByEmployee[employee.id] || vacationPolicySchema;
    const employeeRequests = requests.filter((item) => item.employeeId === employee.id);
    const approved = employeeRequests
      .filter((item) => ["approved", "scheduled", "consumed"].includes(item.status))
      .reduce((sum, item) => sum + item.balanceImpactDays, 0);
    const pending = employeeRequests
      .filter((item) => ["submitted", "under_review", "pending_manager_approval", "pending_hr_approval", "returned_for_changes"].includes(item.status))
      .reduce((sum, item) => sum + item.balanceImpactDays, 0);
    const expired = employeeRequests
      .filter((item) => item.status === "expired")
      .reduce((sum, item) => sum + item.balanceImpactDays, 0);
    const carryOver = Math.min(policy.carryOverLimit, Math.max(policy.entitlementDays - approved - 2, 0));
    const earned = policy.entitlementDays + carryOver;
    const available = policy.allowNegativeBalance
      ? earned - approved - pending
      : Math.max(earned - approved - pending, 0);
    const movements = [
      {
        ...vacationBalanceMovementSchema,
        id: createVacationId("MOV"),
        employeeId: employee.id,
        type: "accrual",
        label: "Devengo anual",
        effectiveDate: "2026-01-01",
        impactDays: policy.entitlementDays,
        balanceAfter: policy.entitlementDays,
      },
      {
        ...vacationBalanceMovementSchema,
        id: createVacationId("MOV"),
        employeeId: employee.id,
        type: "carry_over",
        label: "Arrastre permitido",
        effectiveDate: "2026-01-02",
        impactDays: carryOver,
        balanceAfter: policy.entitlementDays + carryOver,
      },
    ];

    employeeRequests
      .filter((item) => APPROVAL_TERMINAL_STATUSES.includes(item.status))
      .forEach((item) => {
        movements.push({
          ...vacationBalanceMovementSchema,
          id: createVacationId("MOV"),
          employeeId: employee.id,
          requestId: item.id,
          type: item.status === "cancelled" ? "reversal" : "consumption",
          label: item.status === "cancelled" ? "Reversion por cancelacion" : `Solicitud ${item.id}`,
          effectiveDate: item.startDate,
          impactDays: item.status === "cancelled" ? item.balanceImpactDays : -item.balanceImpactDays,
          balanceAfter: 0,
        });
      });

    let runningBalance = 0;
    const resolvedMovements = movements.map((movement) => {
      runningBalance += movement.impactDays;
      return {
        ...movement,
        balanceAfter: runningBalance,
      };
    });

    return {
      ...vacationBalanceSchema,
      id: createVacationId("BAL"),
      employeeId: employee.id,
      employeeName: employee.name,
      company: employee.company,
      department: localizeOrgLabel(employee.department, language),
      location: localizeOrgLabel(employee.location, language),
      policyId: policy.id,
      earned,
      consumed: approved,
      approved,
      pending,
      expired,
      carriedOver: carryOver,
      available,
      risk: available < 3 || pending > 8 ? "warning" : "healthy",
      movements: resolvedMovements,
    };
  });
}

function buildValidation(request, employee, policy, holidays, existingRequests, employees, balance, rules = [], plans = []) {
  const exceptions = [];
  const calculated = calculateChargeableDays(request, policy, holidays);
  const serviceMonths = monthsBetween(employee.startDate, request.startDate);
  const leadDate = addDays(resolveCurrentDate(), policy.requestLeadDays);
  const bookingWindow = addDays(resolveCurrentDate(), policy.bookingWindowMonths * 30);
  const maxDaysRule = rules.find((item) => item.code === "max_days_per_request");
  const retroactiveRule = rules.find((item) => item.code === "retroactive_limit_days");
  const highSeasonRule = rules.find((item) => item.code === "restricted_high_season");
  const planningRule = rules.find((item) => item.code === "planning_required");
  const requestMonth = Number((request.startDate || "").slice(5, 7));
  const retroactiveDays = getDaysBetween(request.startDate, resolveCurrentDate()).length - 1;

  if (serviceMonths < policy.minServiceMonths) {
    exceptions.push({
      code: "SENIORITY_NOT_ELIGIBLE",
      title: "Antiguedad insuficiente",
      detail: "El colaborador no cumple la antiguedad minima requerida por la politica.",
      severity: "critical",
    });
  }

  if (!policy.allowNegativeBalance && calculated.balanceImpactDays > (balance?.available || 0)) {
    exceptions.push({
      code: "INSUFFICIENT_BALANCE",
      title: "Saldo insuficiente",
      detail: "La solicitud supera el saldo disponible permitido para el colaborador.",
      severity: "critical",
    });
  }

  if (request.startDate < leadDate) {
    exceptions.push({
      code: "OUTSIDE_ALLOWED_PERIOD",
      title: "Fuera del periodo permitido",
      detail: "La solicitud no cumple la antelacion minima definida por la politica.",
      severity: "warning",
    });
  }

  if (request.startDate > bookingWindow) {
    exceptions.push({
      code: "OUTSIDE_BOOKING_WINDOW",
      title: "Fuera de ventana de reserva",
      detail: "La solicitud excede el horizonte maximo permitido para planificar vacaciones.",
      severity: "critical",
    });
  }

  if (calculated.holidaysExcluded > 0) {
    exceptions.push({
      code: "CROSSES_HOLIDAYS",
      title: "Cruza feriados",
      detail: "La solicitud contiene feriados; se excluyeron segun la politica vigente.",
      severity: "info",
    });
  }

  if (maxDaysRule && calculated.balanceImpactDays > Number(maxDaysRule.value || policy.maxDaysPerRequest)) {
    exceptions.push({
      code: "MAX_DAYS_EXCEEDED",
      title: "Excede dias maximos",
      detail: "La solicitud supera el maximo de dias permitido por regla activa.",
      severity: maxDaysRule.severity || "critical",
    });
  }

  if (request.retroactive && retroactiveRule && retroactiveDays > Number(retroactiveRule.value || 0)) {
    exceptions.push({
      code: "RETROACTIVE_LIMIT_EXCEEDED",
      title: "Retroactividad excedida",
      detail: "La solicitud retroactiva excede la tolerancia definida por regla.",
      severity: retroactiveRule.severity || "warning",
    });
  }

  if ((policy.restrictHighSeason || highSeasonRule) && (highSeasonRule?.value || policy.highSeasonMonths || []).includes(requestMonth)) {
    exceptions.push({
      code: "HIGH_SEASON_RESTRICTION",
      title: "Temporada restringida",
      detail: "La solicitud cae en una temporada restringida para este colectivo.",
      severity: highSeasonRule?.severity || "critical",
    });
  }

  if ((planningRule?.value ?? policy.planningRequired) && !plans.some((item) => item.employeeId === employee.id && item.month === (request.startDate || "").slice(0, 7))) {
    exceptions.push({
      code: "MISSING_ANNUAL_PLAN",
      title: "Sin planificacion anual",
      detail: "No existe una planificacion anual registrada para el periodo solicitado.",
      severity: planningRule?.severity || "warning",
    });
  }

  const overlappingVacation = existingRequests.find((item) =>
    item.employeeId === request.employeeId
    && item.id !== request.id
    && !["rejected", "cancelled", "expired"].includes(item.status)
    && rangesOverlap(item.startDate, item.endDate, request.startDate, request.endDate),
  );

  if (overlappingVacation) {
    exceptions.push({
      code: "VACATION_OVERLAP",
      title: "Conflicto con otra solicitud",
      detail: `La solicitud se solapa con ${overlappingVacation.id}.`,
      severity: "critical",
    });
  }

  const permissionConflict = (employee.permissions || []).find((item) =>
    ["approved", "pending"].includes(item.status)
    && rangesOverlap(item.startDate, item.endDate, request.startDate, request.endDate),
  );

  if (permissionConflict) {
    exceptions.push({
      code: "PERMISSION_CONFLICT",
      title: "Conflicto con permiso/licencia",
      detail: `Existe un permiso o licencia del empleado en las mismas fechas (${permissionConflict.type}).`,
      severity: "warning",
    });
  }

  const departmentEmployees = employees.filter((item) => item.department === employee.department);
  const peersOnLeave = existingRequests.filter((item) =>
    item.department === employee.department
    && item.id !== request.id
    && ACTIVE_REQUEST_STATUSES.includes(item.status)
    && rangesOverlap(item.startDate, item.endDate, request.startDate, request.endDate),
  ).length;
  const coverageRatio = departmentEmployees.length ? (departmentEmployees.length - peersOnLeave - 1) / departmentEmployees.length : 1;

  if (coverageRatio < policy.minCoverageRatio) {
    exceptions.push({
      code: "MINIMUM_COVERAGE_CONFLICT",
      title: "Cobertura minima comprometida",
      detail: "El equipo quedaria por debajo de la cobertura minima definida por la politica.",
      severity: "critical",
    });
  }

  return {
    calculated,
    exceptions,
    coverageRatio,
  };
}

function buildImpactPreview(request, balance, validation, requests = []) {
  const overlappingTeam = requests.filter((item) =>
    item.department === request.department
    && item.id !== request.id
    && ACTIVE_REQUEST_STATUSES.includes(item.status)
    && rangesOverlap(item.startDate, item.endDate, request.startDate, request.endDate),
  );

  return {
    resultingBalance: (balance?.available || 0) - request.balanceImpactDays,
    conflicts: validation.exceptions,
    teamImpact: {
      overlappingTeamMembers: overlappingTeam.length,
      coverageRatio: validation.coverageRatio,
      riskLevel: validation.exceptions.some((item) => item.severity === "critical") ? "critical" : validation.exceptions.length ? "warning" : "healthy",
    },
  };
}

function buildCurrentState(request) {
  return {
    status: request.status,
    approver: request.currentApprover,
    policyName: request.policyName,
    balanceImpactDays: request.balanceImpactDays,
    requestedWindow: `${request.startDate} - ${request.endDate}`,
  };
}

function buildReconstructedHistory(auditTrail = []) {
  return auditTrail
    .map((eventItem, index) => ({
      ...eventItem,
      sequence: index + 1,
      transition: `${eventItem.fromStatus} -> ${eventItem.toStatus}`,
    }))
    .sort((left, right) => new Date(left.occurredAt) - new Date(right.occurredAt));
}

function buildConflicts(requests, employees, balances) {
  return requests.flatMap((request) => {
    const balance = balances.find((item) => item.employeeId === request.employeeId);
    const employee = employees.find((item) => item.id === request.employeeId);
    const items = [];

    if ((request.exceptions || []).some((item) => item.code === "MINIMUM_COVERAGE_CONFLICT")) {
      items.push({
        ...vacationConflictSchema,
        id: createVacationId("CFL"),
        requestId: request.id,
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        type: "coverage",
        severity: "critical",
        title: "Cobertura minima comprometida",
        detail: `El departamento ${employee?.department || request.department} quedaria sin cobertura suficiente.`,
        affectedWindow: `${request.startDate} - ${request.endDate}`,
      });
    }

    if ((request.exceptions || []).some((item) => item.code === "VACATION_OVERLAP")) {
      items.push({
        ...vacationConflictSchema,
        id: createVacationId("CFL"),
        requestId: request.id,
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        type: "overlap",
        severity: "critical",
        title: "Solapamiento de vacaciones",
        detail: "La solicitud se cruza con otra transaccion activa del mismo empleado.",
        affectedWindow: `${request.startDate} - ${request.endDate}`,
      });
    }

    if ((balance?.available || 0) < 0 || (request.exceptions || []).some((item) => item.code === "INSUFFICIENT_BALANCE")) {
      items.push({
        ...vacationConflictSchema,
        id: createVacationId("CFL"),
        requestId: request.id,
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        type: "balance",
        severity: "warning",
        title: "Saldo comprometido",
        detail: "El saldo disponible no cubre completamente la solicitud propuesta.",
        affectedWindow: `${request.startDate} - ${request.endDate}`,
      });
    }

    return items;
  });
}

function buildPlansFromRequests(requests, storedPlans = [], language = "es") {
  const requestPlans = requests
    .filter((item) => ["approved", "scheduled"].includes(item.status))
    .map((item) => ({
      ...vacationPlanSchema,
      id: `PLAN-${item.id}`,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      department: localizeOrgLabel(item.department, language),
      month: item.startDate.slice(0, 7),
      plannedDays: item.balanceImpactDays,
      executedDays: ["consumed"].includes(item.status) ? item.balanceImpactDays : 0,
      complianceRatio: ["consumed"].includes(item.status) ? 1 : item.status === "scheduled" ? 0.75 : 0.5,
      varianceDays: 0,
      status: item.status,
      coverageRisk: (item.exceptions || []).some((exceptionItem) => exceptionItem.code === "MINIMUM_COVERAGE_CONFLICT") ? "watch" : "healthy",
    }));

  const merged = [...storedPlans];
  requestPlans.forEach((plan) => {
    const index = merged.findIndex((item) => item.id === plan.id);
    if (index >= 0) {
      const nextExecuted = Math.max(merged[index].executedDays || 0, plan.executedDays || 0);
      const nextPlanned = plan.plannedDays || merged[index].plannedDays || 0;
      merged[index] = {
        ...merged[index],
        ...plan,
        department: localizeOrgLabel(plan.department || merged[index].department, language),
        executedDays: nextExecuted,
        plannedDays: nextPlanned,
        complianceRatio: nextPlanned ? Number((nextExecuted / nextPlanned).toFixed(2)) : 0,
        varianceDays: nextExecuted - nextPlanned,
      };
    } else {
      merged.push({
        ...plan,
        department: localizeOrgLabel(plan.department, language),
        complianceRatio: plan.plannedDays ? Number(((plan.executedDays || 0) / plan.plannedDays).toFixed(2)) : 0,
        varianceDays: (plan.executedDays || 0) - plan.plannedDays,
      });
    }
  });

  return merged;
}

function buildCalendarEvents(requests, holidays = []) {
  const holidayEvents = holidays.map((item) => ({
    ...vacationCalendarEventSchema,
    id: `HOL-${item.date}-${item.name}`,
    date: item.date,
    type: "holiday",
    label: item.name,
    employeeName: "",
    status: "holiday",
    location: item.locationName || "",
  }));

  const vacationEvents = requests.flatMap((request) =>
    getDaysBetween(request.startDate, request.endDate).map((date) => ({
      ...vacationCalendarEventSchema,
      id: `${request.id}-${date}`,
      date,
      type: "vacation",
      label: request.employeeName,
      employeeName: request.employeeName,
      status: request.status,
      location: request.location,
      department: request.department,
      requestId: request.id,
    })),
  );

  return [...holidayEvents, ...vacationEvents].sort((left, right) => left.date.localeCompare(right.date));
}

function buildReports({ employees, balances, requests, plans, conflicts }) {
  const byDepartment = Object.values(
    requests.reduce((acc, request) => {
      const key = request.department || "Sin departamento";
      if (!acc[key]) {
        acc[key] = {
          department: key,
          approvedDays: 0,
          pendingDays: 0,
          requests: 0,
        };
      }

      acc[key].requests += 1;
      if (["approved", "scheduled", "consumed"].includes(request.status)) {
        acc[key].approvedDays += request.balanceImpactDays;
      }
      if (["submitted", "pending_manager_approval", "pending_hr_approval", "under_review"].includes(request.status)) {
        acc[key].pendingDays += request.balanceImpactDays;
      }
      return acc;
    }, {}),
  );

  const expiringBalances = balances
    .filter((item) => item.carriedOver > 0)
    .map((item) => ({
      employeeName: item.employeeName,
      department: item.department,
      carriedOver: item.carriedOver,
      expiryWindow: "Q3 2026",
    }));

  const liability = balances.reduce((sum, item) => sum + (item.available * 430), 0);

  return {
    operational: byDepartment,
    expiringBalances,
    highBalanceEmployees: balances.filter((item) => item.available >= 12),
    planningCompliance: employees.map((employee) => ({
      employeeId: employee.id,
      employeeName: employee.name,
      hasPlan: plans.some((item) => item.employeeId === employee.id),
      status: plans.some((item) => item.employeeId === employee.id) ? "covered" : "missing",
    })),
    liability,
    riskSummary: {
      conflicts: conflicts.length,
      pendingApprovals: requests.filter((item) => ["pending_manager_approval", "pending_hr_approval"].includes(item.status)).length,
      returnedForChanges: requests.filter((item) => item.status === "returned_for_changes").length,
    },
  };
}

async function loadBaseContext() {
  const [employeesDashboard, organizations, approvalFlows, approvalQueue, settings] = await Promise.all([
    employeesService.getEmployeesDashboard(),
    administrationService.getOrganizations(),
    administrationService.getApprovalFlows(),
    administrationService.getApprovalQueue(),
    administrationService.getSettings(),
  ]);

  return {
    employees: employeesDashboard.employees,
    organizations,
    approvalFlow: getVacationsFlow(approvalFlows),
    approvalQueue,
    settings,
    holidays: buildHolidayCatalog(organizations),
  };
}

async function ensureSeededCollections(context) {
  const storedPolicies = readCollection(STORAGE_KEYS.policies);
  const storedRequests = readCollection(STORAGE_KEYS.requests);
  const storedPlans = readCollection(STORAGE_KEYS.plans);
  const storedRules = readCollection(STORAGE_KEYS.rules);
  const language = resolveCurrentLanguage(context.settings);

  const policies = (storedPolicies.length ? storedPolicies : [])
    .map((item) => normalizeVacationPolicy(item, context.organizations));
  const visiblePolicies = policies.filter((item) => !isLegacySeedPolicy(item));
  const requests = storedRequests.length
    ? storedRequests
    : buildSeedRequests(context.employees, visiblePolicies, context.approvalFlow, context.holidays, language);
  const plans = storedPlans.length ? storedPlans : buildSeedPlans(context.employees, requests, language);
  const rules = (storedRules.length ? storedRules : createDefaultRules(context))
    .map((item) => normalizeVacationRule(item, context.organizations));

  writeCollection(STORAGE_KEYS.policies, visiblePolicies);
  writeCollection(STORAGE_KEYS.requests, requests);
  writeCollection(STORAGE_KEYS.plans, plans);
  writeCollection(STORAGE_KEYS.rules, rules);

  return {
    policies: visiblePolicies,
    requests,
    plans,
    rules,
  };
}

export async function getVacationSubsystem() {
  const context = await loadBaseContext();
  const language = resolveCurrentLanguage(context.settings);
  const seed = await ensureSeededCollections(context);
  const policiesByEmployee = buildPoliciesSnapshot(context.employees, seed.policies);
  const initialBalances = buildBalances(context.employees, seed.requests, policiesByEmployee, language);
  const requests = seed.requests.map((raw) => {
    const employee = context.employees.find((item) => item.id === raw.employeeId);
    const policy = policiesByEmployee[raw.employeeId] || buildApplicablePolicy(employee || {}, seed.policies, context.organizations);
    const rules = getApplicableRules(employee || {}, seed.rules, policy);
    const normalized = normalizeRequest(raw, employee, policy, context.approvalFlow, context.holidays, language);
    const validation = buildValidation(
      normalized,
      employee,
      policy,
      context.holidays,
      seed.requests,
      context.employees,
      initialBalances.find((item) => item.employeeId === raw.employeeId),
      rules,
      seed.plans,
    );
    const preview = buildImpactPreview(normalized, initialBalances.find((item) => item.employeeId === raw.employeeId), validation, seed.requests);
    return {
      ...normalized,
      rules,
      exceptions: validation.exceptions,
      coverageRatio: validation.coverageRatio,
      impactPreview: preview,
      currentState: buildCurrentState(normalized),
      reconstructedHistory: buildReconstructedHistory(normalized.auditTrail),
      detailStatus: validation.exceptions.some((item) => item.severity === "critical") ? "attention" : "on_time",
      statusLabel: getStatusLabel(normalized.status),
      statusTone: getStatusTone(normalized.status),
    };
  });
  const balances = buildBalances(context.employees, requests, policiesByEmployee, language);
  const plans = buildPlansFromRequests(requests, seed.plans, language);
  const conflicts = buildConflicts(requests, context.employees, balances);
  const calendar = buildCalendarEvents(requests, context.holidays);
  const reports = buildReports({
    employees: context.employees,
    balances,
    requests,
    plans,
    conflicts,
  });

  return {
    ...context,
    language,
    policies: seed.policies,
    rules: seed.rules,
    requests: requests.sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt)),
    balances,
    plans,
    conflicts,
    calendar,
    reports,
    dashboard: {
      headcountTracked: context.employees.length,
      pendingRequests: requests.filter((item) => ["submitted", "under_review", "pending_manager_approval", "pending_hr_approval"].includes(item.status)).length,
      approvedDays: requests.filter((item) => ["approved", "scheduled", "consumed"].includes(item.status)).reduce((sum, item) => sum + item.balanceImpactDays, 0),
      expiringBalances: reports.expiringBalances.length,
      activeConflicts: conflicts.length,
      averageAvailableBalance: balances.length
        ? Math.round(balances.reduce((sum, item) => sum + item.available, 0) / balances.length)
        : 0,
    },
    approvalQueue: requests.filter((item) => ["pending_manager_approval", "pending_hr_approval", "under_review"].includes(item.status)),
    history: requests
      .flatMap((item) =>
        (item.auditTrail || []).map((eventItem) => ({
          ...eventItem,
          employeeName: item.employeeName,
          requestId: item.id,
          requestStatus: item.status,
        })),
      )
      .sort((left, right) => new Date(right.occurredAt) - new Date(left.occurredAt)),
  };
}

function assertTransition(currentStatus, nextStatus, language = "es") {
  if (!REQUEST_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new Error(getDomainMessage("transition_not_allowed", language, { currentStatus, nextStatus }));
  }
}

async function savePolicies(policies) {
  writeCollection(STORAGE_KEYS.policies, policies);
  return policies;
}

async function saveRules(rules) {
  writeCollection(STORAGE_KEYS.rules, rules);
  return rules;
}

async function saveRequests(requests) {
  writeCollection(STORAGE_KEYS.requests, requests);
  return requests;
}

async function savePlans(plans) {
  writeCollection(STORAGE_KEYS.plans, plans);
  return plans;
}

export async function upsertVacationPolicy(payload) {
  const subsystem = await getVacationSubsystem();
  const nextPolicy = normalizeVacationPolicy({
    ...payload,
    id: payload.id || createVacationId("POL"),
    status: payload.status || "active",
  }, subsystem.organizations);
  const policies = [...subsystem.policies];
  const index = policies.findIndex((item) => item.id === nextPolicy.id);

  if (index >= 0) {
    policies[index] = nextPolicy;
  } else {
    policies.unshift(nextPolicy);
  }

  await savePolicies(policies);
  return nextPolicy;
}

export async function deleteVacationPolicy(policyId) {
  const subsystem = await getVacationSubsystem();
  const policies = subsystem.policies.filter((item) => item.id !== policyId);
  await savePolicies(policies);
  return { success: true, policyId };
}

export async function upsertVacationRule(payload) {
  const subsystem = await getVacationSubsystem();
  const nextRule = normalizeVacationRule({
    ...payload,
    id: payload.id || createVacationId("RULE"),
  }, subsystem.organizations);
  const rules = [...subsystem.rules];
  const index = rules.findIndex((item) => item.id === nextRule.id);

  if (index >= 0) {
    rules[index] = nextRule;
  } else {
    rules.unshift(nextRule);
  }

  await saveRules(rules);
  return nextRule;
}

export async function deleteVacationRule(ruleId) {
  const subsystem = await getVacationSubsystem();
  const rules = subsystem.rules.filter((item) => item.id !== ruleId);
  await saveRules(rules);
  return { success: true, ruleId };
}

export async function createVacationRequest(payload) {
  const subsystem = await getVacationSubsystem();
  const language = subsystem.language || "es";
  const employee = subsystem.employees.find((item) => item.id === payload.employeeId);

  if (!employee) {
    throw new Error(getDomainMessage("employee_not_found_request", language));
  }

  const policy = buildApplicablePolicy(employee, subsystem.policies, subsystem.organizations);
  const rules = getApplicableRules(employee, subsystem.rules, policy);
  const request = normalizeRequest(
    {
      ...payload,
      id: createVacationId("REQ"),
      status: payload.status || "draft",
      requestedAt: resolveCurrentDate(),
      requestedBy: payload.requestedBy || employee.name,
    },
    employee,
    policy,
    subsystem.approvalFlow,
    subsystem.holidays,
    language,
  );

  const employeeBalance = subsystem.balances.find((item) => item.employeeId === employee.id);
  const validation = buildValidation(request, employee, policy, subsystem.holidays, subsystem.requests, subsystem.employees, employeeBalance, rules, subsystem.plans);
  const nextRequest = {
    ...request,
    rules,
    exceptions: validation.exceptions,
    coverageRatio: validation.coverageRatio,
    impactPreview: buildImpactPreview(request, employeeBalance, validation, subsystem.requests),
    currentState: buildCurrentState(request),
    reconstructedHistory: buildReconstructedHistory(request.auditTrail),
    detailStatus: validation.exceptions.some((item) => item.severity === "critical") ? "attention" : "on_time",
    auditTrail: [
      buildAuditEvent(request.id, request.requestedBy, "request_created", "draft", request.status, request.note),
    ],
  };

  const requests = [nextRequest, ...subsystem.requests];
  await saveRequests(requests);
  return nextRequest;
}

export async function updateVacationRequest(requestId, payload) {
  const subsystem = await getVacationSubsystem();
  const language = subsystem.language || "es";
  const current = subsystem.requests.find((item) => item.id === requestId);
  if (!current) {
    throw new Error(getDomainMessage("request_not_found", language));
  }

  if (!["draft", "returned_for_changes"].includes(current.status)) {
    throw new Error(getDomainMessage("only_draft_or_returned_editable", language));
  }

  const employee = subsystem.employees.find((item) => item.id === current.employeeId);
  const policy = buildApplicablePolicy(employee, subsystem.policies, subsystem.organizations);
  const rules = getApplicableRules(employee, subsystem.rules, policy);
  const updated = normalizeRequest(
    {
      ...current,
      ...payload,
      status: payload.status || current.status,
      auditTrail: [
        ...(current.auditTrail || []),
        buildAuditEvent(requestId, payload.actor || current.requestedBy || employee.name, "request_updated", current.status, payload.status || current.status, payload.note || ""),
      ],
    },
    employee,
    policy,
    subsystem.approvalFlow,
    subsystem.holidays,
    language,
  );

  const employeeBalance = subsystem.balances.find((item) => item.employeeId === employee.id);
  const validation = buildValidation(updated, employee, policy, subsystem.holidays, subsystem.requests, subsystem.employees, employeeBalance, rules, subsystem.plans);
  const enriched = {
    ...updated,
    rules,
    exceptions: validation.exceptions,
    coverageRatio: validation.coverageRatio,
    impactPreview: buildImpactPreview(updated, employeeBalance, validation, subsystem.requests),
    currentState: buildCurrentState(updated),
    reconstructedHistory: buildReconstructedHistory(updated.auditTrail),
  };

  const requests = subsystem.requests.map((item) => (item.id === requestId ? enriched : item));
  await saveRequests(requests);
  return enriched;
}

export async function createVacationAmendment(requestId, payload = {}) {
  const subsystem = await getVacationSubsystem();
  const language = subsystem.language || "es";
  const source = subsystem.requests.find((item) => item.id === requestId);
  if (!source) {
    throw new Error(getDomainMessage("source_request_not_found", language));
  }

  if (!["approved", "scheduled", "consumed"].includes(source.status)) {
    throw new Error(getDomainMessage("only_approved_or_scheduled_amendable", language));
  }

  return createVacationRequest({
    employeeId: source.employeeId,
    startDate: payload.startDate || source.startDate,
    endDate: payload.endDate || source.endDate,
    note: payload.note || "Solicitud de modificacion sobre aprobacion previa.",
    status: "draft",
    requestMode: "amendment",
    parentRequestId: source.id,
    segments: payload.segments || source.segments || [],
    retroactive: payload.retroactive || false,
    accumulatedPeriods: payload.accumulatedPeriods || source.accumulatedPeriods || 1,
  });
}

function applyApprovalDecision(request, actor, decision, note, delegateTo = "", language = "es") {
  const steps = (request.approvalSteps || []).map((item) => ({ ...item }));
  const pendingStep = steps.find((item) => item.status === "pending");

  if (!pendingStep && decision !== "cancelled") {
    throw new Error(getDomainMessage("no_pending_step", language));
  }

  if (decision === "delegate") {
    pendingStep.delegatedTo = delegateTo;
    pendingStep.status = "delegated";
    return {
      ...request,
      approvalSteps: steps,
      currentApprover: delegateTo,
      auditTrail: [
        ...(request.auditTrail || []),
        buildAuditEvent(request.id, actor, "approval_delegated", request.status, request.status, note || `Delegado a ${delegateTo}.`, { delegatedTo: delegateTo }),
      ],
    };
  }

  if (decision === "approve") {
    pendingStep.status = "approved";
    pendingStep.actedAt = new Date().toISOString();
    pendingStep.note = note;
    const nextPending = steps.find((item) => item.status === "pending");
    const nextStatus = nextPending
      ? (nextPending.role === "manager" ? "pending_manager_approval" : "pending_hr_approval")
      : "approved";

    return {
      ...request,
      status: nextStatus,
      approvalSteps: steps,
      currentApprover: nextPending?.delegatedTo || nextPending?.actor || localizeOrgLabel("Closed", language),
      currentLevel: nextPending?.sequence || request.totalLevels,
      currentStepId: nextPending?.id || "",
      auditTrail: [
        ...(request.auditTrail || []),
        buildAuditEvent(request.id, actor, "approved", request.status, nextStatus, note),
      ],
    };
  }

  if (decision === "reject") {
    pendingStep.status = "rejected";
    pendingStep.actedAt = new Date().toISOString();
    pendingStep.note = note;
    return {
      ...request,
      status: "rejected",
      rejectionReason: note,
      approvalSteps: steps,
      currentApprover: localizeOrgLabel("Closed", language),
      currentStepId: "",
      auditTrail: [
        ...(request.auditTrail || []),
        buildAuditEvent(request.id, actor, "rejected", request.status, "rejected", note),
      ],
    };
  }

  if (decision === "return") {
    pendingStep.status = "returned";
    pendingStep.actedAt = new Date().toISOString();
    pendingStep.note = note;
    return {
      ...request,
      status: "returned_for_changes",
      returnReason: note,
      approvalSteps: steps,
      currentApprover: request.requestedBy,
      currentStepId: "",
      auditTrail: [
        ...(request.auditTrail || []),
        buildAuditEvent(request.id, actor, "returned_for_changes", request.status, "returned_for_changes", note),
      ],
    };
  }

  return request;
}

export async function transitionVacationRequest(requestId, action, payload = {}) {
  const subsystem = await getVacationSubsystem();
  const language = subsystem.language || "es";
  const current = subsystem.requests.find((item) => item.id === requestId);
  if (!current) {
    throw new Error(getDomainMessage("request_not_found", language));
  }

  const actor = payload.actor || "HR Operations";
  let next = current;

  switch (action) {
    case "submit":
      assertTransition(current.status, "submitted", language);
      next = {
        ...current,
        status: "submitted",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "submitted", current.status, "submitted", payload.note || ""),
        ],
      };
      break;
    case "route_to_review":
      assertTransition(current.status, "under_review", language);
      next = {
        ...current,
        status: "under_review",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "routed_to_review", current.status, "under_review", payload.note || ""),
        ],
      };
      break;
    case "manager_queue":
      assertTransition(current.status, "pending_manager_approval", language);
      next = {
        ...current,
        status: "pending_manager_approval",
        currentApprover: current.approvalSteps?.[0]?.actor || current.manager,
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "queued_for_manager", current.status, "pending_manager_approval", payload.note || ""),
        ],
      };
      break;
    case "approve":
      next = applyApprovalDecision(current, actor, "approve", payload.note || "", "", language);
      break;
    case "reject":
      if (!payload.note) {
        throw new Error(getDomainMessage("reject_reason_required", language));
      }
      next = applyApprovalDecision(current, actor, "reject", payload.note, "", language);
      break;
    case "return":
      if (!payload.note) {
        throw new Error(getDomainMessage("return_reason_required", language));
      }
      next = applyApprovalDecision(current, actor, "return", payload.note, "", language);
      break;
    case "delegate":
      if (!payload.delegateTo) {
        throw new Error(getDomainMessage("delegate_target_required", language));
      }
      next = applyApprovalDecision(current, actor, "delegate", payload.note || "", payload.delegateTo, language);
      break;
    case "cancel":
      next = {
        ...current,
        status: "cancelled",
        currentApprover: localizeOrgLabel("Closed", language),
        currentStepId: "",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "cancelled", current.status, "cancelled", payload.note || ""),
        ],
      };
      break;
    case "schedule":
      assertTransition(current.status, "scheduled", language);
      next = {
        ...current,
        status: "scheduled",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "scheduled", current.status, "scheduled", payload.note || ""),
        ],
      };
      break;
    case "consume":
      assertTransition(current.status, "consumed", language);
      next = {
        ...current,
        status: "consumed",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "consumed", current.status, "consumed", payload.note || ""),
        ],
      };
      break;
    case "expire":
      if (!["scheduled", "approved"].includes(current.status)) {
        throw new Error(getDomainMessage("only_approved_or_scheduled_expire", language));
      }
      next = {
        ...current,
        status: "expired",
        auditTrail: [
          ...(current.auditTrail || []),
          buildAuditEvent(requestId, actor, "expired", current.status, "expired", payload.note || ""),
        ],
      };
      break;
    default:
      throw new Error(getDomainMessage("unsupported_action", language, { action }));
  }

  const requests = subsystem.requests.map((item) => (item.id === requestId ? next : item));
  await saveRequests(requests);
  await syncEmployeeLeave(next, next.status);
  return next;
}

export async function upsertVacationPlan(payload) {
  const subsystem = await getVacationSubsystem();
  const nextPlan = {
    ...vacationPlanSchema,
    ...payload,
    id: payload.id || createVacationId("PLN"),
  };
  const plans = [...subsystem.plans];
  const index = plans.findIndex((item) => item.id === nextPlan.id);

  if (index >= 0) {
    plans[index] = nextPlan;
  } else {
    plans.unshift(nextPlan);
  }

  await savePlans(plans);
  return nextPlan;
}

export async function getVacationRequestById(requestId) {
  const subsystem = await getVacationSubsystem();
  return subsystem.requests.find((item) => item.id === requestId) || null;
}

export async function simulateVacationImpact(payload) {
  const subsystem = await getVacationSubsystem();
  const language = subsystem.language || "es";
  const employee = subsystem.employees.find((item) => item.id === payload.employeeId);
  if (!employee) {
    throw new Error(getDomainMessage("employee_not_found_simulation", language));
  }

  const policy = buildApplicablePolicy(employee, subsystem.policies, subsystem.organizations);
  const rules = getApplicableRules(employee, subsystem.rules, policy);
  const draftRequest = normalizeRequest(
    {
      ...payload,
      id: payload.id || createVacationId("SIM"),
      requestedBy: payload.requestedBy || employee.name,
      requestedAt: resolveCurrentDate(),
      status: payload.status || "draft",
    },
    employee,
    policy,
    subsystem.approvalFlow,
    subsystem.holidays,
    language,
  );
  const balance = subsystem.balances.find((item) => item.employeeId === employee.id);
  const validation = buildValidation(
    draftRequest,
    employee,
    policy,
    subsystem.holidays,
    subsystem.requests,
    subsystem.employees,
    balance,
    rules,
    subsystem.plans,
  );

  return {
    request: draftRequest,
    policy,
    rules,
    preview: buildImpactPreview(draftRequest, balance, validation, subsystem.requests),
    validation,
  };
}

export default {
  getVacationSubsystem,
  getVacationRequestById,
  simulateVacationImpact,
  createVacationRequest,
  createVacationAmendment,
  updateVacationRequest,
  transitionVacationRequest,
  upsertVacationPolicy,
  deleteVacationPolicy,
  upsertVacationRule,
  deleteVacationRule,
  upsertVacationPlan,
};
