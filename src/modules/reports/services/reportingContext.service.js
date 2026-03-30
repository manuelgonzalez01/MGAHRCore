import administrationService from "../../administration/services/administration.service";
import developmentService from "../../development/services/development.service";
import employeesService from "../../employees/services/employees.service";
import insuranceService from "../../Insurance/services/insurance.service";
import occupationalHealthService from "../../occupational-health/services/occupationalHealth.service";
import personnelActionsService from "../../personnel-actions/services/personnelActions.service";
import recruitmentService from "../../recruitment/services/recruitment.service";
import selfServiceService from "../../self-service/services/selfService.service";
import vacationsService from "../../vacations/services/vacations.service";
import {
  calculateTenureMonths,
  createFilterOptionsFromContext,
  createLookup,
  round,
  toNumber,
} from "../utils/reports.helpers";

const EXIT_REASONS = [
  "Renuncia voluntaria",
  "Reorganizacion interna",
  "Fin de contrato",
  "Rotacion de mercado",
  "Cambio de unidad",
  "Cobertura temporal finalizada",
];

function resolvePosition(employee, organizations) {
  return organizations.positions.find((item) => item.id === employee.positionId)
    || organizations.positions.find((item) => item.name === employee.position);
}

function resolveDepartment(employee, organizations, position) {
  return organizations.departments.find((item) => item.id === employee.departmentId)
    || organizations.departments.find((item) => item.name === employee.department)
    || organizations.departments.find((item) => item.id === position?.departmentId);
}

function resolveLocation(employee, organizations, department, position) {
  return organizations.locations.find((item) => item.id === employee.locationId)
    || organizations.locations.find((item) => item.name === employee.location)
    || organizations.locations.find((item) => item.id === department?.locationId)
    || organizations.locations.find((item) => item.id === position?.locationId);
}

function resolveCompany(employee, organizations, department, position) {
  return organizations.companies.find((item) => item.id === employee.companyId)
    || organizations.companies.find((item) => item.name === employee.company)
    || organizations.companies.find((item) => item.id === department?.companyId)
    || organizations.companies.find((item) => item.id === position?.companyId);
}

function resolveLevel(employee, organizations, position) {
  return organizations.levels.find((item) => item.id === employee.levelId)
    || organizations.levels.find((item) => item.name === employee.levelName)
    || organizations.levels.find((item) => item.id === position?.levelId);
}

function normalizeEmployee(employee, organizations) {
  const position = resolvePosition(employee, organizations);
  const department = resolveDepartment(employee, organizations, position);
  const location = resolveLocation(employee, organizations, department, position);
  const company = resolveCompany(employee, organizations, department, position);
  const level = resolveLevel(employee, organizations, position);
  const tenureMonths = calculateTenureMonths(employee.startDate);
  const totalCompensation = toNumber(employee.salary?.baseSalary) + toNumber(employee.salary?.variable);

  return {
    ...employee,
    module: "employees",
    companyId: company?.id || employee.companyId || "",
    companyName: company?.name || employee.company || "Sin compania",
    departmentId: department?.id || employee.departmentId || "",
    departmentName: department?.name || employee.department || "Sin departamento",
    locationId: location?.id || employee.locationId || "",
    locationName: location?.name || employee.location || "Sin localizacion",
    positionId: position?.id || employee.positionId || "",
    positionName: position?.name || employee.position || "Sin posicion",
    levelId: level?.id || employee.levelId || "",
    levelName: level?.name || employee.levelName || "Sin nivel",
    activeState: ["active", "leave"].includes(employee.status) ? "active" : "inactive",
    tenureMonths,
    totalCompensation,
    salaryCurrency: employee.salary?.currency || company?.baseCurrency || "BOB",
  };
}

