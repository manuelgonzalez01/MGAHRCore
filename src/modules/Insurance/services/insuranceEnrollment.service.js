import { applyInsuranceFilters } from "../utils/insurance.helpers";
import { getInsuranceDomain, saveInsuranceEnrollment, saveInsuranceExclusion, transitionInsuranceWorkflow } from "./insuranceDomain.service";

export async function getInsuranceInclusionWorkspace(filters = {}) {
  const domain = await getInsuranceDomain();
  const activeEmployeeIds = new Set(domain.enrollments.filter((item) => item.status === "active").map((item) => item.employeeId));
  const eligibleEmployees = domain.employees
    .filter((employee) => ["active", "leave"].includes(employee.status))
    .filter((employee) => !activeEmployeeIds.has(employee.id))
    .map((employee) => ({
      id: employee.id,
      employeeId: employee.id,
      employeeName: employee.name,
      companyId: employee.companyId,
      companyName: employee.company,
      departmentName: employee.department,
      positionName: employee.position,
      levelId: employee.levelId,
      levelName: employee.levelName,
      employeeType: employee.employeeType,
      dependents: employee.dependents || [],
      eligiblePlans: domain.plans.filter((plan) => plan.companyId === employee.companyId && (!plan.allowedEmployeeTypes.length || plan.allowedEmployeeTypes.includes(employee.employeeType)) && (!plan.allowedLevelIds.length || plan.allowedLevelIds.includes(employee.levelId))),
      recommendedPlanId: domain.plans.find((plan) => plan.companyId === employee.companyId && (!plan.allowedEmployeeTypes.length || plan.allowedEmployeeTypes.includes(employee.employeeType)) && (!plan.allowedLevelIds.length || plan.allowedLevelIds.includes(employee.levelId)))?.id || "",
      status: "pending",
    }));

  return {
    eligibleEmployees: applyInsuranceFilters(eligibleEmployees, filters),
    enrollments: applyInsuranceFilters(domain.enrollments, filters).filter((item) => ["active", "pending"].includes(item.status)),
    plans: domain.plans,
    employees: domain.employees,
    auditLog: domain.auditLog.filter((entry) => ["enrollment", "movement"].includes(entry.entityType)).slice(0, 25),
    lifecycleEvents: domain.lifecycleEvents.slice(0, 30),
  };
}

export async function getInsuranceExclusionWorkspace(filters = {}) {
  const domain = await getInsuranceDomain();
  return {
    activeEnrollments: applyInsuranceFilters(domain.enrollments, filters).filter((item) =>
      ["active", "change_pending", "pending"].includes(item.status)),
    movements: applyInsuranceFilters(domain.movements, filters).slice(0, 20),
    plans: domain.plans,
    auditLog: domain.auditLog.filter((entry) => entry.entityType === "movement").slice(0, 25),
    lifecycleEvents: domain.lifecycleEvents.slice(0, 30),
  };
}

export { saveInsuranceEnrollment, saveInsuranceExclusion, transitionInsuranceWorkflow };

export default {
  getInsuranceInclusionWorkspace,
  getInsuranceExclusionWorkspace,
  saveInsuranceEnrollment,
  saveInsuranceExclusion,
};
