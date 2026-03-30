import { applyTalentFilters, buildDistribution } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

export async function getSkillsWorkspace(filters = {}) {
  const domain = await getDevelopmentDomain();
  const filteredProfiles = applyTalentFilters(domain.skillProfiles, filters);
  const criticalGaps = filteredProfiles.filter((item) => item.level === "critical_gap");

  return {
    employees: domain.employees,
    organizations: domain.organizations,
    catalog: domain.skillCatalog,
    matrix: filteredProfiles,
    gapSummary: {
      skillsTracked: domain.skillCatalog.length,
      criticalGaps: criticalGaps.length,
      departmentsWithGaps: new Set(criticalGaps.map((item) => item.departmentName)).size,
      employeesCovered: new Set(filteredProfiles.map((item) => item.employeeId)).size,
    },
    byCategory: buildDistribution(domain.skillCatalog, (item) => item.category),
    byDepartment: buildDistribution(criticalGaps, (item) => item.departmentName),
    topGaps: criticalGaps.slice(0, 12),
  };
}

export default { getSkillsWorkspace };
