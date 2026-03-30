import { applyTalentFilters, average, buildDistribution, round } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

export async function getEvaluationsWorkspace(filters = {}) {
  const domain = await getDevelopmentDomain();
  const filteredEvaluations = applyTalentFilters(domain.evaluations, filters);
  const completed = filteredEvaluations.filter((item) => item.status === "completed");

  return {
    employees: domain.employees,
    organizations: domain.organizations,
    cycles: domain.cycles.map((cycle) => ({
      ...cycle,
      employeesIncluded: filteredEvaluations.filter((item) => item.cycleId === cycle.id).length,
      completedCount: filteredEvaluations.filter((item) => item.cycleId === cycle.id && item.status === "completed").length,
    })),
    evaluations: filteredEvaluations,
    summary: {
      cycles: domain.cycles.length,
      completedEvaluations: completed.length,
      inProgressEvaluations: filteredEvaluations.filter((item) => item.status !== "completed").length,
      averageScore: round(average(filteredEvaluations.map((item) => item.score)), 1),
    },
    byDepartment: buildDistribution(filteredEvaluations, (item) => item.departmentName, (item) => item.score),
    statusDistribution: buildDistribution(filteredEvaluations, (item) => item.status),
  };
}

export default { getEvaluationsWorkspace };
