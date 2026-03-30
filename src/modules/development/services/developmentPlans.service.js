import { applyTalentFilters, average, buildDistribution, round } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

export async function getDevelopmentPlansWorkspace(filters = {}) {
  const domain = await getDevelopmentDomain();
  const filteredPlans = applyTalentFilters(domain.plans, filters);
  const activeStatuses = ["draft", "submitted", "manager_review", "talent_review", "approved", "returned_for_changes"];

  return {
    employees: domain.employees,
    organizations: domain.organizations,
    plans: filteredPlans,
    auditLog: domain.auditLog.filter((item) => item.entityType.startsWith("development_plan")).slice(0, 16),
    summary: {
      activePlans: filteredPlans.filter((item) => activeStatuses.includes(item.workflowStatus || item.status)).length,
      atRiskPlans: filteredPlans.filter((item) => item.healthStatus === "at_risk").length,
      completedPlans: filteredPlans.filter((item) => item.workflowStatus === "completed" || item.status === "completed").length,
      pendingApprovals: filteredPlans.filter((item) => ["submitted", "manager_review", "talent_review"].includes(item.workflowStatus || item.status)).length,
      averageProgress: round(average(filteredPlans.map((item) => item.progress)), 1),
    },
    byOwner: buildDistribution(filteredPlans, (item) => item.owner),
    byDepartment: buildDistribution(filteredPlans, (item) => item.departmentName, (item) => item.progress),
    byWorkflow: buildDistribution(filteredPlans, (item) => item.workflowStatus || item.status),
  };
}

export default { getDevelopmentPlansWorkspace };
