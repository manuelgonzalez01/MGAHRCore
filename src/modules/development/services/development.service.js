import { getDevelopmentPlansWorkspace } from "./developmentPlans.service";
import { getDevelopmentDomain } from "./developmentDomain.service";
import { getEvaluationsWorkspace } from "./evaluations.service";
import { getSkillsWorkspace } from "./skills.service";
import { getTalentReadinessWorkspace } from "./talentReadiness.service";
import { getTrainingProgramsWorkspace } from "./trainingPrograms.service";
import { buildPrimitiveOptions, buildSelectOptions, slugify } from "../utils/development.helpers";

export async function getDevelopmentDashboard(filters = {}, language = "es") {
  const [skillsWorkspace, evaluationsWorkspace, plansWorkspace, trainingWorkspace, readinessWorkspace, domain] = await Promise.all([
    getSkillsWorkspace(filters),
    getEvaluationsWorkspace(filters),
    getDevelopmentPlansWorkspace(filters),
    getTrainingProgramsWorkspace(filters),
    getTalentReadinessWorkspace(filters),
    getDevelopmentDomain(),
  ]);
  const gapSummary = skillsWorkspace.gapSummary || {
    skillsTracked: 0,
    criticalGaps: 0,
    departmentsWithGaps: 0,
    employeesCovered: 0,
  };

  return {
    stats: {
      employeesTracked: domain.employees.length,
      activePlans: plansWorkspace.summary.activePlans,
      criticalGaps: gapSummary.criticalGaps,
      learningAssets: trainingWorkspace.summary.enrollments,
      evaluationCycles: evaluationsWorkspace.summary.cycles,
      readyNow: readinessWorkspace.summary.readyNow,
      criticalRoles: readinessWorkspace.criticalRoles.filter((item) => item.criticalExposure === "critical").length,
    },
    skillsWorkspace,
    evaluationsWorkspace,
    plansWorkspace,
    trainingWorkspace,
    readinessWorkspace,
    quickActions: [
      { label: language === "en" ? "Skills" : "Habilidades", path: "/development/skills" },
      { label: language === "en" ? "Evaluations" : "Evaluaciones", path: "/development/evaluations" },
      { label: language === "en" ? "Plans" : "Planes", path: "/development/plan" },
      { label: language === "en" ? "Training" : "Capacitacion", path: "/development/training" },
      { label: language === "en" ? "Readiness" : "Readiness", path: "/development/readiness" },
      ...(domain.employees[0] ? [{ label: language === "en" ? "Talent dossier" : "Dossier de talento", path: `/development/dossier?employee=${domain.employees[0].id}` }] : []),
    ],
    insights: [
      {
        title: language === "en" ? "Critical capability gaps" : "Brechas criticas de capacidad",
        value: gapSummary.criticalGaps,
        helper: language === "en" ? "Role requirements without validated evidence." : "Requisitos del rol sin evidencia validada.",
      },
      {
        title: language === "en" ? "Evaluation coverage" : "Cobertura de evaluaciones",
        value: evaluationsWorkspace.summary.completedEvaluations,
        helper: language === "en" ? "Completed evaluations across active cycles." : "Evaluaciones completadas dentro de los ciclos activos.",
      },
      {
        title: language === "en" ? "Plans at risk" : "Planes en riesgo",
        value: plansWorkspace.summary.atRiskPlans,
        helper: language === "en" ? "Development plans requiring leadership follow-up." : "Planes de desarrollo que requieren seguimiento del liderazgo.",
      },
      {
        title: language === "en" ? "Promotion readiness" : "Preparacion para promocion",
        value: readinessWorkspace.summary.readyNow,
        helper: language === "en" ? "Employees ready for mobility or promotion scenarios." : "Colaboradores listos para movilidad o promocion.",
      },
      {
        title: language === "en" ? "Critical roles without bench" : "Roles criticos sin bench",
        value: readinessWorkspace.criticalRoles.filter((item) => item.criticalExposure === "critical").length,
        helper: language === "en" ? "Roles with no ready successor bench." : "Roles sin sucesor listo o en preparacion inmediata.",
      },
    ],
    gaps: skillsWorkspace.topGaps.map((item) => ({
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      role: item.positionName,
      level: item.levelName,
      readinessGap: 100,
      nextFocus: item.skillName,
    })),
    plans: domain.plans,
    skills: domain.readiness.map((item) => ({
      employeeName: item.employeeName,
      domain: item.role,
      validated: domain.skillProfiles.filter((skill) => skill.employeeId === item.employeeId && skill.level !== "critical_gap").length,
      experienceDepth: domain.employees.find((employee) => employee.id === item.employeeId)?.experience?.length || 0,
      potential: item.potential,
    })),
  };
}

