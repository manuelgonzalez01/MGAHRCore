import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import recruitmentService from "../../recruitment/services/recruitment.service";
import { average, round } from "../utils/development.helpers";

const STORAGE_KEYS = {
  skillProfiles: "mgahrcore.development.skillProfiles",
  evaluationCycles: "mgahrcore.development.evaluationCycles",
  evaluations: "mgahrcore.development.evaluations",
  plans: "mgahrcore.development.plans",
  trainingPrograms: "mgahrcore.development.trainingPrograms",
  talentProfiles: "mgahrcore.development.talentProfiles",
  auditLog: "mgahrcore.development.auditLog",
  successionSnapshots: "mgahrcore.development.successionSnapshots",
  seed: "mgahrcore.development.seedLoaded",
};

const SESSION_KEY = "mgahrcore.auth.session";

export const PLAN_WORKFLOW = {
  draft: {
    key: "draft",
    actors: ["employee", "owner", "super_admin"],
    actions: [
      { key: "submit", nextStatus: "submitted", actors: ["employee", "owner", "super_admin"] },
      { key: "archive", nextStatus: "archived", actors: ["super_admin", "talent"] },
    ],
  },
  submitted: {
    key: "submitted",
    actors: ["manager", "super_admin"],
    actions: [
      { key: "start_manager_review", nextStatus: "manager_review", actors: ["manager", "super_admin"] },
      { key: "return_for_changes", nextStatus: "returned_for_changes", actors: ["manager", "super_admin"] },
      { key: "reject", nextStatus: "rejected", actors: ["manager", "super_admin"] },
    ],
  },
  manager_review: {
    key: "manager_review",
    actors: ["manager", "super_admin"],
    actions: [
      { key: "escalate_to_talent", nextStatus: "talent_review", actors: ["manager", "super_admin"] },
      { key: "return_for_changes", nextStatus: "returned_for_changes", actors: ["manager", "super_admin"] },
      { key: "reject", nextStatus: "rejected", actors: ["manager", "super_admin"] },
    ],
  },
  talent_review: {
    key: "talent_review",
    actors: ["talent", "super_admin"],
    actions: [
      { key: "approve", nextStatus: "approved", actors: ["talent", "super_admin"] },
      { key: "return_for_changes", nextStatus: "returned_for_changes", actors: ["talent", "super_admin"] },
      { key: "reject", nextStatus: "rejected", actors: ["talent", "super_admin"] },
    ],
  },
  approved: {
    key: "approved",
    actors: ["talent", "super_admin", "owner"],
    actions: [
      { key: "complete", nextStatus: "completed", actors: ["owner", "manager", "super_admin"] },
      { key: "archive", nextStatus: "archived", actors: ["talent", "super_admin"] },
    ],
  },
  returned_for_changes: {
    key: "returned_for_changes",
    actors: ["employee", "owner", "super_admin"],
    actions: [
      { key: "resubmit", nextStatus: "submitted", actors: ["employee", "owner", "super_admin"] },
      { key: "move_to_draft", nextStatus: "draft", actors: ["employee", "owner", "super_admin"] },
    ],
  },
  rejected: {
    key: "rejected",
    actors: ["talent", "manager", "super_admin"],
    actions: [{ key: "archive", nextStatus: "archived", actors: ["talent", "super_admin"] }],
  },
  completed: {
    key: "completed",
    actors: ["owner", "talent", "super_admin"],
    actions: [{ key: "archive", nextStatus: "archived", actors: ["talent", "super_admin"] }],
  },
  archived: {
    key: "archived",
    actors: ["super_admin"],
    actions: [],
  },
};

