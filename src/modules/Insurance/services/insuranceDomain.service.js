import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import { validateInsuranceEnrollmentInput } from "../schemas/insuranceEnrollment.schema";
import { validateInsuranceMovementInput } from "../schemas/insuranceMovement.schema";
import { validateInsurancePlanInput } from "../schemas/insurancePlan.schema";
import {
  buildInsuranceDistribution,
  createInsuranceId,
  formatInsuranceCurrency,
  roundCurrency,
  slugifyInsurance,
  sumBy,
} from "../utils/insurance.helpers";

const STORAGE_KEYS = {
  plans: "mgahrcore.insurance.plans",
  enrollments: "mgahrcore.insurance.enrollments",
  movements: "mgahrcore.insurance.movements",
  auditLog: "mgahrcore.insurance.auditLog",
};

export const INSURANCE_WORKFLOW = {
  inclusion: ["draft", "submitted", "hr_review", "provider_review", "approved", "scheduled", "completed", "rejected", "returned"],
  exclusion: ["draft", "submitted", "hr_review", "approved", "scheduled", "completed", "rejected", "returned"],
  plan_change: ["draft", "submitted", "hr_review", "provider_review", "approved", "scheduled", "completed", "rejected", "returned"],
};

const WORKFLOW_ACTIONS = {
  draft: ["submit"],
  submitted: ["start_review", "return", "reject"],
  hr_review: ["approve_hr", "return", "reject"],
  provider_review: ["approve_provider", "return", "reject"],
  approved: ["schedule"],
  scheduled: ["complete", "return"],
  returned: ["resubmit"],
  completed: [],
  rejected: [],
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

function localizeInsurance(es, en) {
  return getLanguage() === "en" ? en : es;
}

function assertInsuranceValid(errors = []) {
  if (errors.length) {
    throw new Error(errors[0]);
  }
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

function createWorkflowTrailEntry({ fromStatus = "", toStatus, action, actor, comment = "" }) {
  return {
    id: createInsuranceId("WF"),
    fromStatus,
    toStatus,
    action,
    actor,
    comment,
    changedAt: new Date().toISOString(),
  };
}

function appendAuditEntry(auditLog = [], entry) {
  return [entry, ...auditLog].slice(0, 400);
}

function createAuditEntry({
  entityType,
  entityId,
  employeeId = "",
  employeeName = "",
  action,
  summary,
  before = null,
  after = null,
  metadata = {},
}) {
  return {
    id: createInsuranceId("AUD"),
    entityType,
    entityId,
    employeeId,
    employeeName,
    action,
    summary,
    actor: getActor(),
    timestamp: new Date().toISOString(),
    before,
    after,
    metadata,
  };
}

function getPlanEligibility(plan, organizations) {
  const levelNames = (plan.allowedLevelIds || []).map((levelId) =>
    organizations.levels.find((item) => item.id === levelId)?.name).filter(Boolean);

  return {
    employeeTypes: plan.allowedEmployeeTypes || [],
    levels: levelNames,
    companyId: plan.companyId,
    companyName: plan.companyName,
  };
}

function isEmployeeEligibleForPlan(employee, plan) {
  const employeeTypes = plan.allowedEmployeeTypes || [];
  const allowedLevels = plan.allowedLevelIds || [];

  if (plan.companyId && employee.companyId !== plan.companyId) {
    return false;
  }

  if (employeeTypes.length && !employeeTypes.includes(employee.employeeType)) {
    return false;
  }

  if (allowedLevels.length && !allowedLevels.includes(employee.levelId)) {
    return false;
  }

  return true;
}

function buildLifecycleEvents(employees, enrollments, movements) {
  const movementEvents = movements.map((movement) => ({
    id: `EVT-MOV-${movement.id}`,
    employeeId: movement.employeeId,
    employeeName: movement.employeeName,
    type: movement.type,
    effectiveDate: movement.effectiveDate || movement.createdAt?.slice(0, 10) || "",
    status: movement.status,
    description: movement.reason,
    source: "insurance",
  }));

  const employeeEvents = employees.flatMap((employee) => {
    const dependents = (employee.dependents || []).map((dependent) => ({
      id: `EVT-DEP-${employee.id}-${dependent.id}`,
      employeeId: employee.id,
      employeeName: employee.name,
      type: "dependent_add",
      effectiveDate: dependent.birthDate || employee.startDate || "",
      status: "completed",
      description: `${dependent.name} - ${dependent.relationship}`,
      source: "employees",
    }));

    const statusEvent = employee.status !== "active"
      ? [{
          id: `EVT-STS-${employee.id}`,
          employeeId: employee.id,
          employeeName: employee.name,
          type: "status_change",
          effectiveDate: employee.startDate || "",
          status: employee.status,
          description: `Estado actual ${employee.status}`,
          source: "employees",
        }]
      : [];

    const hireEvent = employee.startDate
      ? [{
          id: `EVT-HIRE-${employee.id}`,
          employeeId: employee.id,
          employeeName: employee.name,
          type: "new_hire",
          effectiveDate: employee.startDate,
          status: "completed",
          description: "Alta del colaborador",
          source: "employees",
        }]
      : [];

    return [...hireEvent, ...dependents, ...statusEvent];
  });

  const enrollmentEvents = enrollments.map((enrollment) => ({
    id: `EVT-ENR-${enrollment.id}`,
    employeeId: enrollment.employeeId,
    employeeName: enrollment.employeeName,
    type: "coverage_active",
    effectiveDate: enrollment.effectiveDate,
    status: enrollment.status,
    description: enrollment.planName,
    source: "insurance",
  }));

  return [...movementEvents, ...employeeEvents, ...enrollmentEvents]
    .sort((left, right) => new Date(right.effectiveDate || right.timestamp || 0) - new Date(left.effectiveDate || left.timestamp || 0));
}

function getPlanSeedTemplates(language = "es") {
  return language === "en"
    ? [
        {
          type: "Medical",
          provider: "GlobalCare Alliance",
          namePrefix: "Corporate Health",
          coverageScope: "Employee",
          conditions: "Primary healthcare, hospitalization, annual check-up, and outpatient coverage.",
          employerShare: 78,
          employeeShare: 22,
          baseEmployeeCost: 780,
          baseDependentCost: 320,
        },
        {
          type: "Medical Family",
          provider: "GlobalCare Alliance",
          namePrefix: "Family Health",
          coverageScope: "Employee + dependents",
          conditions: "Extended family coverage with maternity, pediatrics, and emergency rider.",
          employerShare: 72,
          employeeShare: 28,
          baseEmployeeCost: 1020,
          baseDependentCost: 410,
        },
        {
          type: "Life & Accident",
          provider: "Aegis Benefits Group",
          namePrefix: "Life Shield",
          coverageScope: "Employee",
          conditions: "Life, accident, disability support, and critical event assistance.",
          employerShare: 85,
          employeeShare: 15,
          baseEmployeeCost: 220,
          baseDependentCost: 0,
        },
      ]
    : [
        {
          type: "Salud",
          provider: "GlobalCare Alliance",
          namePrefix: "Salud corporativa",
          coverageScope: "Colaborador",
          conditions: "Atencion primaria, hospitalizacion, chequeo anual y cobertura ambulatoria.",
          employerShare: 78,
          employeeShare: 22,
          baseEmployeeCost: 780,
          baseDependentCost: 320,
        },
        {
          type: "Salud familiar",
          provider: "GlobalCare Alliance",
          namePrefix: "Salud familiar",
          coverageScope: "Colaborador + dependientes",
          conditions: "Cobertura familiar ampliada con maternidad, pediatria y emergencias.",
          employerShare: 72,
          employeeShare: 28,
          baseEmployeeCost: 1020,
          baseDependentCost: 410,
        },
        {
          type: "Vida y accidentes",
          provider: "Aegis Benefits Group",
          namePrefix: "Vida protegida",
          coverageScope: "Colaborador",
          conditions: "Vida, accidentes, invalidez y acompanamiento en eventos criticos.",
          employerShare: 85,
          employeeShare: 15,
          baseEmployeeCost: 220,
          baseDependentCost: 0,
        },
      ];
}

function createSeedPlans(companies = [], employees = [], language = "es") {
  const templates = getPlanSeedTemplates(language);

  return companies.flatMap((company) => {
    const companyEmployees = employees.filter((employee) => employee.companyId === company.id || employee.company === company.name);
    if (!companyEmployees.length) {
      return [];
    }

    const hasDependents = companyEmployees.some((employee) => (employee.dependents || []).length);

    return templates
      .filter((template) => hasDependents || !String(template.coverageScope).toLowerCase().includes("depend"))
      .map((template, index) => ({
        id: createInsuranceId("PLAN"),
        code: `${slugifyInsurance(company.name).toUpperCase().slice(0, 8)}-${index + 1}`,
        companyId: company.id,
        companyName: company.name,
        companyCurrency: company.baseCurrency || "BOB",
        name: `${template.namePrefix} ${company.name}`,
        provider: template.provider,
        type: template.type,
        coverageScope: template.coverageScope,
        status: "active",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        employerShare: template.employerShare,
        employeeShare: template.employeeShare,
        baseEmployeeCost: template.baseEmployeeCost,
        baseDependentCost: template.baseDependentCost,
        coverage: template.coverageScope,
        conditions: template.conditions,
        deductible: company.baseCurrency === "USD" ? 150 : 900,
      }));
  });
}

function findPreferredPlan(employee, plans = []) {
  const companyPlans = plans.filter((plan) => plan.companyId === employee.companyId);
  const familyPlan = companyPlans.find((plan) => String(plan.coverageScope).toLowerCase().includes("depend"));
  const basePlan = companyPlans.find((plan) => !String(plan.coverageScope).toLowerCase().includes("depend"));
  return (employee.dependents || []).length ? familyPlan || basePlan || companyPlans[0] : basePlan || companyPlans[0];
}

function calculateEnrollmentCosts(plan, dependentCount = 0) {
  const employeeCostBase = Number(plan?.baseEmployeeCost) || 0;
  const dependentsCost = (Number(plan?.baseDependentCost) || 0) * dependentCount;
  const total = employeeCostBase + dependentsCost;
  const employerCost = roundCurrency(total * ((Number(plan?.employerShare) || 0) / 100));
  const employeeCost = roundCurrency(total - employerCost);

  return {
    employerCost,
    employeeCost,
    totalCost: roundCurrency(total),
  };
}

function createSeedEnrollment(employee, plan, actor) {
  const dependentIds = (employee.dependents || []).map((dependent) => dependent.id);
  const activeDependents = String(plan.coverageScope).toLowerCase().includes("depend") ? dependentIds : [];
  const costs = calculateEnrollmentCosts(plan, activeDependents.length);

  return {
    id: createInsuranceId("ENR"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId,
    companyName: employee.company,
    companyCurrency: plan.companyCurrency,
    departmentName: employee.department,
    positionName: employee.position,
    employeeType: employee.employeeType,
    status: employee.status === "active" ? "active" : "pending",
    planId: plan.id,
    planName: plan.name,
    provider: plan.provider,
    requestType: "inclusion",
    workflowStatus: employee.status === "active" ? "completed" : "submitted",
    workflowTrail: [
      createWorkflowTrailEntry({
        fromStatus: "",
        toStatus: employee.status === "active" ? "completed" : "submitted",
        action: employee.status === "active" ? "seed_complete" : "seed_submit",
        actor,
        comment: "Inicializacion automatica del modulo",
      }),
    ],
    enrollmentDate: employee.startDate || "2026-01-01",
    effectiveDate: employee.startDate || "2026-01-01",
    terminationDate: "",
    coverageTier: activeDependents.length ? "employee_plus_dependents" : "employee_only",
    dependentIds: activeDependents,
    notes: "",
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
    ...costs,
  };
}

function createSeedMovement(enrollment, employee, actor) {
  return {
    id: createInsuranceId("MOV"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId,
    companyName: employee.company,
    type: "inclusion",
    status: enrollment.status === "active" ? "completed" : "pending",
    workflowStatus: enrollment.workflowStatus,
    workflowTrail: deepClone(enrollment.workflowTrail || []),
    reason: employee.status === "active" ? "Alta inicial del colaborador" : "Ingreso pendiente de activacion",
    effectiveDate: enrollment.effectiveDate,
    fromPlanId: "",
    fromPlanName: "",
    toPlanId: enrollment.planId,
    toPlanName: enrollment.planName,
    comments: "",
    initiatedBy: actor,
    createdAt: new Date().toISOString(),
  };
}

function createSeedDomain(organizations, employees) {
  const language = getLanguage();
  const actor = getActor();
  const plans = createSeedPlans(organizations.companies || [], employees, language);
  const enrollments = employees
    .filter((employee) => employee.status === "active" || employee.status === "leave")
    .map((employee) => {
      const plan = findPreferredPlan(employee, plans);
      return plan ? createSeedEnrollment(employee, plan, actor) : null;
    })
    .filter(Boolean);
  const movements = enrollments.map((enrollment) => {
    const employee = employees.find((item) => item.id === enrollment.employeeId);
    return createSeedMovement(enrollment, employee, actor);
  });

  const auditLog = [
    createAuditEntry({
      entityType: "seed",
      entityId: "insurance-domain",
      action: "seed_initialized",
      summary: "Dominio Insurance inicializado a partir de Employees y Administration.",
      after: {
        plans: plans.length,
        enrollments: enrollments.length,
        movements: movements.length,
      },
    }),
  ];

  return { plans, enrollments, movements, auditLog };
}

function sanitizePlans(plans, organizations) {
  const companyIds = new Set((organizations.companies || []).map((company) => company.id));
  return plans
    .filter((plan) => companyIds.has(plan.companyId))
    .map((plan) => ({
      ...plan,
      status: plan.status || "active",
      companyCurrency: plan.companyCurrency || organizations.companies.find((company) => company.id === plan.companyId)?.baseCurrency || "BOB",
      allowedEmployeeTypes: Array.isArray(plan.allowedEmployeeTypes) ? plan.allowedEmployeeTypes : [],
      allowedLevelIds: Array.isArray(plan.allowedLevelIds) ? plan.allowedLevelIds : [],
    }));
}

function sanitizeEnrollments(enrollments, plans, employees) {
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]));
  const plansById = new Map(plans.map((plan) => [plan.id, plan]));

  return enrollments
    .filter((enrollment) => employeesById.has(enrollment.employeeId) && plansById.has(enrollment.planId))
    .map((enrollment) => {
      const employee = employeesById.get(enrollment.employeeId);
      const plan = plansById.get(enrollment.planId);
      const validDependentIds = new Set((employee.dependents || []).map((dependent) => dependent.id));
      const dependentIds = (enrollment.dependentIds || []).filter((dependentId) => validDependentIds.has(dependentId));
      const costs = calculateEnrollmentCosts(plan, dependentIds.length);

      return {
        ...enrollment,
        employeeName: employee.name,
        companyId: employee.companyId,
        companyName: employee.company,
        companyCurrency: plan.companyCurrency,
        departmentName: employee.department,
        positionName: employee.position,
        employeeType: employee.employeeType,
        planName: plan.name,
        provider: plan.provider,
        requestType: enrollment.requestType || "inclusion",
        workflowStatus: enrollment.workflowStatus || (enrollment.status === "active" ? "completed" : "submitted"),
        workflowTrail: Array.isArray(enrollment.workflowTrail) ? enrollment.workflowTrail : [],
        eligibilitySnapshot: enrollment.eligibilitySnapshot || {
          employeeType: employee.employeeType,
          levelId: employee.levelId,
          companyId: employee.companyId,
        },
        dependentIds,
        ...costs,
      };
    });
}

function sanitizeMovements(movements, plans, employees) {
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const planIds = new Set(plans.map((plan) => plan.id));
  return movements.filter((movement) =>
    employeeIds.has(movement.employeeId)
    && (!movement.fromPlanId || planIds.has(movement.fromPlanId))
    && (!movement.toPlanId || planIds.has(movement.toPlanId)))
    .map((movement) => ({
      ...movement,
      workflowStatus: movement.workflowStatus || movement.status || "submitted",
      workflowTrail: Array.isArray(movement.workflowTrail) ? movement.workflowTrail : [],
    }));
}

function normalizeDependents(enrollments, employees, plans) {
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]));
  const plansById = new Map(plans.map((plan) => [plan.id, plan]));

  return enrollments.flatMap((enrollment) => {
    const employee = employeesById.get(enrollment.employeeId);
    const plan = plansById.get(enrollment.planId);
    const dependents = (employee?.dependents || []).filter((dependent) => (enrollment.dependentIds || []).includes(dependent.id));

    return dependents.map((dependent) => ({
      id: `${enrollment.id}-${dependent.id}`,
      enrollmentId: enrollment.id,
      employeeId: employee.id,
      employeeName: employee.name,
      dependentId: dependent.id,
      dependentName: dependent.name,
      relationship: dependent.relationship,
      birthDate: dependent.birthDate,
      beneficiary: dependent.beneficiary,
      planId: enrollment.planId,
      planName: enrollment.planName,
      provider: plan?.provider || enrollment.provider,
      companyId: employee.companyId,
      companyName: employee.company,
      status: enrollment.status,
      cost: roundCurrency(Number(plan?.baseDependentCost) || 0),
    }));
  });
}

