import { applyFilters, average, buildDistribution, round } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

export async function getVacationReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const requests = applyFilters(context.vacations.requests, filters);
  const balances = applyFilters(context.vacations.balances, filters);

  return {
    summary: {
      consumedDays: requests.filter((item) => ["approved", "scheduled", "consumed"].includes(item.status)).reduce((sum, item) => sum + (item.balanceImpactDays || 0), 0),
      pendingApprovals: requests.filter((item) => ["pending_manager_approval", "pending_hr_approval", "under_review"].includes(item.status)).length,
      averageBalance: round(average(balances.map((item) => item.available)), 1),
      absenteeismSignals: requests.filter((item) => item.type === "Permiso" || item.balanceImpactDays <= 2).length,
    },
    consumptionByDepartment: buildDistribution(requests, "departmentName", (item) => item.balanceImpactDays),
    approvalsByManager: buildDistribution(requests.filter((item) => item.manager), "manager"),
    balanceRisk: balances
      .filter((item) => item.available < 5 || item.carriedOver > 0)
      .sort((left, right) => left.available - right.available)
      .slice(0, 10),
    patterns: buildDistribution(requests, "status", (item) => item.balanceImpactDays),
  };
}

export default { getVacationReports };
