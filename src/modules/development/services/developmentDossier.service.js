import { round } from "../utils/development.helpers";
import { getDevelopmentDomain } from "./developmentDomain.service";

function buildTrainingStatus(trainingPrograms = [], employee) {
  const relevantPrograms = trainingPrograms.filter((program) =>
    program.audience === "General" || program.audience === employee.department,
  );

  return {
    assigned: relevantPrograms.length,
    completed: relevantPrograms.filter((program) => program.completionRate >= 85).length,
    pending: relevantPrograms.filter((program) => program.completionRate < 85).length,
    overdue: relevantPrograms.reduce((sum, item) => sum + (item.overdueCount || 0), 0),
    programs: relevantPrograms,
  };
}

function buildSkillGapSummary(skillProfiles = []) {
  const required = skillProfiles.filter((item) => item.required);
  const gaps = required.filter((item) => item.level === "critical_gap");

  return {
    requiredCount: required.length,
    validatedCount: required.length - gaps.length,
    gapCount: gaps.length,
    gapItems: gaps,
  };
}

function buildTalentTimeline({ employee, evaluations, plans, talentProfile, auditLog }) {
  const employeeHistory = Array.isArray(employee.history) ? employee.history : [];
  const developmentAudit = auditLog
    .filter((item) => item.employeeId === employee.id)
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      eyebrow: "Development",
      title: item.summary,
      date: new Date(item.createdAt).toISOString().slice(0, 10),
      description: `${item.actorName} | ${item.entityType}`,
      trailing: item.action,
    }));

  const evaluationEvents = evaluations.slice(0, 6).map((item) => ({
    id: `${item.id}-timeline`,
    eyebrow: "Evaluation",
    title: item.cycleName,
    date: item.completedAt || item.dueDate || "",
    description: `${item.status} | score ${item.score}`,
    trailing: `${item.readiness}%`,
  }));

  const planEvents = plans.slice(0, 6).map((item) => ({
    id: `${item.id}-plan`,
    eyebrow: "Plan",
    title: item.nextMilestone || item.workflowStatus,
    date: item.targetDate || "",
    description: `${item.workflowStatus} | ${item.currentStageOwner}`,
    trailing: `${item.progress}%`,
  }));

  const talentEvents = talentProfile ? [{
    id: `${talentProfile.id}-talent`,
    eyebrow: "Talent Review",
    title: talentProfile.successorFor || "Readiness review",
    date: talentProfile.lastUpdatedAt?.slice(0, 10) || "",
    description: `${talentProfile.successionReadiness} | ${talentProfile.reviewBoard}`,
    trailing: talentProfile.retentionRisk,
  }] : [];

  return [...talentEvents, ...developmentAudit, ...evaluationEvents, ...planEvents, ...employeeHistory]
    .filter((item) => item.title)
    .slice(0, 20);
}

export async function getEmployeeDevelopmentDossier(employeeId) {
  const domain = await getDevelopmentDomain();
  const employee = domain.employees.find((item) => item.id === employeeId) || null;

  if (!employee) {
    return null;
  }

  const skills = domain.skillProfiles.filter((item) => item.employeeId === employee.id);
  const evaluations = domain.evaluations.filter((item) => item.employeeId === employee.id)
    .sort((left, right) => String(right.completedAt || right.dueDate).localeCompare(String(left.completedAt || left.dueDate)));
  const plans = domain.plans.filter((item) => item.employeeId === employee.id)
    .sort((left, right) => String(right.lastUpdatedAt).localeCompare(String(left.lastUpdatedAt)));
  const talentProfile = domain.talentProfiles.find((item) => item.employeeId === employee.id) || null;
  const readiness = domain.readiness.find((item) => item.employeeId === employee.id) || null;
  const training = buildTrainingStatus(domain.trainingPrograms, employee);
  const gapSummary = buildSkillGapSummary(skills);
  const activePlan = plans.find((item) => !["completed", "archived", "rejected"].includes(item.workflowStatus)) || plans[0] || null;
  const latestEvaluation = evaluations[0] || null;
  const auditLog = domain.auditLog.filter((item) => item.employeeId === employee.id);
  const successorsForRole = domain.readiness
    .filter((item) => item.successorRoles.includes(employee.position))
    .map((item) => ({
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      readiness: item.promotionReadiness,
      potential: item.potential,
      comparisonSignal: item.comparisonSignal,
      retentionRisk: item.retentionRisk,
    }))
    .sort((left, right) => right.comparisonSignal - left.comparisonSignal);

  return {
    employee,
    readiness,
    talentProfile,
    skills,
    evaluations,
    plans,
    activePlan,
    latestEvaluation,
    training,
    gapSummary,
    auditLog,
    successorsForRole,
    summary: {
      readiness: readiness?.readiness || 0,
      potential: talentProfile?.potential || readiness?.potential || 0,
      activePlans: plans.filter((item) => !["completed", "archived", "rejected"].includes(item.workflowStatus)).length,
      completedTraining: training.completed,
      pendingTraining: training.pending,
      skillGaps: gapSummary.gapCount,
      evaluationScore: latestEvaluation?.score || 0,
      retentionRisk: talentProfile?.retentionRisk || readiness?.retentionRisk || "stable",
      mobility: talentProfile?.mobilityPreference || readiness?.mobilityPreference || "in-role",
      successionBenchDepth: successorsForRole.length,
      dossierStrength: round(((employee.profileCompletion || 0) + (employee.dossierReadiness || 0) + (readiness?.readiness || 0)) / 3, 0),
    },
    timeline: buildTalentTimeline({ employee, evaluations, plans, talentProfile, auditLog: domain.auditLog }),
  };
}

export default { getEmployeeDevelopmentDossier };
