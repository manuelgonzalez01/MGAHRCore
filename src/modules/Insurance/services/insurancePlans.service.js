import { applyInsuranceFilters, buildInsuranceSelectOptions } from "../utils/insurance.helpers";
import { getInsuranceAnalytics, getInsuranceDomain, saveInsurancePlan } from "./insuranceDomain.service";

export async function getInsurancePlansWorkspace(filters = {}) {
  const domain = await getInsuranceDomain();
  const analytics = await getInsuranceAnalytics();
  const plans = applyInsuranceFilters(domain.plans, filters).map((plan) => {
    const planEnrollments = domain.enrollments.filter((enrollment) => enrollment.planId === plan.id);
    const planDependents = domain.dependents.filter((dependent) => dependent.planId === plan.id);

    return {
      ...plan,
      enrolledEmployees: planEnrollments.filter((enrollment) => enrollment.status === "active").length,
      coveredDependents: planDependents.filter((dependent) => dependent.status === "active").length,
      totalCost: planEnrollments.reduce((sum, enrollment) => sum + (Number(enrollment.totalCost) || 0), 0),
    };
  });

  return {
    plans,
    summary: analytics.summary,
    planOptions: buildInsuranceSelectOptions(domain.plans),
    auditLog: domain.auditLog.filter((entry) => entry.entityType === "plan").slice(0, 20),
  };
}

export async function getInsurancePlanDetail(planId) {
  const domain = await getInsuranceDomain();
  const plan = domain.plans.find((item) => item.id === planId) || null;

  if (!plan) {
    return null;
  }

  const enrollments = domain.enrollments.filter((item) => item.planId === planId);
  const dependents = domain.dependents.filter((item) => item.planId === planId);
  const movements = domain.movements.filter((item) => item.fromPlanId === planId || item.toPlanId === planId);
  const allowedLevelNames = (plan.allowedLevelIds || []).map((levelId) =>
    domain.organizations.levels.find((item) => item.id === levelId)?.name).filter(Boolean);
  const totals = {
    employerCost: enrollments.reduce((sum, item) => sum + (Number(item.employerCost) || 0), 0),
    employeeCost: enrollments.reduce((sum, item) => sum + (Number(item.employeeCost) || 0), 0),
    totalCost: enrollments.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0),
  };

  return {
    plan,
    eligibility: {
      employeeTypes: plan.allowedEmployeeTypes || [],
      levels: allowedLevelNames,
    },
    enrollments,
    dependents,
    movements,
    totals,
    auditLog: domain.auditLog.filter((entry) => entry.entityId === planId || entry.metadata?.companyId === plan.companyId).slice(0, 25),
    lifecycleEvents: domain.lifecycleEvents.filter((event) => enrollments.some((item) => item.employeeId === event.employeeId)).slice(0, 25),
  };
}

export { saveInsurancePlan };

export default {
  getInsurancePlansWorkspace,
  getInsurancePlanDetail,
  saveInsurancePlan,
};
