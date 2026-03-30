import { applyFilters, buildDistribution } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

export async function getSelfServiceReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const requests = applyFilters(context.selfService.requests, filters, { statusKey: "status" });
  const approvals = applyFilters(context.selfService.approvals, filters, { statusKey: "status" });

  return {
    summary: {
      pendingRequests: context.selfService.stats.pendingRequests || requests.filter((item) => item.status === "pending").length,
      approvedRequests: context.selfService.stats.approvedRequests || requests.filter((item) => item.status === "approved").length,
      visibleApprovals: context.selfService.stats.approvalsVisible || approvals.length,
      vacationBalance: context.selfService.stats.vacationBalance || 0,
    },
    byType: buildDistribution(requests, "type"),
    approvalQueue: approvals.slice(0, 10),
    requests: requests.slice(0, 10),
  };
}

export async function getInsuranceReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const inclusions = applyFilters(context.insurance.inclusions, filters, { statusKey: "status" });
  const exclusions = applyFilters(context.insurance.exclusions, filters);

  return {
    summary: {
      activePlans: context.insurance.stats.activePlans || 0,
      coveredEmployees: context.insurance.stats.coveredEmployees || inclusions.filter((item) => item.status === "active").length,
      coveredDependents: context.insurance.stats.coveredDependents || inclusions.reduce((sum, item) => sum + (item.dependentsCovered || 0), 0),
      exclusions: context.insurance.stats.exclusions || exclusions.length,
    },
    byPlan: buildDistribution(inclusions, "plan"),
    byCompany: buildDistribution(inclusions, "companyName"),
    exclusions: exclusions.slice(0, 10),
    plansCatalog: context.insurance.plansCatalog || [],
  };
}

export async function getOccupationalHealthReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const visits = applyFilters(context.occupationalHealth.visits, filters, { statusKey: "status" });
  const injuries = applyFilters(context.occupationalHealth.injuries, filters, { statusKey: "status" });
  const labs = applyFilters(context.occupationalHealth.labs, filters, { statusKey: "status" });

  return {
    summary: {
      visits: context.occupationalHealth.stats.visits || visits.length,
      openCases: context.occupationalHealth.stats.openCases || injuries.filter((item) => item.status !== "Cerrado").length,
      pendingLabs: context.occupationalHealth.stats.pendingLabs || labs.filter((item) => item.status === "scheduled").length,
      monitoredEmployees: context.occupationalHealth.stats.monitoredEmployees || visits.length,
    },
    byDepartment: buildDistribution(injuries, "departmentName"),
    byVisitStatus: buildDistribution(visits, "status"),
    injuries: injuries.slice(0, 10),
    labs: labs.slice(0, 10),
  };
}

export default {
  getSelfServiceReports,
  getInsuranceReports,
  getOccupationalHealthReports,
};