export async function getInsuranceDomain() {
  const [organizations, employees] = await Promise.all([
    administrationService.getOrganizations(),
    employeesService.getEmployees(),
  ]);

  const rawPlans = readCollection(STORAGE_KEYS.plans);
  const rawEnrollments = readCollection(STORAGE_KEYS.enrollments);
  const rawMovements = readCollection(STORAGE_KEYS.movements);
  const rawAuditLog = readCollection(STORAGE_KEYS.auditLog);
  const seedRequired = rawPlans.length === 0 && rawEnrollments.length === 0 && rawMovements.length === 0;
  const seeded = seedRequired
    ? createSeedDomain(organizations, employees)
    : { plans: rawPlans, enrollments: rawEnrollments, movements: rawMovements, auditLog: rawAuditLog };

  const plans = sanitizePlans(seeded.plans, organizations);
  const enrollments = sanitizeEnrollments(seeded.enrollments, plans, employees);
  const movements = sanitizeMovements(seeded.movements, plans, employees);
  const dependents = normalizeDependents(enrollments, employees, plans);
  const auditLog = Array.isArray(seeded.auditLog) ? seeded.auditLog.filter((entry) =>
    !entry.employeeId || employees.some((employee) => employee.id === entry.employeeId)) : [];
  const lifecycleEvents = buildLifecycleEvents(employees, enrollments, movements);

  if (seedRequired || plans.length !== rawPlans.length || enrollments.length !== rawEnrollments.length || movements.length !== rawMovements.length || auditLog.length !== rawAuditLog.length) {
    writeCollection(STORAGE_KEYS.plans, plans);
    writeCollection(STORAGE_KEYS.enrollments, enrollments);
    writeCollection(STORAGE_KEYS.movements, movements);
    writeCollection(STORAGE_KEYS.auditLog, auditLog);
  }

  return { organizations, employees, plans, enrollments, dependents, movements, auditLog, lifecycleEvents };
}