function buildDocuments(employees) {
  return employees.flatMap((employee) =>
    (employee.documents || []).map((document) => {
      const expiresAt = document.expiresAt || "";
      const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
      const isSoon = expiresAt
        ? new Date(expiresAt).getTime() <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).getTime()
        : false;

      return {
        id: document.id,
        employeeId: employee.id,
        employeeName: employee.name,
        companyId: employee.companyId,
        companyName: employee.companyName,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        levelId: employee.levelId,
        levelName: employee.levelName,
        positionId: employee.positionId,
        positionName: employee.positionName,
        locationId: employee.locationId,
        locationName: employee.locationName,
        employeeType: employee.employeeType,
        module: "employees",
        name: document.name,
        category: document.category,
        owner: document.owner,
        status: isExpired ? "expired" : document.status === "pending" || isSoon ? "attention" : "healthy",
        expiresAt,
      };
    }),
  );
}

function buildRecruitmentRecords(recruitmentData, organizations) {
  const positionLookup = createLookup(organizations.positions);
  const departmentLookup = createLookup(organizations.departments);
  const levelLookup = createLookup(organizations.levels);
  const locationLookup = createLookup(organizations.locations);

  const jobRequests = recruitmentData.jobRequests.map((request) => {
    const position = positionLookup.get(request.positionId)
      || organizations.positions.find((item) => item.name === request.title || item.name === request.position);
    const department = departmentLookup.get(request.departmentId)
      || organizations.departments.find((item) => item.name === request.department);
    const location = locationLookup.get(request.locationId)
      || organizations.locations.find((item) => item.name === request.location);
    const level = levelLookup.get(request.levelId)
      || organizations.levels.find((item) => item.name === request.levelName)
      || levelLookup.get(position?.levelId);
    const company = organizations.companies.find((item) => item.id === request.companyId)
      || organizations.companies.find((item) => item.id === department?.companyId);

    return {
      ...request,
      module: "recruitment",
      date: request.createdAt,
      companyId: company?.id || request.companyId || "",
      companyName: company?.name || "Sin compania",
      departmentId: department?.id || request.departmentId || "",
      departmentName: department?.name || request.department || "Sin departamento",
      positionId: position?.id || request.positionId || "",
      positionName: position?.name || request.position || request.title || "Sin posicion",
      levelId: level?.id || request.levelId || "",
      levelName: level?.name || request.levelName || "Sin nivel",
      locationId: location?.id || request.locationId || "",
      locationName: location?.name || request.location || "Sin localizacion",
      openings: toNumber(request.openings) || 1,
    };
  });

  const candidates = recruitmentData.candidates.map((candidate) => {
    const position = positionLookup.get(candidate.positionId)
      || organizations.positions.find((item) => item.name === candidate.position || item.name === candidate.vacancy);
    const department = departmentLookup.get(candidate.departmentId)
      || organizations.departments.find((item) => item.name === candidate.department)
      || departmentLookup.get(position?.departmentId);
    const location = locationLookup.get(candidate.locationId)
      || organizations.locations.find((item) => item.name === candidate.location);
    const level = levelLookup.get(candidate.levelId)
      || organizations.levels.find((item) => item.name === candidate.levelName)
      || levelLookup.get(position?.levelId);
    const company = organizations.companies.find((item) => item.id === candidate.companyId)
      || organizations.companies.find((item) => item.id === department?.companyId);

    return {
      ...candidate,
      module: "recruitment",
      date: candidate.createdAt,
      companyId: company?.id || "",
      companyName: company?.name || "Sin compania",
      departmentId: department?.id || "",
      departmentName: department?.name || candidate.department || "Sin departamento",
      positionId: position?.id || candidate.positionId || "",
      positionName: position?.name || candidate.position || candidate.vacancy || "Sin posicion",
      levelId: level?.id || "",
      levelName: level?.name || candidate.levelName || "Sin nivel",
      locationId: location?.id || "",
      locationName: location?.name || candidate.location || "Sin localizacion",
      source: candidate.source || "No definido",
      stage: candidate.stage || candidate.status || "screening",
      score: toNumber(candidate.score),
    };
  });

  return { jobRequests, candidates };
}

