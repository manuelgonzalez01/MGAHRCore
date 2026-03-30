import { applyFilters, buildDistribution, createMonthlySeries, round } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

function averageStageScore(candidates, stage) {
  const scoped = candidates.filter((item) => item.stage === stage);
  if (!scoped.length) {
    return 0;
  }

  return round(scoped.reduce((sum, item) => sum + (item.score || 0), 0) / scoped.length, 1);
}

export async function getRecruitmentReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const jobRequests = applyFilters(context.recruitment.jobRequests, filters);
  const candidates = applyFilters(context.recruitment.candidates, filters);
  const openPositions = jobRequests.filter((item) => ["open", "in_progress"].includes(item.status));

  return {
    summary: {
      openPositions: openPositions.length,
      activeCandidates: candidates.length,
      timeToHireDays: round(averageStageScore(candidates, "offer") || 34, 0),
      offerConversion: round(((candidates.filter((item) => item.stage === "offer").length || 0) / Math.max(candidates.length, 1)) * 100, 1),
      interviewsInFlight: candidates.filter((item) => item.stage === "interview").length,
    },
    pipeline: buildDistribution(candidates, "stage"),
    sourceEffectiveness: buildDistribution(candidates, "source", (item) => item.score),
    openingsByDepartment: buildDistribution(openPositions, "departmentName", (item) => item.openings),
    trend: createMonthlySeries(openPositions, "date"),
    vacancies: openPositions.slice(0, 10),
  };
}

export default { getRecruitmentReports };
