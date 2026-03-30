import { applyTalentFilters, average, buildDistribution, round } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

function getPerformanceBand(item) {
  if (item.readiness >= 80) {
    return "high";
  }

  if (item.readiness >= 65) {
    return "medium";
  }

  return "emerging";
}

function buildNineBox(readiness = []) {
  const xAxis = ["emerging", "medium", "high"];
  const yAxis = ["developing", "ready_soon", "ready_now"];

  return yAxis.flatMap((potentialBand) =>
    xAxis.map((performanceBand) => ({
      id: `${potentialBand}-${performanceBand}`,
      potentialBand,
      performanceBand,
      employees: readiness.filter((item) =>
        item.promotionReadiness === potentialBand && getPerformanceBand(item) === performanceBand,
      ),
    })),
  );
}

function buildCriticalRoles(domain, readiness) {
  const positionMap = new Map();

  readiness.forEach((item) => {
    if (!positionMap.has(item.role)) {
      positionMap.set(item.role, {
        role: item.role,
        sourceRole: item.role,
        positionId: "",
        levelName: item.levelName,
        benchCount: 0,
        readyNow: 0,
        readySoon: 0,
        criticalExposure: "critical",
        riskLevel: "high",
        coverageRate: 0,
        successors: [],
      });
    }
  });

  readiness.forEach((item) => {
    item.successorRoles.forEach((roleName) => {
      const current = positionMap.get(roleName) || {
        role: roleName,
        sourceRole: item.role,
        positionId: "",
      levelName: item.levelName,
      benchCount: 0,
      readyNow: 0,
      readySoon: 0,
      criticalExposure: "stable",
        riskLevel: "stable",
        coverageRate: 0,
        successors: [],
      };

      current.benchCount += 1;
      if (item.promotionReadiness === "ready_now") {
        current.readyNow += 1;
      }
      if (item.promotionReadiness === "ready_soon") {
        current.readySoon += 1;
      }
      current.successors.push({
        employeeName: item.employeeName,
        readiness: item.promotionReadiness,
        potential: item.potential,
        retentionRisk: item.retentionRisk,
        comparisonSignal: item.comparisonSignal,
      });

      current.coverageRate = current.readyNow > 0
        ? 100
        : current.readySoon > 0
          ? 65
          : 25;
      current.criticalExposure = current.readyNow > 0
        ? "covered"
        : current.readySoon > 0
          ? "watch"
          : "critical";
      current.riskLevel = current.readyNow > 1
        ? "low"
        : current.readySoon > 0
          ? "medium"
          : "high";

      positionMap.set(roleName, current);
    });
  });

  return [...positionMap.values()]
    .sort((left, right) => {
      const weight = { critical: 3, watch: 2, covered: 1 };
      return (weight[right.criticalExposure] || 0) - (weight[left.criticalExposure] || 0) || left.readyNow - right.readyNow;
    })
    .slice(0, 10);
}

export async function getTalentReadinessWorkspace(filters = {}) {
  const domain = await getDevelopmentDomain();
  const filteredReadiness = applyTalentFilters(domain.readiness, filters);
  const nineBox = buildNineBox(filteredReadiness);
  const criticalRoles = buildCriticalRoles(domain, filteredReadiness);
  const successionSlate = filteredReadiness.filter((item) => item.successorFor || item.promotionReadiness === "ready_now").slice(0, 12);

  return {
    talentProfiles: domain.talentProfiles,
    readiness: filteredReadiness,
    summary: {
      readyNow: filteredReadiness.filter((item) => item.promotionReadiness === "ready_now").length,
      readySoon: filteredReadiness.filter((item) => item.promotionReadiness === "ready_soon").length,
      criticalPriority: filteredReadiness.filter((item) => item.developmentPriority === "critical").length,
      averageReadiness: round(average(filteredReadiness.map((item) => item.readiness)), 1),
    },
    byLevel: buildDistribution(filteredReadiness, (item) => item.levelName),
    byReadiness: buildDistribution(filteredReadiness, (item) => item.promotionReadiness),
    nineBox,
    criticalRoles,
    successionSlate,
    successionSnapshots: domain.successionSnapshots.slice(0, 12),
    auditLog: domain.auditLog.filter((item) => item.entityType === "talent_profile").slice(0, 12),
  };
}

export default { getTalentReadinessWorkspace };