function buildVacationRecords(vacationsData, employees) {
  const employeeLookup = createLookup(employees);

  const requests = vacationsData.requests.map((request) => {
    const employee = employeeLookup.get(request.employeeId)
      || employees.find((item) => item.name === request.employeeName);

    return {
      ...request,
      module: "vacations",
      date: request.requestedAt,
      employeeType: employee?.employeeType || "",
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || request.company || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || request.department || "Sin departamento",
      positionId: employee?.positionId || "",
      positionName: employee?.positionName || "Sin posicion",
      levelId: employee?.levelId || "",
      levelName: employee?.levelName || "Sin nivel",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      manager: request.manager || employee?.manager || "Sin manager",
    };
  });

  const balances = vacationsData.balances.map((balance) => {
    const employee = employeeLookup.get(balance.employeeId)
      || employees.find((item) => item.name === balance.employeeName);

    return {
      ...balance,
      module: "vacations",
      date: balance.updatedAt || new Date().toISOString(),
      employeeType: employee?.employeeType || "",
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || balance.company || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || balance.department || "Sin departamento",
      positionId: employee?.positionId || "",
      positionName: employee?.positionName || "Sin posicion",
      levelId: employee?.levelId || "",
      levelName: employee?.levelName || "Sin nivel",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
    };
  });

  return { requests, balances };
}

function buildDevelopmentRecords(employees, developmentData) {
  const planLookup = new Map(developmentData.plans.map((plan) => [plan.employeeName, plan]));
  const gapLookup = new Map(developmentData.gaps.map((gap) => [gap.employeeName, gap]));
  const skillLookup = new Map(developmentData.skills.map((skill) => [skill.employeeName, skill]));

  return employees.map((employee) => {
    const plan = planLookup.get(employee.name);
    const gap = gapLookup.get(employee.name);
    const skill = skillLookup.get(employee.name);
    const completedStudies = (employee.studies || []).filter((item) => item.status === "completed").length;
    const completion = employee.onboarding?.completion || round(Math.min(100, completedStudies * 24 + employee.profileCompletion * 0.45), 0);

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      module: "development",
      companyId: employee.companyId,
      companyName: employee.companyName,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      locationId: employee.locationId,
      locationName: employee.locationName,
      positionId: employee.positionId,
      positionName: employee.positionName,
      levelId: employee.levelId,
      levelName: employee.levelName,
      employeeType: employee.employeeType,
      manager: employee.manager,
      planStatus: plan?.status || "in_progress",
      milestone: plan?.milestone || employee.nextMilestone,
      learningAssets: plan?.learningAssets || completedStudies + (employee.experience || []).length,
      readinessGap: gap?.readinessGap || 0,
      skillsValidated: skill?.validated || completedStudies,
      experienceDepth: skill?.experienceDepth || (employee.experience || []).length,
      potential: skill?.potential || employee.engagementScore || 0,
      completion,
      evaluationCycle: employee.performanceLabel || "Sin evaluacion",
      date: employee.startDate || new Date().toISOString().slice(0, 10),
    };
  });
}

function buildSalaryMovements(employees, personnelActionsData) {
  const employeeMovements = employees.flatMap((employee) =>
    (employee.salary?.salaryHistory || []).map((movement) => ({
      id: `${employee.id}-${movement.effectiveDate}-${movement.change}`,
      employeeId: employee.id,
      employeeName: employee.name,
      companyId: employee.companyId,
      companyName: employee.companyName,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      positionId: employee.positionId,
      positionName: employee.positionName,
      levelId: employee.levelId,
      levelName: employee.levelName,
      locationId: employee.locationId,
      locationName: employee.locationName,
      employeeType: employee.employeeType,
      module: "personnel-actions",
      change: movement.change,
      reason: movement.reason,
      effectiveDate: movement.effectiveDate,
      amount: toNumber(movement.baseSalary),
    })),
  );

  const actionMovements = personnelActionsData.salaryMovements.map((movement, index) => {
    const employee = employees.find((item) => item.name === movement.employeeName);
    return {
      id: `PACT-${index}`,
      employeeId: employee?.id || "",
      employeeName: movement.employeeName,
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      positionId: employee?.positionId || "",
      positionName: employee?.positionName || "Sin posicion",
      levelId: employee?.levelId || "",
      levelName: employee?.levelName || "Sin nivel",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      employeeType: employee?.employeeType || "",
      module: "personnel-actions",
      change: movement.change,
      reason: movement.reason,
      effectiveDate: movement.effectiveDate,
      amount: 0,
    };
  });

  return [...employeeMovements, ...actionMovements]
    .sort((left, right) => new Date(right.effectiveDate) - new Date(left.effectiveDate));
}

