import { buildReportExportSummary } from "../utils/reports.helpers";
import { getLegalReports } from "./complianceReports.service";
import { getTrainingReports } from "./developmentReports.service";
import { getReportingContext } from "./reportingContext.service";
import { getRecruitmentReports } from "./recruitmentReports.service";
import { getSalaryReports } from "./salaryReports.service";
import { getInsuranceReports, getOccupationalHealthReports, getSelfServiceReports } from "./serviceExperienceReports.service";
import { getVacationReports } from "./vacationReports.service";
import { getHeadcountReport, getRotationReport, getWorkforceRiskReport } from "./workforceReports.service";

export async function getReportsFiltersOptions(language = "es") {
  const context = await getReportingContext(language);
  return context.filtersOptions;
}

export async function getReportsDashboard(filters = {}, language = "es") {
  const context = await getReportingContext(language);
  const [
    headcount,
    rotation,
    salary,
    training,
    legal,
    vacations,
    recruitment,
    workforceRisk,
    selfService,
    insurance,
    occupationalHealth,
  ] = await Promise.all([
    getHeadcountReport(filters, context),
    getRotationReport(filters, context),
    getSalaryReports(filters, context),
    getTrainingReports(filters, context),
    getLegalReports(filters, context),
    getVacationReports(filters, context),
    getRecruitmentReports(filters, context),
    getWorkforceRiskReport(filters, context),
    getSelfServiceReports(filters, context),
    getInsuranceReports(filters, context),
    getOccupationalHealthReports(filters, context),
  ]);

  return {
    summary: {
      headcount: headcount.summary.headcount,
      activeEmployees: headcount.summary.activeEmployees,
      turnoverRate: rotation.summary.turnoverRate,
      averageSalary: salary.summary.averageSalary,
      pendingApprovals: legal.summary.pendingCriticalApprovals + vacations.summary.pendingApprovals,
      openPositions: recruitment.summary.openPositions,
      serviceRequests: selfService.summary.pendingRequests,
      insuranceExclusions: insurance.summary.exclusions,
      healthOpenCases: occupationalHealth.summary.openCases,
    },
    domains: [
      { key: "headcount", title: language === "en" ? "Executive workforce" : "Executive workforce", description: language === "en" ? "Organizational composition, headcount, and active structure." : "Composicion organizacional, headcount y estructura activa.", value: headcount.summary.headcount, status: "healthy", path: "/reports/headcount" },
      { key: "rotation", title: language === "en" ? "Rotation & mobility" : "Rotation & mobility", description: language === "en" ? "Entries, exits, reasons, and workforce stability." : "Entradas, salidas, motivos y lectura de estabilidad.", value: rotation.summary.turnoverRate, status: rotation.summary.turnoverRate > 10 ? "warning" : "healthy", path: "/reports/rotation" },
      { key: "salary", title: language === "en" ? "Compensation" : "Compensation", description: language === "en" ? "Salary distribution, movements, and level comparisons." : "Distribucion salarial, movimientos y comparativos por nivel.", value: salary.summary.trackedEmployees, status: "healthy", path: "/reports/salary" },
      { key: "training", title: language === "en" ? "Development" : "Development", description: language === "en" ? "Training, compliance, and talent readiness." : "Capacitacion, cumplimiento y readiness del talento.", value: training.summary.activePlans, status: training.summary.criticalGaps > 1 ? "warning" : "healthy", path: "/reports/training" },
      { key: "legal", title: language === "en" ? "Compliance & risk" : "Compliance & risk", description: language === "en" ? "Expired documents, approvals, and incomplete employee files." : "Documentos vencidos, aprobaciones y expedientes incompletos.", value: legal.summary.expiredDocuments, status: legal.summary.expiredDocuments > 0 ? "critical" : "healthy", path: "/reports/legal" },
      { key: "vacations", title: language === "en" ? "Leave analytics" : "Leave analytics", description: language === "en" ? "Consumption, balances, patterns, and pending approvals." : "Consumo, balances, patrones y aprobaciones pendientes.", value: vacations.summary.pendingApprovals, status: vacations.summary.pendingApprovals > 2 ? "warning" : "healthy", path: "/reports/vacations" },
      { key: "recruitment", title: language === "en" ? "Recruitment intelligence" : "Recruitment intelligence", description: language === "en" ? "Pipeline, conversion, and open positions." : "Pipeline, conversion y vacantes abiertas.", value: recruitment.summary.openPositions, status: recruitment.summary.openPositions > 2 ? "warning" : "healthy", path: "/reports/recruitment" },
      { key: "risk", title: language === "en" ? "Workforce risk" : "Workforce risk", description: language === "en" ? "Cross-module risk signals for executive decision-making." : "Riesgo transversal para decision ejecutiva.", value: workforceRisk.summary.employeesAtRisk, status: workforceRisk.summary.criticalDocuments > 0 ? "critical" : "warning", path: "/reports/workforce-risk" },
      { key: "self-service", title: language === "en" ? "Self service" : "Self service", description: language === "en" ? "Employee-facing request and approval behavior." : "Comportamiento de solicitudes y aprobaciones visibles al colaborador.", value: selfService.summary.pendingRequests, status: selfService.summary.pendingRequests > 0 ? "warning" : "healthy", path: "/reports/self-service" },
      { key: "insurance", title: language === "en" ? "Insurance" : "Insurance", description: language === "en" ? "Coverage, dependents, and exclusion monitoring." : "Cobertura, dependientes y monitoreo de exclusiones.", value: insurance.summary.coveredEmployees, status: insurance.summary.exclusions > 0 ? "warning" : "healthy", path: "/reports/insurance" },
      { key: "occupational-health", title: language === "en" ? "Occupational health" : "Occupational health", description: language === "en" ? "Health monitoring, incidents, and laboratory follow-up." : "Monitoreo de salud, incidentes y seguimiento de laboratorio.", value: occupationalHealth.summary.openCases, status: occupationalHealth.summary.openCases > 0 ? "warning" : "healthy", path: "/reports/occupational-health" },
    ],
    insights: [
      {
        title: language === "en" ? "Decision layer" : "Decision layer",
        description: language === "en"
          ? `${headcount.summary.headcount} employees tracked with ${salary.summary.trackedEmployees} compensation records and ${training.summary.trackedEmployees} visible development plans.`
          : `${headcount.summary.headcount} colaboradores trazados con ${salary.summary.trackedEmployees} registros de compensacion y ${training.summary.trackedEmployees} planes de desarrollo visibles.`,
        tone: "healthy",
      },
      {
        title: language === "en" ? "Operational pressure" : "Operational pressure",
        description: language === "en"
          ? `${vacations.summary.pendingApprovals} leave approvals and ${recruitment.summary.openPositions} open positions are impacting operational continuity.`
          : `${vacations.summary.pendingApprovals} aprobaciones de ausencias y ${recruitment.summary.openPositions} vacantes abiertas impactan la continuidad operativa.`,
        tone: vacations.summary.pendingApprovals > 2 ? "warning" : "attention",
      },
      {
        title: language === "en" ? "Compliance posture" : "Compliance posture",
        description: language === "en"
          ? `${legal.summary.expiredDocuments} expired documents and ${legal.summary.incompleteFiles} incomplete employee files require attention.`
          : `${legal.summary.expiredDocuments} documentos vencidos y ${legal.summary.incompleteFiles} expedientes incompletos requieren atencion.`,
        tone: legal.summary.expiredDocuments > 0 ? "critical" : "healthy",
      },
      {
        title: language === "en" ? "Service experience" : "Service experience",
        description: language === "en"
          ? `${selfService.summary.pendingRequests} self-service requests, ${insurance.summary.exclusions} insurance exclusions, and ${occupationalHealth.summary.openCases} open health cases remain visible across the ecosystem.`
          : `${selfService.summary.pendingRequests} solicitudes de autoservicio, ${insurance.summary.exclusions} exclusiones de seguro y ${occupationalHealth.summary.openCases} casos abiertos de salud quedan visibles en el ecosistema.`,
        tone: selfService.summary.pendingRequests + insurance.summary.exclusions + occupationalHealth.summary.openCases > 2 ? "warning" : "healthy",
      },
    ],
    quickActions: [
      { label: language === "en" ? "Executive headcount" : "Headcount ejecutivo", path: "/reports/headcount", helper: language === "en" ? "Distribution and corporate structure" : "Distribucion y estructura corporativa" },
      { label: language === "en" ? "Turnover" : "Rotacion", path: "/reports/rotation", helper: language === "en" ? "Entries, exits, and reasons" : "Entradas, salidas y razones" },
      { label: language === "en" ? "Compensation" : "Salarios", path: "/reports/salary", helper: language === "en" ? "Compensation and movements" : "Compensacion y movimientos" },
      { label: language === "en" ? "Compliance" : "Cumplimiento", path: "/reports/legal", helper: language === "en" ? "Documents, risks, and approvals" : "Documentos, riesgos y aprobaciones" },
      { label: language === "en" ? "Self Service" : "Autoservicio", path: "/reports/self-service", helper: language === "en" ? "Requests and employee-facing approvals" : "Solicitudes y aprobaciones visibles" },
      { label: language === "en" ? "Insurance" : "Seguros", path: "/reports/insurance", helper: language === "en" ? "Coverage and exclusions" : "Cobertura y exclusiones" },
      { label: language === "en" ? "Occupational Health" : "Salud ocupacional", path: "/reports/occupational-health", helper: language === "en" ? "Monitoring and incidents" : "Monitoreo e incidentes" },
    ],
  };
}

export async function exportReportMock(reportKey, format = "xlsx", filters = {}, language = "es") {
  return buildReportExportSummary(reportKey, format, filters, language);
}

export default {
  getReportsFiltersOptions,
  getReportsDashboard,
  exportReportMock,
};