const CAPABILITY_CATALOG = {
  leadership: { name: "Leadership & Feedback", category: "Leadership" },
  communication: { name: "Executive Communication", category: "Communication" },
  analytics: { name: "People Analytics", category: "Analytics" },
  compliance: { name: "Compliance & Governance", category: "Risk" },
  planning: { name: "Execution Planning", category: "Execution" },
  talent: { name: "Talent Assessment", category: "Talent" },
  finance: { name: "Financial Analysis", category: "Finance" },
  partnering: { name: "Business Partnering", category: "Leadership" },
  learning: { name: "Learning Agility", category: "Development" },
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

function writeCollection(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function readValue(key) {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writeValue(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
}

function operation(ok, data = null, error = "") {
  return { ok, data, error };
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCurrentActor() {
  if (!canUseStorage()) {
    return { name: "MGAHRCore Super Admin", role: "super_admin" };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return {
      name: parsed?.name || "MGAHRCore Super Admin",
      role: parsed?.role === "Super Admin" ? "super_admin" : "owner",
    };
  } catch {
    return { name: "MGAHRCore Super Admin", role: "super_admin" };
  }
}

function addCapability(map, key) {
  const capability = CAPABILITY_CATALOG[key];
  if (capability) {
    map.set(capability.name, capability);
  }
}

function normalizeOrganizations(organizations) {
  const source = organizations || {};
  return {
    companies: Array.isArray(source.companies) ? source.companies : [],
    positions: Array.isArray(source.positions) ? source.positions : [],
    levels: Array.isArray(source.levels) ? source.levels : [],
    departments: Array.isArray(source.departments) ? source.departments : [],
    locations: Array.isArray(source.locations) ? source.locations : [],
    entities: Array.isArray(source.entities) ? source.entities : [],
  };
}

function normalizeEmployeesDashboard(dashboard) {
  return {
    employees: Array.isArray(dashboard?.employees) ? dashboard.employees : [],
  };
}

function normalizeRecruitmentDashboard(dashboard) {
  return {
    jobRequests: Array.isArray(dashboard?.jobRequests) ? dashboard.jobRequests : [],
  };
}

function resolvePositionContext(employee, organizations) {
  const position = organizations.positions.find((item) => item.id === employee.positionId)
    || organizations.positions.find((item) => item.name === employee.position);
  const department = organizations.departments.find((item) => item.id === employee.departmentId)
    || organizations.departments.find((item) => item.name === employee.department)
    || organizations.departments.find((item) => item.id === position?.departmentId);
  const level = organizations.levels.find((item) => item.id === employee.levelId)
    || organizations.levels.find((item) => item.name === employee.levelName)
    || organizations.levels.find((item) => item.id === position?.levelId);
  const company = organizations.companies.find((item) => item.id === employee.companyId)
    || organizations.companies.find((item) => item.name === employee.company)
    || organizations.companies.find((item) => item.id === department?.companyId);

  return {
    companyId: company?.id || employee.companyId || "",
    companyName: company?.name || employee.company || "MGAHRCore",
    positionId: position?.id || employee.positionId || "",
    positionName: position?.name || employee.position || "Unassigned position",
    departmentId: department?.id || employee.departmentId || "",
    departmentName: department?.name || employee.department || "Unassigned department",
    levelId: level?.id || employee.levelId || "",
    levelName: level?.name || employee.levelName || "Unassigned level",
  };
}

function inferRequiredCapabilities(context) {
  const inferred = new Map();
  const source = normalizeText(`${context.positionName} ${context.departmentName} ${context.levelName}`);

  addCapability(inferred, "planning");
  addCapability(inferred, "communication");
  addCapability(inferred, "learning");

  if (source.includes("people") || source.includes("culture") || source.includes("talent") || source.includes("hr")) {
    addCapability(inferred, "talent");
    addCapability(inferred, "compliance");
    addCapability(inferred, "partnering");
  }

  if (source.includes("finance") || source.includes("compensation") || source.includes("payroll")) {
    addCapability(inferred, "finance");
    addCapability(inferred, "analytics");
  }

  if (source.includes("lead") || source.includes("director") || source.includes("manager") || source.includes("head")) {
    addCapability(inferred, "leadership");
    addCapability(inferred, "partnering");
  }

  if (source.includes("analyst") || source.includes("business") || source.includes("partner")) {
    addCapability(inferred, "analytics");
    addCapability(inferred, "partnering");
  }

  return [...inferred.values()];
}

function inferValidatedCapabilities(employee, departmentName) {
  const validated = new Map();
  const studies = employee.studies || [];
  const experience = employee.experience || [];
  const source = normalizeText(
    `${employee.position} ${departmentName} ${employee.summary} ${employee.executiveInsight} ${
      studies.map((item) => `${item.degree} ${item.institution}`).join(" ")
    } ${experience.map((item) => `${item.role} ${item.achievements}`).join(" ")}`,
  );

  if (source.includes("lider") || source.includes("lead") || source.includes("manager") || source.includes("director")) {
    addCapability(validated, "leadership");
  }
  if (source.includes("analit") || source.includes("dashboard") || source.includes("analytics") || source.includes("data")) {
    addCapability(validated, "analytics");
  }
  if (source.includes("finan") || source.includes("budget") || source.includes("compensation")) {
    addCapability(validated, "finance");
  }
  if (source.includes("recruit") || source.includes("talent") || source.includes("people") || source.includes("culture")) {
    addCapability(validated, "talent");
    addCapability(validated, "partnering");
  }
  if (source.includes("policy") || source.includes("compliance") || source.includes("governance") || source.includes("legal")) {
    addCapability(validated, "compliance");
  }
  if (source.includes("training") || source.includes("learning") || source.includes("mentoring") || source.includes("coaching")) {
    addCapability(validated, "learning");
  }
  if (source.includes("presentation") || source.includes("communication") || source.includes("story")) {
    addCapability(validated, "communication");
  }
  if ((employee.onboarding?.completion || 0) >= 85) {
    addCapability(validated, "planning");
  }

  return [...validated.values()];
}

function seedSkillProfiles(employees, organizations) {
  const profiles = [];

  employees.forEach((employee) => {
    const context = resolvePositionContext(employee, organizations);
    const required = inferRequiredCapabilities(context);
    const validated = inferValidatedCapabilities(employee, context.departmentName);

    required.forEach((capability) => {
      const level = validated.some((item) => item.name === capability.name) ? "advanced" : "critical_gap";

      profiles.push({
        id: createId("DSK"),
        employeeId: employee.id,
        employeeName: employee.name,
        companyId: context.companyId,
        companyName: context.companyName,
        departmentId: context.departmentId,
        departmentName: context.departmentName,
        levelId: context.levelId,
        levelName: context.levelName,
        positionId: context.positionId,
        positionName: context.positionName,
        skillName: capability.name,
        category: capability.category,
        required: true,
        level,
        source: level === "advanced" ? "employee dossier" : "position requirement",
      });
    });

    validated
      .filter((capability) => !required.some((item) => item.name === capability.name))
      .forEach((capability) => {
        profiles.push({
          id: createId("DSK"),
          employeeId: employee.id,
          employeeName: employee.name,
          companyId: context.companyId,
          companyName: context.companyName,
          departmentId: context.departmentId,
          departmentName: context.departmentName,
          levelId: context.levelId,
          levelName: context.levelName,
          positionId: context.positionId,
          positionName: context.positionName,
          skillName: capability.name,
          category: capability.category,
          required: false,
          level: "expert",
          source: "manual validation",
        });
      });
  });

  return profiles;
}

function seedEvaluationCycles() {
  const currentYear = new Date().getFullYear();
  return [
    { id: `EVC-${currentYear}-H1`, name: `H1 ${currentYear} Talent Review`, status: "in_progress", dueDate: `${currentYear}-06-30`, owner: "Talent Management" },
    { id: `EVC-${currentYear}-Q1`, name: `Q1 ${currentYear} Capability Checkpoint`, status: "completed", dueDate: `${currentYear}-03-31`, owner: "People Leaders" },
  ];
}

function seedEvaluations(employees, organizations, skillProfiles, cycles) {
  return employees.map((employee, index) => {
    const context = resolvePositionContext(employee, organizations);
    const cycle = cycles[index % cycles.length];
    const competencies = skillProfiles
      .filter((item) => item.employeeId === employee.id && item.required)
      .slice(0, 4)
      .map((item) => {
        const currentScore = item.level === "critical_gap" ? 2.6 : item.level === "advanced" ? 4.1 : 4.6;
        return {
          skillName: item.skillName,
          expectedLevel: 4,
          currentScore,
          gap: round(4 - currentScore, 1),
        };
      });

    const score = round(average(competencies.map((item) => item.currentScore)), 1);
    const status = cycle.status === "completed" ? "completed" : index % 2 === 0 ? "in_review" : "scheduled";

    return {
      id: createId("EVAL"),
      cycleId: cycle.id,
      cycleName: cycle.name,
      employeeId: employee.id,
      employeeName: employee.name,
      evaluator: employee.manager || "HR Leadership",
      companyId: context.companyId,
      companyName: context.companyName,
      departmentId: context.departmentId,
      departmentName: context.departmentName,
      positionId: context.positionId,
      positionName: context.positionName,
      levelId: context.levelId,
      levelName: context.levelName,
      score,
      status,
      competencies,
      observations: employee.executiveInsight || employee.summary || "",
      completedAt: status === "completed" ? cycle.dueDate : "",
      dueDate: cycle.dueDate,
      potential: employee.engagementScore || 0,
      readiness: round(100 - Math.max(0, 4 - score) * 18, 0),
    };
  });
}

function normalizePlanAction(action = {}, employeeName = "") {
  return {
    id: action.id || createId("PLA"),
    title: action.title || action.name || "Development action",
    owner: action.owner || employeeName || "Employee",
    targetDate: action.targetDate || "",
    priority: action.priority || "medium",
    progress: Number(action.progress) || 0,
    status: action.status || "not_started",
    evidence: action.evidence || "",
    notes: action.notes || "",
    blockers: action.blockers || "",
  };
}

function normalizePlanObjective(objective = {}, employeeName = "") {
  const actions = Array.isArray(objective.actions) ? objective.actions : [];
  return {
    id: objective.id || createId("OBJ"),
    title: objective.title || "Development objective",
    owner: objective.owner || employeeName || "Employee",
    targetDate: objective.targetDate || "",
    priority: objective.priority || "medium",
    progress: Number(objective.progress) || 0,
    status: objective.status || "in_progress",
    evidence: objective.evidence || "",
    notes: objective.notes || "",
    blockers: objective.blockers || "",
    actions: actions.map((item) => normalizePlanAction(item, employeeName)),
  };
}

function createWorkflowEntry({ action, fromStatus = "", toStatus, actor, comment = "", summary = "" }) {
  return {
    id: createId("WF"),
    action,
    fromStatus,
    toStatus,
    actorName: actor.name,
    actorRole: actor.role,
    comment,
    summary,
    createdAt: new Date().toISOString(),
  };
}

function normalizePlanRecord(plan = {}, employeeName = "") {
  const actor = getCurrentActor();
  const objectives = Array.isArray(plan.objectives)
    ? plan.objectives.map((item) => normalizePlanObjective(item, employeeName))
    : [];
  const derivedProgress = objectives.length
    ? round(average(objectives.map((item) => item.progress)), 0)
    : Number(plan.progress) || 0;
  const workflowStatus = plan.workflowStatus || plan.status || "draft";
  const workflowTrail = Array.isArray(plan.workflowTrail) && plan.workflowTrail.length
    ? plan.workflowTrail
    : [createWorkflowEntry({
      action: "created",
      fromStatus: "",
      toStatus: workflowStatus,
      actor,
      comment: plan.workflowComment || "Initial plan created.",
      summary: "Plan initialized in the development workspace.",
    })];

  return {
    ...plan,
    id: plan.id || createId("PLAN"),
    employeeName: plan.employeeName || employeeName || "Unassigned employee",
    owner: plan.owner || "Talent Manager",
    sponsor: plan.sponsor || plan.owner || "Talent Office",
    targetDate: plan.targetDate || "",
    nextMilestone: plan.nextMilestone || "",
    readiness: Number(plan.readiness) || 0,
    progress: derivedProgress,
    workflowStatus,
    status: workflowStatus,
    healthStatus: plan.healthStatus || (derivedProgress >= 85 ? "healthy" : objectives.some((item) => item.blockers) ? "at_risk" : "in_progress"),
    objectives,
    workflowComment: plan.workflowComment || "",
    workflowTrail,
    currentStageOwner: plan.currentStageOwner || plan.owner || "Talent Manager",
    currentStageRole: plan.currentStageRole || "owner",
    lastUpdatedAt: plan.lastUpdatedAt || new Date().toISOString(),
    lastUpdatedBy: plan.lastUpdatedBy || actor.name,
  };
}

function seedPlans(employees, organizations, evaluations) {
  const targetYear = new Date().getFullYear();

  return employees.map((employee, index) => {
    const context = resolvePositionContext(employee, organizations);
    const evaluation = evaluations.find((item) => item.employeeId === employee.id);
    const readiness = evaluation?.readiness || 55;
    const progress = employee.onboarding?.completion
      ? round((employee.onboarding.completion + (employee.profileCompletion || 0)) / 2, 0)
      : round((employee.profileCompletion || 0) * 0.75, 0);
    const workflowStatus = progress >= 95
      ? "completed"
      : index % 4 === 0
        ? "approved"
        : index % 3 === 0
          ? "talent_review"
          : index % 2 === 0
            ? "manager_review"
            : "submitted";

    return normalizePlanRecord({
      id: createId("PLAN"),
      employeeId: employee.id,
      employeeName: employee.name,
      companyId: context.companyId,
      companyName: context.companyName,
      departmentId: context.departmentId,
      departmentName: context.departmentName,
      positionId: context.positionId,
      positionName: context.positionName,
      levelId: context.levelId,
      levelName: context.levelName,
      owner: employee.manager || "Talent Manager",
      sponsor: employee.manager || context.departmentName,
      workflowStatus,
      readiness,
      targetDate: index % 2 === 0 ? `${targetYear}-09-30` : `${targetYear}-12-15`,
      nextMilestone: employee.nextMilestone || "Next development checkpoint",
      objectives: [
        normalizePlanObjective({
          title: employee.nextMilestone || "Close current development milestone",
          owner: employee.manager || "Manager",
          targetDate: `${targetYear}-06-30`,
          priority: "high",
          status: progress > 70 ? "on_track" : "attention",
          progress: Math.max(30, progress - 12),
          evidence: "Manager checkpoint and onboarding milestones",
          notes: "Align the employee with the next capability checkpoint.",
          blockers: progress > 70 ? "" : "Pending alignment meeting with manager.",
          actions: [
            {
              title: "Run structured coaching session",
              owner: employee.manager || "Manager",
              targetDate: `${targetYear}-05-15`,
              priority: "high",
              progress: Math.max(25, progress - 20),
              status: progress > 65 ? "in_progress" : "not_started",
              evidence: "Coaching notes and follow-up meeting.",
            },
          ],
        }, employee.name),
        normalizePlanObjective({
          title: `Strengthen impact in ${context.positionName}`,
          owner: employee.name,
          targetDate: `${targetYear}-09-30`,
          priority: "medium",
          status: progress > 80 ? "on_track" : "in_progress",
          progress: Math.max(25, progress - 8),
          evidence: "Project delivery evidence and stakeholder feedback",
          notes: "Increase role mastery and internal visibility.",
          blockers: "",
          actions: [
            {
              title: "Lead cross-functional initiative",
              owner: employee.name,
              targetDate: `${targetYear}-08-15`,
              priority: "medium",
              progress: Math.max(15, progress - 12),
              status: "in_progress",
              evidence: "Initiative milestone updates.",
            },
          ],
        }, employee.name),
        normalizePlanObjective({
          title: `Prepare readiness for ${context.levelName}`,
          owner: context.departmentName,
          targetDate: `${targetYear}-12-15`,
          priority: "high",
          status: readiness >= 75 ? "on_track" : "attention",
          progress: Math.max(20, readiness - 25),
          evidence: "Talent review and promotion calibration inputs",
          notes: "Strengthen promotion readiness and succession viability.",
          blockers: readiness >= 75 ? "" : "Capability gap still visible in evaluation cycle.",
          actions: [
            {
              title: "Validate readiness in talent forum",
              owner: employee.manager || "Talent Manager",
              targetDate: `${targetYear}-11-20`,
              priority: "high",
              progress: readiness >= 75 ? 70 : 35,
              status: readiness >= 75 ? "in_progress" : "not_started",
              evidence: "Talent review snapshot and sponsor confirmation.",
            },
          ],
        }, employee.name),
      ],
      workflowComment: "Seeded plan aligned to employee readiness and current role context.",
      currentStageOwner: workflowStatus === "manager_review" ? employee.manager || "Manager" : "Talent Management",
      currentStageRole: workflowStatus === "manager_review" ? "manager" : workflowStatus === "talent_review" ? "talent" : "owner",
      workflowTrail: [
        createWorkflowEntry({
          action: "created",
          fromStatus: "",
          toStatus: "draft",
          actor: { name: "Talent Management", role: "talent" },
          comment: "Development plan initialized from employee dossier and evaluation cycle.",
          summary: "Initial plan created.",
        }),
        ...(workflowStatus !== "draft"
          ? [createWorkflowEntry({
            action: "seed_progression",
            fromStatus: "draft",
            toStatus: workflowStatus,
            actor: { name: "Talent Management", role: "talent" },
            comment: "Seeded workflow progression based on current operating maturity.",
            summary: "Workflow moved to active governance stage.",
          })]
          : []),
      ],
    }, employee.name);
  });
}

function seedTrainingPrograms(employees, organizations, plans) {
  const departments = [...new Set(employees.map((employee) => resolvePositionContext(employee, organizations).departmentName).filter(Boolean))];
  const domains = departments.length ? departments : ["General"];

  return domains.map((departmentName, index) => {
    const category = index % 3 === 0 ? "Leadership" : index % 3 === 1 ? "Capability" : "Execution";
    const audience = departmentName === "General"
      ? employees
      : employees.filter((employee) => resolvePositionContext(employee, organizations).departmentName === departmentName);
    const enrolled = audience.length;
    const completed = audience.filter((employee) => (employee.studies || []).length >= (index + 1) || (employee.onboarding?.completion || 0) > 85).length;
    const completionRate = enrolled ? round((completed / enrolled) * 100, 0) : 0;

    return {
      id: createId("TRN"),
      title: `${departmentName} Development Track`,
      category,
      mandatory: departmentName !== "General",
      audience: departmentName,
      enrolled,
      completed,
      completionRate,
      owner: departmentName === "General" ? "Talent Management" : departmentName,
      status: completionRate >= 85 ? "healthy" : completionRate >= 60 ? "in_progress" : "attention",
      linkedPlans: plans.filter((plan) => plan.departmentName === departmentName || departmentName === "General").length,
    };
  });
}

function seedTalentProfiles(employees, plans, evaluations, recruitment) {
  return employees.map((employee) => {
    const plan = plans.find((item) => item.employeeId === employee.id);
    const evaluation = evaluations.find((item) => item.employeeId === employee.id);
    const relatedOpenings = recruitment.jobRequests.filter((item) =>
      item.department === employee.department || item.position === employee.position,
    );
    const readiness = round(((plan?.progress || 0) * 0.45) + ((evaluation?.score || 0) * 12) + ((employee.engagementScore || 0) * 0.2), 0);
    const successorRoles = relatedOpenings.slice(0, 2).map((item) => item.position).filter(Boolean);

    return {
      id: createId("TPR"),
      employeeId: employee.id,
      employeeName: employee.name,
      potential: employee.engagementScore || 0,
      potentialCategory: (employee.engagementScore || 0) >= 85 ? "high" : (employee.engagementScore || 0) >= 70 ? "medium" : "emerging",
      successionReadiness: readiness >= 80 ? "ready_now" : readiness >= 65 ? "ready_soon" : "developing",
      successorFor: successorRoles[0] || employee.actions?.[0]?.title || "",
      successorRoles,
      mobilityPreference: relatedOpenings.length > 0 ? "cross-functional" : "in-role",
      retentionRisk: readiness >= 80 && (employee.engagementScore || 0) < 72 ? "watch" : "stable",
      reviewBoard: employee.manager || "Talent Council",
      notes: employee.executiveInsight || employee.summary || "",
      talentFlags: readiness >= 80 ? ["key_talent", "succession_ready"] : ["growing_talent"],
      comparisonSignal: round(((employee.engagementScore || 0) + readiness) / 2, 0),
      benchPreference: successorRoles.length > 1 ? "multi-role" : "single-role",
    };
  });
}

function buildReadiness(employees, plans, evaluations, recruitment, talentProfiles) {
  return employees.map((employee) => {
    const plan = plans.find((item) => item.employeeId === employee.id);
    const evaluation = evaluations.find((item) => item.employeeId === employee.id);
    const profile = talentProfiles.find((item) => item.employeeId === employee.id);
    const mobilityOptions = recruitment.jobRequests.filter((item) =>
      item.department === employee.department || item.position === employee.position,
    ).length;
    const readiness = round(((plan?.progress || 0) * 0.45) + ((evaluation?.score || 0) * 12) + ((employee.engagementScore || 0) * 0.2), 0);

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      role: employee.position,
      levelName: employee.levelName,
      manager: employee.manager,
      readiness,
      potential: profile?.potential ?? (employee.engagementScore || 0),
      potentialCategory: profile?.potentialCategory || "medium",
      promotionReadiness: profile?.successionReadiness || (readiness >= 80 ? "ready_now" : readiness >= 65 ? "ready_soon" : "developing"),
      successionSignal: profile?.successorFor ? "successor_named" : mobilityOptions > 0 ? "mobility_open" : "internal_growth",
      successorFor: profile?.successorFor || "",
      successorRoles: Array.isArray(profile?.successorRoles) ? profile.successorRoles : profile?.successorFor ? [profile.successorFor] : [],
      mobilityPreference: profile?.mobilityPreference || "in-role",
      retentionRisk: profile?.retentionRisk || "stable",
      reviewBoard: profile?.reviewBoard || employee.manager || "Talent Council",
      notes: profile?.notes || "",
      mobilityOptions,
      developmentPriority: plan?.healthStatus === "at_risk" ? "critical" : readiness >= 80 ? "strategic" : "active",
      benchPreference: profile?.benchPreference || "single-role",
      comparisonSignal: profile?.comparisonSignal || round(((profile?.potential ?? 0) + readiness) / 2, 0),
    };
  }).sort((left, right) => right.readiness - left.readiness);
}

function resolveSuccessorRoles(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTalentProfile(record = {}) {
  const successorRoles = resolveSuccessorRoles(record.successorRoles || record.successorFor);
  return {
    ...record,
    id: record.id || createId("TPR"),
    potential: Number(record.potential) || 0,
    potentialCategory: record.potentialCategory || "medium",
    successionReadiness: record.successionReadiness || "developing",
    successorFor: record.successorFor || successorRoles[0] || "",
    successorRoles,
    mobilityPreference: record.mobilityPreference || "in-role",
    retentionRisk: record.retentionRisk || "stable",
    reviewBoard: record.reviewBoard || "Talent Council",
    notes: record.notes || "",
    talentFlags: Array.isArray(record.talentFlags) ? record.talentFlags : [],
    comparisonSignal: Number(record.comparisonSignal) || 0,
    benchPreference: record.benchPreference || (successorRoles.length > 1 ? "multi-role" : "single-role"),
    lastUpdatedAt: record.lastUpdatedAt || new Date().toISOString(),
    lastUpdatedBy: record.lastUpdatedBy || getCurrentActor().name,
  };
}

function enrichSkillProfile(record, employees, organizations) {
  const employee = employees.find((item) => item.id === record.employeeId);
  const context = employee ? resolvePositionContext(employee, organizations) : null;

  return {
    ...record,
    employeeName: employee?.name || record.employeeName || "Unassigned employee",
    companyId: context?.companyId || record.companyId || "",
    companyName: context?.companyName || record.companyName || "MGAHRCore",
    departmentId: context?.departmentId || record.departmentId || "",
    departmentName: context?.departmentName || record.departmentName || "",
    positionId: context?.positionId || record.positionId || "",
    positionName: context?.positionName || record.positionName || "",
    levelId: context?.levelId || record.levelId || "",
    levelName: context?.levelName || record.levelName || "",
  };
}

function enrichEmployeeBoundRecord(record, employees, organizations) {
  const employee = employees.find((item) => item.id === record.employeeId);
  const context = employee ? resolvePositionContext(employee, organizations) : null;

  return {
    ...record,
    employeeName: employee?.name || record.employeeName || "Unassigned employee",
    companyId: context?.companyId || record.companyId || "",
    companyName: context?.companyName || record.companyName || "MGAHRCore",
    departmentId: context?.departmentId || record.departmentId || "",
    departmentName: context?.departmentName || record.departmentName || "",
    positionId: context?.positionId || record.positionId || "",
    positionName: context?.positionName || record.positionName || "",
    levelId: context?.levelId || record.levelId || "",
    levelName: context?.levelName || record.levelName || "",
  };
}

function logAuditEvent({ entityType, entityId, employeeId = "", employeeName = "", action, summary, before = null, after = null, metadata = {} }) {
  const records = readCollection(STORAGE_KEYS.auditLog);
  const actor = getCurrentActor();

  records.unshift({
    id: createId("AUD"),
    entityType,
    entityId,
    employeeId,
    employeeName,
    action,
    summary,
    before,
    after,
    metadata,
    actorName: actor.name,
    actorRole: actor.role,
    createdAt: new Date().toISOString(),
  });

  writeCollection(STORAGE_KEYS.auditLog, records.slice(0, 400));
}

function saveSuccessionSnapshot(payload) {
  const records = readCollection(STORAGE_KEYS.successionSnapshots);

  records.unshift({
    id: createId("SNP"),
    createdAt: new Date().toISOString(),
    actorName: getCurrentActor().name,
    ...payload,
  });

  writeCollection(STORAGE_KEYS.successionSnapshots, records.slice(0, 200));
}

async function getCoreSources() {
  const [employeesDashboardResult, organizationsResult, recruitmentDashboardResult] = await Promise.allSettled([
    employeesService.getEmployeesDashboard(),
    administrationService.getOrganizations(),
    recruitmentService.getRecruitmentDashboardData(),
  ]);

  return {
    employeesDashboard: employeesDashboardResult.status === "fulfilled"
      ? normalizeEmployeesDashboard(employeesDashboardResult.value)
      : normalizeEmployeesDashboard({}),
    organizations: organizationsResult.status === "fulfilled"
      ? normalizeOrganizations(organizationsResult.value)
      : normalizeOrganizations({}),
    recruitmentDashboard: recruitmentDashboardResult.status === "fulfilled"
      ? normalizeRecruitmentDashboard(recruitmentDashboardResult.value)
      : normalizeRecruitmentDashboard({}),
  };
}

async function ensureSeedData() {
  if (readValue(STORAGE_KEYS.seed)) {
    return;
  }

  const { employeesDashboard, organizations, recruitmentDashboard } = await getCoreSources();
  const employees = employeesDashboard.employees;
  const skillProfiles = seedSkillProfiles(employees, organizations);
  const cycles = seedEvaluationCycles();
  const evaluations = seedEvaluations(employees, organizations, skillProfiles, cycles);
  const plans = seedPlans(employees, organizations, evaluations);
  const trainingPrograms = seedTrainingPrograms(employees, organizations, plans);
  const talentProfiles = seedTalentProfiles(employees, plans, evaluations, recruitmentDashboard);

  writeCollection(STORAGE_KEYS.skillProfiles, skillProfiles);
  writeCollection(STORAGE_KEYS.evaluationCycles, cycles);
  writeCollection(STORAGE_KEYS.evaluations, evaluations);
  writeCollection(STORAGE_KEYS.plans, plans);
  writeCollection(STORAGE_KEYS.trainingPrograms, trainingPrograms);
  writeCollection(STORAGE_KEYS.talentProfiles, talentProfiles);
  writeCollection(STORAGE_KEYS.auditLog, []);
  writeCollection(STORAGE_KEYS.successionSnapshots, []);
  writeValue(STORAGE_KEYS.seed, "1");
}

export async function getDevelopmentDomain() {
  await ensureSeedData();

  const { employeesDashboard, organizations, recruitmentDashboard } = await getCoreSources();
  const employees = employeesDashboard.employees;
  const employeeIds = new Set(employees.map((item) => item.id));
  const currentDepartments = new Set(employees.map((item) => resolvePositionContext(item, organizations).departmentName).filter(Boolean));
  const persistedSkillProfiles = readCollection(STORAGE_KEYS.skillProfiles).filter((item) => employeeIds.has(item.employeeId));
  const persistedEvaluations = readCollection(STORAGE_KEYS.evaluations).filter((item) => employeeIds.has(item.employeeId));
  const persistedPlans = readCollection(STORAGE_KEYS.plans).filter((item) => employeeIds.has(item.employeeId));
  const persistedTalentProfiles = readCollection(STORAGE_KEYS.talentProfiles).filter((item) => employeeIds.has(item.employeeId));
  const persistedTrainingPrograms = readCollection(STORAGE_KEYS.trainingPrograms)
    .filter((item) => employees.length > 0 && (item.audience === "General" || currentDepartments.has(item.audience)));
  const persistedAuditLog = readCollection(STORAGE_KEYS.auditLog)
    .filter((item) => !item.employeeId || employeeIds.has(item.employeeId));
  const persistedSuccessionSnapshots = readCollection(STORAGE_KEYS.successionSnapshots)
    .filter((item) => employeeIds.has(item.employeeId));

  if (persistedSkillProfiles.length !== readCollection(STORAGE_KEYS.skillProfiles).length) {
    writeCollection(STORAGE_KEYS.skillProfiles, persistedSkillProfiles);
  }
  if (persistedEvaluations.length !== readCollection(STORAGE_KEYS.evaluations).length) {
    writeCollection(STORAGE_KEYS.evaluations, persistedEvaluations);
  }
  if (persistedPlans.length !== readCollection(STORAGE_KEYS.plans).length) {
    writeCollection(STORAGE_KEYS.plans, persistedPlans);
  }
  if (persistedTalentProfiles.length !== readCollection(STORAGE_KEYS.talentProfiles).length) {
    writeCollection(STORAGE_KEYS.talentProfiles, persistedTalentProfiles);
  }
  if (persistedTrainingPrograms.length !== readCollection(STORAGE_KEYS.trainingPrograms).length) {
    writeCollection(STORAGE_KEYS.trainingPrograms, persistedTrainingPrograms);
  }
  if (persistedAuditLog.length !== readCollection(STORAGE_KEYS.auditLog).length) {
    writeCollection(STORAGE_KEYS.auditLog, persistedAuditLog);
  }
  if (persistedSuccessionSnapshots.length !== readCollection(STORAGE_KEYS.successionSnapshots).length) {
    writeCollection(STORAGE_KEYS.successionSnapshots, persistedSuccessionSnapshots);
  }

  const skillProfiles = persistedSkillProfiles.map((item) => enrichSkillProfile(item, employees, organizations));
  const cycles = readCollection(STORAGE_KEYS.evaluationCycles);
  const evaluations = persistedEvaluations.map((item) => enrichEmployeeBoundRecord(item, employees, organizations));
  const plans = persistedPlans
    .map((item) => normalizePlanRecord(item, item.employeeName))
    .map((item) => enrichEmployeeBoundRecord(item, employees, organizations));
  const trainingPrograms = persistedTrainingPrograms;
  const talentProfiles = persistedTalentProfiles.map((item) => normalizeTalentProfile(item));
  const auditLog = persistedAuditLog;
  const successionSnapshots = persistedSuccessionSnapshots;
  const skillCatalog = [...new Map(skillProfiles.map((item) => [item.skillName, {
    id: `SKL-${item.skillName.replace(/[^A-Z0-9]+/gi, "-").toUpperCase()}`,
    name: item.skillName,
    category: item.category || "General",
    criticality: item.required ? "core" : "supporting",
    requiredForPositions: [...new Set(skillProfiles.filter((profile) => profile.skillName === item.skillName && profile.required).map((profile) => profile.positionName))],
    requiredForLevels: [...new Set(skillProfiles.filter((profile) => profile.skillName === item.skillName && profile.required).map((profile) => profile.levelName))],
    description: `${item.category || "General"} capability managed by Talent Development.`,
  }])).values()];
  const readiness = buildReadiness(employees, plans, evaluations, recruitmentDashboard, talentProfiles);

  return {
    employees,
    organizations,
    skillCatalog,
    skillProfiles,
    cycles,
    evaluations,
    plans,
    trainingPrograms,
    talentProfiles,
    readiness,
    auditLog,
    successionSnapshots,
  };
}

export async function getPlanWorkflowDefinition() {
  return PLAN_WORKFLOW;
}

export async function getDevelopmentAuditLog() {
  await ensureSeedData();
  return readCollection(STORAGE_KEYS.auditLog);
}

export async function saveSkillRecord(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.skillProfiles);
  const next = {
    ...payload,
    id: payload.id || createId("DSK"),
    required: Boolean(payload.required),
    level: payload.level || "developing",
    source: payload.source || "manual update",
  };
  const index = records.findIndex((item) => item.id === next.id);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    records[index] = next;
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.skillProfiles, records);
  logAuditEvent({
    entityType: "skill_profile",
    entityId: next.id,
    employeeId: next.employeeId,
    employeeName: next.employeeName,
    action: previous ? "updated" : "created",
    summary: previous ? "Skill record updated." : "Skill record created.",
    before: previous,
    after: next,
  });
  return operation(true, next);
}

export async function deleteSkillRecord(id) {
  const current = readCollection(STORAGE_KEYS.skillProfiles);
  const previous = current.find((item) => item.id === id) || null;
  const records = current.filter((item) => item.id !== id);
  writeCollection(STORAGE_KEYS.skillProfiles, records);
  if (previous) {
    logAuditEvent({
      entityType: "skill_profile",
      entityId: previous.id,
      employeeId: previous.employeeId,
      employeeName: previous.employeeName,
      action: "deleted",
      summary: "Skill record removed.",
      before: previous,
      after: null,
    });
  }
  return operation(true, records);
}

export async function saveEvaluationCycle(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.evaluationCycles);
  const next = {
    ...payload,
    id: payload.id || createId("CYC"),
    status: payload.status || "scheduled",
  };
  const index = records.findIndex((item) => item.id === next.id);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    records[index] = next;
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.evaluationCycles, records);
  logAuditEvent({
    entityType: "evaluation_cycle",
    entityId: next.id,
    action: previous ? "updated" : "created",
    summary: previous ? "Evaluation cycle updated." : "Evaluation cycle created.",
    before: previous,
    after: next,
  });
  return operation(true, next);
}