function buildRotationEvents(employees, organizations) {
  const hires = employees
    .filter((employee) => employee.startDate)
    .map((employee) => ({
      id: `ROT-IN-${employee.id}`,
      employeeId: employee.id,
      employeeName: employee.name,
      companyId: employee.companyId,
      companyName: employee.companyName,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      locationId: employee.locationId,
      locationName: employee.locationName,
      positionId: employee.positionId,
      positionName: employee.positionName,
      levelId: employee.levelId,
      levelName: employee.levelName,
      employeeType: employee.employeeType,
      module: "employees",
      date: employee.startDate,
      type: "entry",
      reason: "Alta aprobada",
      status: "completed",
    }));

  const exits = organizations.departments.slice(0, Math.max(3, Math.min(organizations.departments.length, 6))).map((department, index) => {
    const company = organizations.companies.find((item) => item.id === department.companyId);
    const position = organizations.positions.find((item) => item.departmentId === department.id);
    const level = organizations.levels.find((item) => item.id === position?.levelId);
    const location = organizations.locations.find((item) => item.id === department.locationId);
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - (index + 1), 12 + index);

    return {
      id: `ROT-OUT-${department.id}`,
      employeeId: "",
      employeeName: `${position?.name || "Posicion"} - cobertura historica`,
      companyId: company?.id || "",
      companyName: company?.name || "Sin compania",
      departmentId: department.id,
      departmentName: department.name,
      locationId: location?.id || "",
      locationName: location?.name || "Sin localizacion",
      positionId: position?.id || "",
      positionName: position?.name || "Sin posicion",
      levelId: level?.id || "",
      levelName: level?.name || "Sin nivel",
      employeeType: position?.employmentType || "onsite",
      module: "personnel-actions",
      date: date.toISOString().slice(0, 10),
      type: "exit",
      reason: EXIT_REASONS[index % EXIT_REASONS.length],
      status: "completed",
      source: "Baseline analitico",
    };
  });

  return [...hires, ...exits].sort((left, right) => new Date(right.date) - new Date(left.date));
}

function buildApprovals(administrationCore, employees) {
  return administrationCore.approvalQueue.map((item) => {
    const employee = employees.find((entry) => entry.manager === item.requester || entry.name === item.requester);

    return {
      ...item,
      module: "administration",
      date: item.resolvedAt || item.history?.[0]?.actedAt || new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      levelId: employee?.levelId || "",
      levelName: employee?.levelName || "Sin nivel",
      employeeType: employee?.employeeType || "",
    };
  });
}

function buildSelfServiceRecords(selfServiceDashboard, employees) {
  const employee = employees.find((item) => item.id === selfServiceDashboard.employee?.id)
    || employees[0];

  return {
    employee,
    approvals: (selfServiceDashboard.approvals || []).map((item) => ({
      ...item,
      module: "self-service",
      date: item.history?.[0]?.actedAt || new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
    })),
    requests: (selfServiceDashboard.requests || []).map((item, index) => ({
      id: `SSR-${index}`,
      ...item,
      module: "self-service",
      date: new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      employeeType: employee?.employeeType || "",
      employeeName: employee?.name || "",
    })),
    stats: selfServiceDashboard.stats || {},
  };
}

function buildInsuranceRecords(insuranceDashboard, employees) {
  const inclusions = (insuranceDashboard.inclusions || []).map((item, index) => {
    const employee = employees.find((entry) => entry.name === item.employeeName);
    return {
      id: `INS-IN-${index}`,
      ...item,
      module: "insurance",
      date: new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || item.company || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      employeeType: employee?.employeeType || "",
      employeeId: employee?.id || "",
    };
  });

  const exclusions = (insuranceDashboard.exclusions || []).map((item, index) => {
    const employee = employees.find((entry) => entry.name === item.employeeName);
    return {
      id: `INS-EX-${index}`,
      ...item,
      module: "insurance",
      date: new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      employeeType: employee?.employeeType || "",
      employeeId: employee?.id || "",
    };
  });

  return {
    plansCatalog: insuranceDashboard.plansCatalog || [],
    inclusions,
    exclusions,
    stats: insuranceDashboard.stats || {},
  };
}

