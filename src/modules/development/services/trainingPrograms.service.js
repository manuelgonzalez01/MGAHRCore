import { applyTalentFilters, buildDistribution } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

export async function getTrainingProgramsWorkspace(filters = {}) {
  const domain = await getDevelopmentDomain();
  const filteredPrograms = applyTalentFilters(domain.trainingPrograms, filters);

  return {
    employees: domain.employees,
    organizations: domain.organizations,
    programs: filteredPrograms,
    summary: {
      programs: filteredPrograms.length,
      mandatoryPrograms: filteredPrograms.filter((item) => item.mandatory).length,
      healthyPrograms: filteredPrograms.filter((item) => item.status === "healthy").length,
      enrollments: filteredPrograms.reduce((sum, item) => sum + item.enrolled, 0),
    },
    byCategory: buildDistribution(filteredPrograms, (item) => item.category),
    byAudience: buildDistribution(filteredPrograms, (item) => item.audience, (item) => item.enrolled),
  };
}

export default { getTrainingProgramsWorkspace };