export async function saveEvaluationRecord(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.evaluations);
  const next = {
    ...payload,
    id: payload.id || createId("EVAL"),
    score: Number(payload.score) || 0,
    status: payload.status || "scheduled",
    competencies: Array.isArray(payload.competencies) ? payload.competencies : [],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: getCurrentActor().name,
  };
  const index = records.findIndex((item) => item.id === next.id);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    records[index] = next;
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.evaluations, records);
  logAuditEvent({
    entityType: "evaluation",
    entityId: next.id,
    employeeId: next.employeeId,
    employeeName: next.employeeName,
    action: previous ? "updated" : "created",
    summary: previous ? "Evaluation updated." : "Evaluation recorded.",
    before: previous,
    after: next,
  });
  return operation(true, next);
}

export async function deleteEvaluationRecord(id) {
  const current = readCollection(STORAGE_KEYS.evaluations);
  const previous = current.find((item) => item.id === id) || null;
  const records = current.filter((item) => item.id !== id);
  writeCollection(STORAGE_KEYS.evaluations, records);
  if (previous) {
    logAuditEvent({
      entityType: "evaluation",
      entityId: previous.id,
      employeeId: previous.employeeId,
      employeeName: previous.employeeName,
      action: "deleted",
      summary: "Evaluation removed.",
      before: previous,
      after: null,
    });
  }
  return operation(true, records);
}