export async function saveInsurancePlan(planInput) {
  const domain = await getInsuranceDomain();
  const company = domain.organizations.companies.find((item) => item.id === planInput.companyId);
  assertInsuranceValid(validateInsurancePlanInput(planInput));
  const previous = domain.plans.find((item) => item.id === planInput.id) || null;
  const payload = {
    id: planInput.id || createInsuranceId("PLAN"),
    code: planInput.code || `${slugifyInsurance(planInput.name).toUpperCase().slice(0, 12) || "PLAN"}-${new Date().getFullYear()}`,
    companyId: planInput.companyId || company?.id || "",
    companyName: company?.name || planInput.companyName || "",
    companyCurrency: company?.baseCurrency || planInput.companyCurrency || "BOB",
    name: planInput.name || "",
    provider: planInput.provider || "",
    type: planInput.type || "",
    coverageScope: planInput.coverageScope || "",
    status: planInput.status || "active",
    allowedEmployeeTypes: Array.isArray(planInput.allowedEmployeeTypes) ? planInput.allowedEmployeeTypes : [],
    allowedLevelIds: Array.isArray(planInput.allowedLevelIds) ? planInput.allowedLevelIds : [],
    effectiveFrom: planInput.effectiveFrom || "",
    effectiveTo: planInput.effectiveTo || "",
    employerShare: Number(planInput.employerShare) || 0,
    employeeShare: Number(planInput.employeeShare) || 0,
    baseEmployeeCost: Number(planInput.baseEmployeeCost) || 0,
    baseDependentCost: Number(planInput.baseDependentCost) || 0,
    coverage: planInput.coverage || "",
    conditions: planInput.conditions || "",
    deductible: Number(planInput.deductible) || 0,
  };

  const plans = [...domain.plans];
  const index = plans.findIndex((item) => item.id === payload.id);
  if (index >= 0) {
    plans[index] = payload;
  } else {
    plans.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.plans, plans);
  writeCollection(STORAGE_KEYS.auditLog, appendAuditEntry(domain.auditLog, createAuditEntry({
    entityType: "plan",
    entityId: payload.id,
    action: previous ? "plan_updated" : "plan_created",
    summary: previous ? `Plan ${payload.name} actualizado.` : `Plan ${payload.name} creado.`,
    before: previous,
    after: payload,
    metadata: {
      companyId: payload.companyId,
      eligibility: getPlanEligibility(payload, domain.organizations),
    },
  })));
  return payload;
}