function buildOccupationalHealthRecords(healthDashboard, employees) {
  const enrich = (item, index, prefix) => {
    const employee = employees.find((entry) => entry.name === item.employeeName);
    return {
      id: item.id || `${prefix}-${index}`,
      ...item,
      module: "occupational-health",
      date: new Date().toISOString(),
      companyId: employee?.companyId || "",
      companyName: employee?.companyName || "Sin compania",
      departmentId: employee?.departmentId || "",
      departmentName: employee?.departmentName || item.area || "Sin departamento",
      locationId: employee?.locationId || "",
      locationName: employee?.locationName || "Sin localizacion",
      employeeType: employee?.employeeType || "",
      employeeId: employee?.id || "",
    };
  };

  return {
    visits: (healthDashboard.visits || []).map((item, index) => enrich(item, index, "HLT-VIS")),
    injuries: (healthDashboard.injuries || []).map((item, index) => enrich(item, index, "HLT-INJ")),
    labs: (healthDashboard.labs || []).map((item, index) => enrich(item, index, "HLT-LAB")),
    medicines: (healthDashboard.medicines || []).map((item, index) => enrich(item, index, "HLT-MED")),
    stats: healthDashboard.stats || {},
  };
}

export async function getReportingContext(language = "es") {
  const [
    administrationCore,
    employeesDashboard,
    selfServiceDashboard,
    recruitmentDashboard,
    vacationsDashboard,
    insuranceDashboard,
    occupationalHealthDashboard,
    personnelActionsDashboard,
    developmentDashboard,
  ] = await Promise.all([
    administrationService.getAdministrationCore(),
    employeesService.getEmployeesDashboard(),
    selfServiceService.getSelfServiceDashboard(),
    recruitmentService.getRecruitmentDashboardData(),
    vacationsService.getVacationsDashboard(),
    insuranceService.getInsuranceDashboard(),
    occupationalHealthService.getOccupationalHealthDashboard(),
    personnelActionsService.getPersonnelActionsDashboard(),
    developmentService.getDevelopmentDashboard(),
  ]);

  const organizations = administrationCore.organizations;
  const employees = employeesDashboard.employees.map((employee) => normalizeEmployee(employee, organizations));
  const recruitment = buildRecruitmentRecords(recruitmentDashboard, organizations);
  const vacations = buildVacationRecords(vacationsDashboard, employees);
  const development = buildDevelopmentRecords(employees, developmentDashboard);
  const documents = buildDocuments(employees);
  const salaryMovements = buildSalaryMovements(employees, personnelActionsDashboard);
  const rotationEvents = buildRotationEvents(employees, organizations);
  const approvals = buildApprovals(administrationCore, employees);
  const selfService = buildSelfServiceRecords(selfServiceDashboard, employees);
  const insurance = buildInsuranceRecords(insuranceDashboard, employees);
  const occupationalHealth = buildOccupationalHealthRecords(occupationalHealthDashboard, employees);

  return {
    organizations,
    filtersOptions: createFilterOptionsFromContext(organizations, language),
    employees,
    employeeRequests: employeesDashboard.requests || [],
    selfService,
    recruitment,
    vacations: {
      ...vacations,
      reports: vacationsDashboard.reports || {},
      dashboard: vacationsDashboard.dashboard || {},
      approvalQueue: vacationsDashboard.approvalQueue || [],
      plans: vacationsDashboard.plans || [],
      conflicts: vacationsDashboard.conflicts || [],
    },
    insurance,
    occupationalHealth,
    personnelActions: {
      ...personnelActionsDashboard,
      salaryMovements,
      rotationEvents,
    },
    development: {
      records: development,
      stats: developmentDashboard.stats,
    },
    compliance: {
      documents,
      approvals,
      healthChecks: administrationCore.healthChecks || [],
      auditFeed: administrationCore.auditFeed || [],
      entities: organizations.entities || [],
    },
  };
}

export default {
  getReportingContext,
};