export async function saveDevelopmentPlanRecord(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.plans);
  const actor = getCurrentActor();
  const next = normalizePlanRecord({
    ...payload,
    objectives: Array.isArray(payload.objectives) ? payload.objectives : [],
    workflowStatus: payload.workflowStatus || payload.status || "draft",
    status: payload.workflowStatus || payload.status || "draft",
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: actor.name,
  }, payload.employeeName);
  const index = records.findIndex((item) => item.id === next.id);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    const previousNormalized = normalizePlanRecord(records[index], records[index].employeeName);
    next.workflowTrail = [
      ...previousNormalized.workflowTrail,
      createWorkflowEntry({
        action: "plan_updated",
        fromStatus: previousNormalized.workflowStatus,
        toStatus: next.workflowStatus,
        actor,
        comment: payload.workflowComment || "Plan content updated.",
        summary: "Plan structure, objectives, or actions updated.",
      }),
    ];
  }
  if (index >= 0) {
    records[index] = next;
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.plans, records);
  logAuditEvent({
    entityType: "development_plan",
    entityId: next.id,
    employeeId: next.employeeId,
    employeeName: next.employeeName,
    action: previous ? "updated" : "created",
    summary: previous ? "Development plan updated." : "Development plan created.",
    before: previous,
    after: next,
  });
  return operation(true, next);
}