export async function saveInsuranceEnrollment(input) {
  const domain = await getInsuranceDomain();
  const employee = domain.employees.find((item) => item.id === input.employeeId);
  const plan = domain.plans.find((item) => item.id === input.planId);
  if (!employee || !plan) {
    throw new Error(localizeInsurance("La afiliacion requiere un colaborador y un plan validos.", "Insurance enrollment requires a valid employee and plan."));
  }
  assertInsuranceValid(validateInsuranceEnrollmentInput({
    employee,
    plan,
    input,
    currentEnrollments: domain.enrollments,
  }));
  if (!isEmployeeEligibleForPlan(employee, plan)) {
    throw new Error(localizeInsurance("El colaborador no es elegible para el plan seleccionado.", "Employee is not eligible for the selected insurance plan."));
  }

  const dependentIds = (input.dependentIds || []).filter((dependentId) =>
    (employee.dependents || []).some((dependent) => dependent.id === dependentId));
  const costs = calculateEnrollmentCosts(plan, dependentIds.length);
  const previousEnrollment = domain.enrollments.find((item) => item.id === input.id) || null;
  const workflowStatus = input.workflowStatus || (input.status === "active" ? "completed" : "submitted");
  const previousWorkflowTrail = Array.isArray(previousEnrollment?.workflowTrail) ? previousEnrollment.workflowTrail : [];
  const workflowTrail = input.appendWorkflowEntry
    ? [...previousWorkflowTrail, createWorkflowTrailEntry(input.appendWorkflowEntry)]
    : previousWorkflowTrail.length
      ? previousWorkflowTrail
      : [createWorkflowTrailEntry({
          fromStatus: "",
          toStatus: workflowStatus,
          action: previousEnrollment ? "update" : "create",
          actor: getActor(),
          comment: input.reason || "",
        })];
  const payload = {
    id: input.id || createInsuranceId("ENR"),
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId,
    companyName: employee.company,
    companyCurrency: employee.companyCurrency || plan.companyCurrency,
    departmentName: employee.department,
    positionName: employee.position,
    employeeType: employee.employeeType,
    status: input.status || "active",
    requestType: input.requestType || "inclusion",
    workflowStatus,
    workflowTrail,
    planId: plan.id,
    planName: plan.name,
    provider: plan.provider,
    enrollmentDate: input.enrollmentDate || new Date().toISOString().slice(0, 10),
    effectiveDate: input.effectiveDate || new Date().toISOString().slice(0, 10),
    terminationDate: input.terminationDate || "",
    coverageTier: dependentIds.length ? "employee_plus_dependents" : "employee_only",
    dependentIds,
    notes: input.notes || "",
    eligibilitySnapshot: {
      employeeType: employee.employeeType,
      levelId: employee.levelId,
      companyId: employee.companyId,
    },
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
    ...costs,
  };

  const enrollments = [...domain.enrollments];
  const index = enrollments.findIndex((item) => item.id === payload.id);
  const previous = index >= 0 ? enrollments[index] : null;
  if (index >= 0) {
    enrollments[index] = payload;
  } else {
    enrollments.unshift(payload);
  }

  writeCollection(STORAGE_KEYS.enrollments, enrollments);

  const movements = [...domain.movements];
  const movementRecord = {
    id: createInsuranceId("MOV"),
    enrollmentId: payload.id,
    employeeId: employee.id,
    employeeName: employee.name,
    companyId: employee.companyId,
    companyName: employee.company,
    companyCurrency: employee.companyCurrency || plan.companyCurrency,
    type: previousEnrollment ? "plan_change" : "inclusion",
    status: payload.status === "active" ? "completed" : "pending",
    workflowStatus: payload.workflowStatus,
    workflowTrail: deepClone(payload.workflowTrail),
    reason: input.reason || (previousEnrollment ? "Actualizacion de afiliacion" : "Nueva afiliacion"),
    effectiveDate: payload.effectiveDate,
    fromPlanId: previousEnrollment?.planId || "",
    fromPlanName: previousEnrollment?.planName || "",
    toPlanId: payload.planId,
    toPlanName: payload.planName,
    comments: payload.notes,
    initiatedBy: getActor(),
    createdAt: new Date().toISOString(),
  };
  movements.unshift(movementRecord);
  writeCollection(STORAGE_KEYS.movements, movements);
  writeCollection(STORAGE_KEYS.auditLog, appendAuditEntry(domain.auditLog, createAuditEntry({
    entityType: "enrollment",
    entityId: payload.id,
    employeeId: employee.id,
    employeeName: employee.name,
    action: previous ? "enrollment_updated" : "enrollment_created",
    summary: previous ? `Afiliacion de ${employee.name} actualizada.` : `Afiliacion de ${employee.name} creada.`,
    before: previous,
    after: payload,
    metadata: {
      movementId: movementRecord.id,
      requestType: payload.requestType,
      workflowStatus: payload.workflowStatus,
    },
  })));

  return payload;
}

