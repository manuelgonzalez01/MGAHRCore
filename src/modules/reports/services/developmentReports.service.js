import { applyFilters, average, buildDistribution, round } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

export async function getTrainingReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const records = applyFilters(context.development.records, filters, { statusKey: "planStatus" });

  return {
    summary: {
      trackedEmployees: records.length,
      averageCompletion: round(average(records.map((item) => item.completion)), 1),
      activePlans: records.filter((item) => item.planStatus === "active").length,
      criticalGaps: records.filter((item) => item.readinessGap >= 60).length,
      averageSkillsCoverage: round(average(records.map((item) => item.skillsValidated * 18 + item.experienceDepth * 12)), 1),
    },
    participationByDepartment: buildDistribution(records, "departmentName", (item) => item.learningAssets),
    completionByManager: buildDistribution(records, "manager", (item) => item.completion),
    evaluations: buildDistribution(records, "evaluationCycle"),
    priorityEmployees: records
      .slice()
      .sort((left, right) => right.readinessGap - left.readinessGap || left.completion - right.completion)
      .slice(0, 10),
  };
}

export default { getTrainingReports };