export async function transitionDevelopmentPlanState(planId, payload = {}) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.plans);
  const index = records.findIndex((item) => item.id === planId);

  if (index < 0) {
    return operation(false, null, "Development plan not found.");
  }

  const actor = {
    ...getCurrentActor(),
    ...(payload.actorName ? { name: payload.actorName } : {}),
    ...(payload.actorRole ? { role: payload.actorRole } : {}),
  };
  const current = normalizePlanRecord(records[index], records[index].employeeName);
  const workflow = PLAN_WORKFLOW[current.workflowStatus] || PLAN_WORKFLOW.draft;
  const action = workflow.actions.find((item) => item.key === payload.action);

  if (!action) {
    return operation(false, null, "The requested transition is not allowed from the current status.");
  }

  if (!action.actors.includes(actor.role) && actor.role !== "super_admin") {
    return operation(false, null, "The actor role is not allowed to execute this transition.");
  }

  const next = normalizePlanRecord({
    ...current,
    workflowStatus: action.nextStatus,
    status: action.nextStatus,
    workflowComment: payload.comment || "",
    currentStageRole: PLAN_WORKFLOW[action.nextStatus]?.actors?.[0] || "owner",
    currentStageOwner: payload.nextOwner || current.currentStageOwner || current.owner,
    workflowTrail: [
      ...current.workflowTrail,
      createWorkflowEntry({
        action: payload.action,
        fromStatus: current.workflowStatus,
        toStatus: action.nextStatus,
        actor,
        comment: payload.comment || "",
        summary: payload.summary || `Workflow moved from ${current.workflowStatus} to ${action.nextStatus}.`,
      }),
    ],
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: actor.name,
  }, current.employeeName);

  records[index] = next;
  writeCollection(STORAGE_KEYS.plans, records);
  logAuditEvent({
    entityType: "development_plan_workflow",
    entityId: next.id,
    employeeId: next.employeeId,
    employeeName: next.employeeName,
    action: payload.action,
    summary: payload.summary || `Plan moved to ${action.nextStatus}.`,
    before: current,
    after: next,
    metadata: { comment: payload.comment || "", actorRole: actor.role },
  });
  return operation(true, next);
}