export async function saveInsuranceExclusion(input) {
  const domain = await getInsuranceDomain();
  const enrollment = domain.enrollments.find((item) => item.id === input.enrollmentId);
  if (!enrollment) {
    throw new Error(localizeInsurance("El movimiento requiere una afiliacion valida.", "Insurance exclusion requires a valid enrollment."));
  }
  const currentPlan = domain.plans.find((item) => item.id === enrollment.planId);
  const employee = domain.employees.find((item) => item.id === enrollment.employeeId);
  const newPlan = input.newPlanId ? domain.plans.find((item) => item.id === input.newPlanId) : null;
  assertInsuranceValid(validateInsuranceMovementInput({
    enrollment,
    newPlan,
    employee,
    input,
  }));
  if (input.type === "plan_change" && newPlan && employee && !isEmployeeEligibleForPlan(employee, newPlan)) {
    throw new Error(localizeInsurance("El colaborador no es elegible para el plan destino.", "Employee is not eligible for the destination insurance plan."));
  }

  const enrollments = [...domain.enrollments];
  const index = enrollments.findIndex((item) => item.id === enrollment.id);
  const nextStatus = input.type === "plan_change" ? "change_pending" : "excluded";
  const workflowStatus = input.workflowStatus || (input.status === "completed" ? "completed" : "submitted");
  const workflowTrail = [
    ...(Array.isArray(enrollment.workflowTrail) ? enrollment.workflowTrail : []),
    createWorkflowTrailEntry({
      fromStatus: enrollment.workflowStatus || "",
      toStatus: workflowStatus,
      action: input.type === "plan_change" ? "plan_change_request" : "exclusion_request",
      actor: getActor(),
      comment: input.comments || input.reason || "",
    }),
  ];
  const updatedEnrollment = {
    ...enrollment,
    status: nextStatus,
    requestType: input.type || "exclusion",
    workflowStatus,
    workflowTrail,
    terminationDate: input.effectiveDate || enrollment.terminationDate || "",
    notes: input.comments || enrollment.notes,
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };
  enrollments[index] = updatedEnrollment;
  writeCollection(STORAGE_KEYS.enrollments, enrollments);

  const movements = [...domain.movements];
  const movementRecord = {
    id: createInsuranceId("MOV"),
    enrollmentId: enrollment.id,
    employeeId: enrollment.employeeId,
    employeeName: enrollment.employeeName,
    companyId: enrollment.companyId,
    companyName: enrollment.companyName,
    type: input.type || "exclusion",
    status: input.status || "submitted",
    workflowStatus,
    workflowTrail: deepClone(workflowTrail),
    reason: input.reason || "",
    effectiveDate: input.effectiveDate || new Date().toISOString().slice(0, 10),
    fromPlanId: enrollment.planId,
    fromPlanName: enrollment.planName,
    toPlanId: input.newPlanId || "",
    toPlanName: newPlan?.name || "",
    comments: input.comments || "",
    initiatedBy: getActor(),
    createdAt: new Date().toISOString(),
  };
  movements.unshift(movementRecord);
  writeCollection(STORAGE_KEYS.movements, movements);
  writeCollection(STORAGE_KEYS.auditLog, appendAuditEntry(domain.auditLog, createAuditEntry({
    entityType: "movement",
    entityId: movementRecord.id,
    employeeId: enrollment.employeeId,
    employeeName: enrollment.employeeName,
    action: input.type || "exclusion",
    summary: input.type === "plan_change"
      ? `Cambio de plan solicitado para ${enrollment.employeeName}.`
      : `Baja de cobertura solicitada para ${enrollment.employeeName}.`,
    before: {
      enrollment,
      currentPlan,
    },
    after: {
      enrollment: updatedEnrollment,
      destinationPlan: newPlan,
    },
    metadata: {
      effectiveDate: movementRecord.effectiveDate,
      workflowStatus,
    },
  })));

  return updatedEnrollment;
}

