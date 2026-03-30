import {
  applyFilters,
  average,
  buildDistribution,
  createMonthlySeries,
  formatPercent,
  round,
} from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

function getHeadcountScope(context, filters) {
  return applyFilters(context.employees, filters, { dateKey: "startDate", statusKey: "activeState" });
}

export async function getHeadcountReport(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const employees = getHeadcountScope(context, filters);
  const activeEmployees = employees.filter((item) => item.activeState === "active");
  const inactiveEmployees = employees.filter((item) => item.activeState !== "active");

  return {
    summary: {
      headcount: employees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: inactiveEmployees.length,
      averageTenure: round(average(employees.map((item) => item.tenureMonths)), 1),
      averageProfileCompletion: round(average(employees.map((item) => item.profileCompletion)), 0),
      averageCompensation: round(average(employees.map((item) => item.totalCompensation)), 0),
    },
    distribution: {
      companies: buildDistribution(employees, "companyName"),
      departments: buildDistribution(employees, "departmentName"),
      locations: buildDistribution(employees, "locationName"),
      positions: buildDistribution(employees, "positionName"),
      levels: buildDistribution(employees, "levelName"),
      employeeTypes: buildDistribution(employees, "employeeType"),
    },
    roster: employees
      .map((item) => ({
        employeeName: item.name,
        companyName: item.companyName,
        departmentName: item.departmentName,
        locationName: item.locationName,
        positionName: item.positionName,
        levelName: item.levelName,
        tenureMonths: item.tenureMonths,
        status: item.activeState,
      }))
      .sort((left, right) => right.tenureMonths - left.tenureMonths),
  };
}

export async function getRotationReport(filters = {}, contextOverride, language = "es") {
  const context = contextOverride || await getReportingContext();
  const events = applyFilters(context.personnelActions.rotationEvents, filters, { statusKey: "status" });
  const entries = events.filter((item) => item.type === "entry");
  const exits = events.filter((item) => item.type === "exit");
  const scopedEmployees = getHeadcountScope(context, filters);
  const averageHeadcount = scopedEmployees.length || 1;
  const turnoverRate = round((exits.length / averageHeadcount) * 100, 1);

  return {
    summary: {
      entries: entries.length,
      exits: exits.length,
      turnoverRate,
      netMovement: entries.length - exits.length,
      criticalReasons: exits.filter((item) => item.reason !== "Fin de contrato").length,
    },
    trend: {
      entries: createMonthlySeries(entries, "date"),
      exits: createMonthlySeries(exits, "date"),
    },
    reasons: buildDistribution(exits, "reason"),
    byDepartment: buildDistribution(events, "departmentName"),
    events: events.slice(0, 12),
    insights: [
      {
        title: "Rotacion observada",
        description: language === "en"
          ? `Turnover for the selected period stands at ${formatPercent(turnoverRate)} over the filtered headcount.`
          : `La tasa de rotacion del periodo se ubica en ${formatPercent(turnoverRate)} sobre el headcount filtrado.`,
        tone: turnoverRate > 12 ? "critical" : turnoverRate > 8 ? "warning" : "healthy",
      },
      {
        title: "Flujo neto",
        description: language === "en"
          ? `${entries.length} entries versus ${exits.length} exits within the selected analytic period.`
          : `${entries.length} entradas frente a ${exits.length} salidas dentro del periodo analitico.`,
        tone: entries.length >= exits.length ? "healthy" : "attention",
      },
    ],
  };
}

export async function getWorkforceRiskReport(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const employees = getHeadcountScope(context, filters);
  const lowReadiness = employees.filter((item) => item.dossierReadiness < 70);
  const leaveConcentration = applyFilters(context.vacations.requests, filters).filter((item) =>
    ["pending_manager_approval", "pending_hr_approval", "under_review"].includes(item.status),
  );
  const criticalDocuments = applyFilters(context.compliance.documents, filters, { dateKey: "expiresAt" }).filter((item) =>
    ["expired", "attention"].includes(item.status),
  );
  const openPositions = applyFilters(context.recruitment.jobRequests, filters).filter((item) =>
    ["open", "in_progress"].includes(item.status),
  );

  return {
    summary: {
      employeesAtRisk: lowReadiness.length,
      pendingCoverage: leaveConcentration.length,
      criticalDocuments: criticalDocuments.length,
      openStrategicPositions: openPositions.length,
    },
    matrix: [
      { domain: "Dossier readiness", value: lowReadiness.length, severity: lowReadiness.length > 3 ? "critical" : "warning" },
      { domain: "Cobertura operacional", value: leaveConcentration.length, severity: leaveConcentration.length > 2 ? "warning" : "healthy" },
      { domain: "Compliance documental", value: criticalDocuments.length, severity: criticalDocuments.length > 1 ? "critical" : "warning" },
      { domain: "Vacantes abiertas", value: openPositions.length, severity: openPositions.length > 2 ? "warning" : "healthy" },
    ],
    alerts: [
      ...lowReadiness.slice(0, 4).map((item) => ({
        title: item.name,
        domain: "Expediente",
        detail: `${item.departmentName} | readiness ${item.dossierReadiness}%`,
        severity: "warning",
      })),
      ...criticalDocuments.slice(0, 4).map((item) => ({
        title: item.employeeName,
        domain: "Compliance",
        detail: `${item.name} | ${item.category}`,
        severity: item.status === "expired" ? "critical" : "warning",
      })),
    ],
  };
}

export default {
  getHeadcountReport,
  getRotationReport,
  getWorkforceRiskReport,
};