export async function deleteDevelopmentPlanRecord(id) {
  const current = readCollection(STORAGE_KEYS.plans);
  const previous = current.find((item) => item.id === id) || null;
  const records = current.filter((item) => item.id !== id);
  writeCollection(STORAGE_KEYS.plans, records);
  if (previous) {
    logAuditEvent({
      entityType: "development_plan",
      entityId: previous.id,
      employeeId: previous.employeeId,
      employeeName: previous.employeeName,
      action: "deleted",
      summary: "Development plan removed.",
      before: previous,
      after: null,
    });
  }
  return operation(true, records);
}

export async function saveTrainingProgramRecord(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.trainingPrograms);
  const enrolled = Number(payload.enrolled) || 0;
  const completed = Number(payload.completed) || 0;
  const next = {
    ...payload,
    id: payload.id || createId("TRN"),
    mandatory: Boolean(payload.mandatory),
    enrolled,
    completed,
    completionRate: enrolled > 0 ? round((completed / enrolled) * 100, 0) : 0,
    status: payload.status || "in_progress",
  };
  const index = records.findIndex((item) => item.id === next.id);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    records[index] = next;
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.trainingPrograms, records);
  logAuditEvent({
    entityType: "training_program",
    entityId: next.id,
    action: previous ? "updated" : "created",
    summary: previous ? "Training program updated." : "Training program created.",
    before: previous,
    after: next,
  });
  return operation(true, next);
}