export async function getInsuranceAnalytics() {
  const domain = await getInsuranceDomain();
  const activeEnrollments = domain.enrollments.filter((item) => item.status === "active");
  const excludedMovements = domain.movements.filter((item) => item.type === "exclusion");
  const pendingMovements = domain.movements.filter((item) => ["submitted", "pending", "scheduled"].includes(item.status));
  const currency = domain.organizations.companies[0]?.baseCurrency || "BOB";

  return {
    summary: {
      activePlans: domain.plans.filter((item) => item.status === "active").length,
      coveredEmployees: activeEnrollments.length,
      coveredDependents: domain.dependents.filter((item) => item.status === "active").length,
      pendingMovements: pendingMovements.length,
      companyCost: roundCurrency(sumBy(activeEnrollments, (item) => item.employerCost)),
      employeeCost: roundCurrency(sumBy(activeEnrollments, (item) => item.employeeCost)),
      totalCost: roundCurrency(sumBy(activeEnrollments, (item) => item.totalCost)),
      exclusions: excludedMovements.length,
      currency,
    },
    costByCompany: buildInsuranceDistribution(activeEnrollments, (item) => item.companyName, (item) => item.totalCost),
    costByPlan: buildInsuranceDistribution(activeEnrollments, (item) => item.planName, (item) => item.totalCost),
    coverageByPlan: buildInsuranceDistribution(activeEnrollments, (item) => item.planName, () => 1),
    providerMix: buildInsuranceDistribution(domain.plans, (item) => item.provider, () => 1),
    movementMix: buildInsuranceDistribution(domain.movements, (item) => item.type, () => 1),
    formattedTotalCost: formatInsuranceCurrency(sumBy(activeEnrollments, (item) => item.totalCost), currency, getLanguage()),
  };
}

