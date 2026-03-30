import administrationService from "../../administration/services/administration.service";
import employeesService from "../../employees/services/employees.service";
import recruitmentService from "../../recruitment/services/recruitment.service";
import vacationsService from "../../vacations/services/vacations.service";
import { getDevelopmentDashboard } from "../../development/services/development.service";
import { getReportsDashboard } from "../../reports/services/reports.service";
import { getSelfServiceDashboard } from "../../self-service/services/selfService.service";
import { getPersonnelActionsDashboard } from "../../personnel-actions/services/personnelActions.service";
import { getInsuranceDashboard } from "../../Insurance/services/insurance.service";
import { getOccupationalHealthDashboard } from "../../occupational-health/services/occupationalHealth.service";

function resolveSettled(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function buildRiskRegister({ employees, administration, vacations, insurance, development }) {
  return [
    {
      title: "Aprobaciones criticas en cola",
      owner: "Administration",
      severity: administration.approvalQueue.filter((item) => item.priority === "Critica" && item.status === "pending").length ? "critical" : "healthy",
      value: administration.approvalQueue.filter((item) => item.status === "pending").length,
      detail: "Solicitudes sensibles que sostienen cambios, accesos y decisiones transversales.",
    },
    {
      title: "Expedientes bajo cobertura minima",
      owner: "Employees",
      severity: employees.employees.filter((item) => Number(item.dossierReadiness) < 70).length ? "warning" : "healthy",
      value: employees.employees.filter((item) => Number(item.dossierReadiness) < 70).length,
      detail: "Colaboradores con riesgo de compliance o documentacion incompleta.",
    },
    {
      title: "Conflictos vacacionales activos",
      owner: "Vacations",
      severity: vacations.conflicts.length ? "warning" : "healthy",
      value: vacations.conflicts.length,
      detail: "Cobertura operativa comprometida por solapes o reglas incumplidas.",
    },
    {
      title: "Brechas de desarrollo criticas",
      owner: "Development",
      severity: development.stats.criticalGaps ? "warning" : "healthy",
      value: development.stats.criticalGaps,
      detail: "Roles con readiness gap alto y necesidad de plan de capacidad.",
    },
    {
      title: "Coberturas con exclusiones",
      owner: "Insurance",
      severity: insurance.stats.exclusions ? "warning" : "healthy",
      value: insurance.stats.exclusions,
      detail: "Casos con riesgo de cobertura parcial por documentacion o elegibilidad.",
    },
  ];
}

function buildModuleScorecards({ recruitment, employees, vacations, reports, selfService, personnelActions, development, insurance, occupationalHealth }) {
  return [
    {
      name: "Recruitment",
      status: recruitment.jobRequests.length ? "strong" : "attention",
      value: recruitment.stats[0]?.value ?? 0,
      helper: `${recruitment.candidates.length} candidatos en pipeline`,
      route: "/recruitment",
    },
    {
      name: "Employees",
      status: employees.employees.length ? "strong" : "attention",
      value: employees.employees.length,
      helper: `${employees.requests.length} solicitudes de alta`,
      route: "/employees",
    },
    {
      name: "Vacations",
      status: vacations.dashboard.activeConflicts ? "warning" : "strong",
      value: vacations.dashboard.pendingRequests,
      helper: `${vacations.dashboard.activeConflicts} conflictos activos`,
      route: "/vacations",
    },
    {
      name: "Reports",
      status: reports.stats.reportCatalog ? "strong" : "attention",
      value: reports.stats.reportCatalog,
      helper: `${reports.stats.operationalIndicators} indicadores operativos`,
      route: "/reports",
    },
    {
      name: "Self-Service",
      status: selfService.stats.pendingRequests ? "warning" : "strong",
      value: selfService.stats.pendingRequests,
      helper: `${selfService.stats.vacationBalance} dias de saldo visible`,
      route: "/self-service",
    },
    {
      name: "Personnel Actions",
      status: personnelActions.stats.pendingApprovals ? "warning" : "strong",
      value: personnelActions.stats.actionsLogged,
      helper: `${personnelActions.stats.pendingApprovals} aprobaciones pendientes`,
      route: "/personnel-actions",
    },
    {
      name: "Development",
      status: development.stats.criticalGaps ? "warning" : "strong",
      value: development.stats.activePlans,
      helper: `${development.stats.criticalGaps} brechas criticas`,
      route: "/development",
    },
    {
      name: "Insurance",
      status: insurance.stats.exclusions ? "warning" : "strong",
      value: insurance.stats.coveredEmployees,
      helper: `${insurance.stats.coveredDependents} dependientes cubiertos`,
      route: "/insurance",
    },
    {
      name: "Occupational Health",
      status: occupationalHealth.stats.openCases ? "warning" : "strong",
      value: occupationalHealth.stats.monitoredEmployees,
      helper: `${occupationalHealth.stats.openCases} casos abiertos`,
      route: "/occupational-health",
    },
  ];
}

export async function getDashboardOverview() {
  const recruitment = recruitmentService.getRecruitmentDashboardData();
  const [
    administration,
    employees,
    vacations,
    development,
    reports,
    selfService,
    personnelActions,
    insurance,
    occupationalHealth,
  ] = await Promise.allSettled([
    administrationService.getAdministrationCore(),
    employeesService.getEmployeesDashboard(),
    vacationsService.getVacationsDashboard(),
    getDevelopmentDashboard(),
    getReportsDashboard(),
    getSelfServiceDashboard(),
    getPersonnelActionsDashboard(),
    getInsuranceDashboard(),
    getOccupationalHealthDashboard(),
  ]);

  const administrationData = resolveSettled(administration, {
    approvalQueue: [],
    auditFeed: [],
  });
  const employeesData = resolveSettled(employees, {
    employees: [],
    requests: [],
    recruitmentBridge: [],
    insights: {
      activeEmployees: 0,
      averageProfileCompletion: 0,
    },
  });
  const vacationsData = resolveSettled(vacations, {
    dashboard: {
      activeConflicts: 0,
      pendingRequests: 0,
    },
    conflicts: [],
    history: [],
  });
  const developmentData = resolveSettled(development, {
    stats: {
      criticalGaps: 0,
      activePlans: 0,
    },
  });
  const reportsData = resolveSettled(reports, {
    stats: {
      reportCatalog: 0,
      operationalIndicators: 0,
    },
  });
  const selfServiceData = resolveSettled(selfService, {
    stats: {
      pendingRequests: 0,
      vacationBalance: 0,
    },
  });
  const personnelActionsData = resolveSettled(personnelActions, {
    stats: {
      pendingApprovals: 0,
      actionsLogged: 0,
    },
  });
  const insuranceData = resolveSettled(insurance, {
    stats: {
      exclusions: 0,
      coveredEmployees: 0,
      coveredDependents: 0,
    },
  });
  const occupationalHealthData = resolveSettled(occupationalHealth, {
    stats: {
      openCases: 0,
      monitoredEmployees: 0,
    },
  });

  const riskRegister = buildRiskRegister({
    employees: employeesData,
    administration: administrationData,
    vacations: vacationsData,
    insurance: insuranceData,
    development: developmentData,
  });
  const moduleScorecards = buildModuleScorecards({
    recruitment,
    employees: employeesData,
    vacations: vacationsData,
    reports: reportsData,
    selfService: selfServiceData,
    personnelActions: personnelActionsData,
    development: developmentData,
    insurance: insuranceData,
    occupationalHealth: occupationalHealthData,
  });
  const activityFeed = [
    ...administrationData.auditFeed.map((item) => ({
      id: item.id,
      source: "Administration",
      title: item.title,
      detail: item.detail,
      date: item.timestamp,
    })),
    ...recruitment.recentActivity.map((item) => ({
      id: item.id,
      source: "Recruitment",
      title: item.title,
      detail: item.meta,
      date: item.date,
    })),
    ...vacationsData.history.slice(0, 4).map((item) => ({
      id: item.id,
      source: "Vacations",
      title: item.title,
      detail: `${item.employeeName} | ${item.requestStatus}`,
      date: item.occurredAt,
    })),
  ]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 10);

  return {
    hero: {
      title: "Centro operativo ejecutivo",
      description:
        "Un tablero transversal para leer salud organizacional, riesgos, aprobaciones, talento y cobertura operacional sin salir del workspace.",
      stats: [
        {
          label: "Headcount activo",
          value: employeesData.insights.activeEmployees,
          helper: `${employeesData.employees.length} registros trazados`,
        },
        {
          label: "Aprobaciones pendientes",
          value: administrationData.approvalQueue.filter((item) => item.status === "pending").length,
          helper: "Solicitudes transversales en flujo",
        },
        {
          label: "Pipeline abierto",
          value: recruitment.stats[0]?.value ?? 0,
          helper: `${recruitment.candidates.length} candidatos activos`,
        },
        {
          label: "Riesgos visibles",
          value: riskRegister.filter((item) => item.severity !== "healthy").length,
          helper: "Alertas que afectan operacion o percepcion",
        },
      ],
    },
    moduleScorecards,
    riskRegister,
    approvalQueue: administrationData.approvalQueue.filter((item) => item.status === "pending").slice(0, 6),
    activityFeed,
    focusAreas: [
      {
        title: "Continuidad Recruitment -> Employees",
        metric: employeesData.recruitmentBridge.length,
        detail: "Candidatos listos para convertirse en altas controladas.",
      },
      {
        title: "Control vacacional",
        metric: vacationsData.dashboard.pendingRequests,
        detail: "Solicitudes que aun requieren decision o seguimiento.",
      },
      {
        title: "Madurez documental",
        metric: `${employeesData.insights.averageProfileCompletion}%`,
        detail: "Promedio de completitud del expediente del colaborador.",
      },
      {
        title: "Analitica disponible",
        metric: reportsData.stats.reportCatalog,
        detail: "Reportes ejecutivos listos para lectura de negocio.",
      },
    ],
    peopleSpotlight: employeesData.employees.slice(0, 3),
  };
}

export default { getDashboardOverview };