export async function deleteTrainingProgramRecord(id) {
  const current = readCollection(STORAGE_KEYS.trainingPrograms);
  const previous = current.find((item) => item.id === id) || null;
  const records = current.filter((item) => item.id !== id);
  writeCollection(STORAGE_KEYS.trainingPrograms, records);
  if (previous) {
    logAuditEvent({
      entityType: "training_program",
      entityId: previous.id,
      action: "deleted",
      summary: "Training program removed.",
      before: previous,
      after: null,
    });
  }
  return operation(true, records);
}

export async function saveTalentProfileRecord(payload) {
  await ensureSeedData();
  const records = readCollection(STORAGE_KEYS.talentProfiles);
  const actor = getCurrentActor();
  const next = normalizeTalentProfile({
    ...payload,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: actor.name,
  });
  const index = records.findIndex((item) => item.id === next.id || item.employeeId === next.employeeId);
  const previous = index >= 0 ? clone(records[index]) : null;
  if (index >= 0) {
    records[index] = { ...records[index], ...next };
  } else {
    records.unshift(next);
  }
  writeCollection(STORAGE_KEYS.talentProfiles, records);
  logAuditEvent({
    entityType: "talent_profile",
    entityId: next.id,
    employeeId: next.employeeId,
    employeeName: next.employeeName,
    action: previous ? "updated" : "created",
    summary: previous ? "Talent review updated." : "Talent review created.",
    before: previous,
    after: next,
  });
  if (next.successorRoles.length || next.successorFor) {
    saveSuccessionSnapshot({
      employeeId: next.employeeId,
      employeeName: next.employeeName,
      successorRoles: next.successorRoles,
      successionReadiness: next.successionReadiness,
      retentionRisk: next.retentionRisk,
      reviewBoard: next.reviewBoard,
    });
  }
  return operation(true, next);
}

export default {
  PLAN_WORKFLOW,
  getDevelopmentDomain,
  getPlanWorkflowDefinition,
  getDevelopmentAuditLog,
  saveSkillRecord,
  deleteSkillRecord,
  saveEvaluationCycle,
  saveEvaluationRecord,
  deleteEvaluationRecord,
  saveDevelopmentPlanRecord,
  transitionDevelopmentPlanState,
  deleteDevelopmentPlanRecord,
  saveTrainingProgramRecord,
  deleteTrainingProgramRecord,
  saveTalentProfileRecord,
};