export async function transitionInsuranceWorkflow({ entityId, entityType = "movement", action, comment = "" }) {
  const domain = await getInsuranceDomain();
  if (!action) {
    throw new Error(localizeInsurance("La accion del workflow es obligatoria.", "Insurance workflow action is required."));
  }

  const collections = entityType === "enrollment" ? [...domain.enrollments] : [...domain.movements];
  const index = collections.findIndex((item) => item.id === entityId);
  if (index < 0) {
    throw new Error(localizeInsurance("No encontramos el registro del workflow.", "Insurance workflow entity not found."));
  }

  const current = collections[index];
  const currentStatus = current.workflowStatus || "draft";
  if (!(WORKFLOW_ACTIONS[currentStatus] || []).includes(action)) {
    throw new Error(localizeInsurance("La transicion no esta permitida desde el estado actual.", "Insurance workflow transition is not allowed from the current state."));
  }

  const transitionMap = {
    submit: "submitted",
    start_review: "hr_review",
    approve_hr: current.type === "inclusion" ? "provider_review" : "approved",
    approve_provider: "approved",
    schedule: "scheduled",
    complete: "completed",
    return: "returned",
    reject: "rejected",
    resubmit: "submitted",
  };

  const nextWorkflowStatus = transitionMap[action];
  const nextOperationalStatus = ["completed", "scheduled", "approved"].includes(nextWorkflowStatus)
    ? (current.type === "exclusion" ? "excluded" : "active")
    : current.status;
  const nextItem = {
    ...current,
    workflowStatus: nextWorkflowStatus,
    status: nextOperationalStatus,
    workflowTrail: [
      ...(current.workflowTrail || []),
      createWorkflowTrailEntry({
        fromStatus: currentStatus,
        toStatus: nextWorkflowStatus,
        action,
        actor: getActor(),
        comment,
      }),
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: getActor(),
  };

  collections[index] = nextItem;

  if (entityType === "enrollment") {
    writeCollection(STORAGE_KEYS.enrollments, collections);
  } else {
    writeCollection(STORAGE_KEYS.movements, collections);
    const enrollmentIndex = domain.enrollments.findIndex((item) => item.id === current.enrollmentId || item.id === current.relatedEnrollmentId);
    if (enrollmentIndex >= 0) {
      const enrollments = [...domain.enrollments];
      enrollments[enrollmentIndex] = {
        ...enrollments[enrollmentIndex],
        workflowStatus: nextWorkflowStatus,
        status: nextOperationalStatus,
        workflowTrail: nextItem.workflowTrail,
        updatedAt: nextItem.updatedAt,
        updatedBy: nextItem.updatedBy,
      };
      writeCollection(STORAGE_KEYS.enrollments, enrollments);
    }
  }

  writeCollection(STORAGE_KEYS.auditLog, appendAuditEntry(domain.auditLog, createAuditEntry({
    entityType,
    entityId,
    employeeId: current.employeeId,
    employeeName: current.employeeName,
    action: `workflow_${action}`,
    summary: `Workflow de seguros movido de ${currentStatus} a ${nextWorkflowStatus}.`,
    before: current,
    after: nextItem,
    metadata: {
      comment,
      workflowAction: action,
    },
  })));

  return nextItem;
}

export default {
  getInsuranceDomain,
  saveInsurancePlan,
  saveInsuranceEnrollment,
  saveInsuranceExclusion,
  getInsuranceAnalytics,
  transitionInsuranceWorkflow,
};