export async function getDevelopmentFiltersOptions(language = "es") {
  const domain = await getDevelopmentDomain();
  const allLabel = language === "en" ? "All" : "Todos";
  const statusOptions = [
    { value: "draft", label: language === "en" ? "Draft" : "Borrador" },
    { value: "submitted", label: language === "en" ? "Submitted" : "Enviado" },
    { value: "manager_review", label: language === "en" ? "Manager review" : "Revision manager" },
    { value: "talent_review", label: language === "en" ? "Talent review" : "Revision talento" },
    { value: "approved", label: language === "en" ? "Approved" : "Aprobado" },
    { value: "returned_for_changes", label: language === "en" ? "Returned for changes" : "Devuelto con cambios" },
    { value: "rejected", label: language === "en" ? "Rejected" : "Rechazado" },
    { value: "in_progress", label: language === "en" ? "In progress" : "En progreso" },
    { value: "completed", label: language === "en" ? "Completed" : "Completado" },
    { value: "at_risk", label: language === "en" ? "At risk" : "En riesgo" },
    { value: "healthy", label: language === "en" ? "Healthy" : "Saludable" },
    { value: "attention", label: language === "en" ? "Attention" : "Atencion" },
    { value: "in_review", label: language === "en" ? "In review" : "En revision" },
    { value: "scheduled", label: language === "en" ? "Scheduled" : "Programada" },
  ];
  const readinessOptions = [
    { value: "ready_now", label: language === "en" ? "Ready now" : "Listo ahora" },
    { value: "ready_soon", label: language === "en" ? "Ready soon" : "Listo pronto" },
    { value: "developing", label: language === "en" ? "Developing" : "En desarrollo" },
  ];

  return {
    companies: [{ value: "", label: allLabel }, ...buildSelectOptions(domain.organizations.companies)],
    departments: [{ value: "", label: allLabel }, ...buildSelectOptions(domain.organizations.departments)],
    positions: [{ value: "", label: allLabel }, ...buildSelectOptions(domain.organizations.positions)],
    levels: [{ value: "", label: allLabel }, ...buildSelectOptions(domain.organizations.levels)],
    cycles: [{ value: "", label: allLabel }, ...domain.cycles.map((cycle) => ({ value: cycle.id, label: cycle.name }))],
    statuses: buildPrimitiveOptions(statusOptions, language),
    categories: buildPrimitiveOptions(domain.skillCatalog.map((item) => item.category), language),
    readiness: buildPrimitiveOptions(readinessOptions, language),
  };
}

export async function exportDevelopmentWorkspace(reportKey, format, filters = {}, language = "es") {
  return {
    ok: true,
    reportKey,
    format,
    filters,
    generatedAt: new Date().toISOString(),
    message: language === "en"
      ? `${reportKey} prepared for ${format.toUpperCase()} export`
      : `${reportKey} preparado para exportacion ${format.toUpperCase()}`,
    fileName: `${slugify(reportKey)}-${new Date().toISOString().slice(0, 10)}.${format}`,
  };
}

export default { getDevelopmentDashboard, getDevelopmentFiltersOptions, exportDevelopmentWorkspace };
