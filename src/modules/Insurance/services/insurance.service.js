import { buildInsuranceSelectOptions } from "../utils/insurance.helpers";
import { getInsuranceAnalytics, getInsuranceDomain } from "./insuranceDomain.service";

export async function getInsuranceDashboard() {
  const [domain, analytics] = await Promise.all([
    getInsuranceDomain(),
    getInsuranceAnalytics(),
  ]);

  const activeEnrollments = domain.enrollments.filter((item) => item.status === "active");
  const pendingEnrollments = domain.enrollments.filter((item) => item.status === "pending");
  const activePlans = domain.plans.filter((item) => item.status === "active");
  const pendingMovements = domain.movements.filter((item) => ["submitted", "pending", "scheduled"].includes(item.status));
  const recentMovements = [...domain.movements]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);

  return {
    plansCatalog: activePlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      coverage: plan.coverage,
      eligibility: plan.coverageScope,
      premium: `${plan.companyCurrency || "BOB"} ${plan.baseEmployeeCost}`,
      provider: plan.provider,
      type: plan.type,
      companyId: plan.companyId,
      companyName: plan.companyName,
    })),
    plans: domain.plans,
    inclusions: activeEnrollments.concat(pendingEnrollments).map((enrollment) => ({
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      employeeName: enrollment.employeeName,
      companyId: enrollment.companyId,
      company: enrollment.companyName,
      planId: enrollment.planId,
      plan: enrollment.planName,
      provider: enrollment.provider,
      dependentsCovered: enrollment.dependentIds.length,
      status: enrollment.status,
      employerCost: enrollment.employerCost,
      employeeCost: enrollment.employeeCost,
      totalCost: enrollment.totalCost,
      effectiveDate: enrollment.effectiveDate,
    })),
    exclusions: domain.movements
      .filter((movement) => movement.type === "exclusion" || movement.type === "plan_change")
      .slice(0, 12)
      .map((movement) => ({
        id: movement.id,
        employeeId: movement.employeeId,
        employeeName: movement.employeeName,
        companyId: movement.companyId,
        company: movement.companyName,
        reason: movement.reason,
        risk: movement.type === "plan_change" ? "Cambio de cobertura" : "Exclusion",
        impact: movement.toPlanName
          ? `${movement.fromPlanName || "-"} -> ${movement.toPlanName}`
          : movement.fromPlanName || "",
        status: movement.status,
      })),
    dependents: domain.dependents,
    movements: recentMovements,
    pendingMovements,
    auditLog: domain.auditLog.slice(0, 20),
    lifecycleEvents: domain.lifecycleEvents.slice(0, 20),
    costByCompany: analytics.costByCompany,
    costByPlan: analytics.costByPlan,
    providerMix: analytics.providerMix,
    stats: {
      ...analytics.summary,
      pendingInclusions: pendingEnrollments.length,
      pendingMovements: analytics.summary.pendingMovements,
    },
    options: {
      plans: buildInsuranceSelectOptions(domain.plans),
      companies: buildInsuranceSelectOptions(domain.organizations.companies),
    },
  };
}

export async function getInsuranceFiltersOptions(language = "es") {
  const domain = await getInsuranceDomain();
  const allLabel = language === "en" ? "All" : "Todos";
  const companies = [{ value: "", label: allLabel }, ...buildInsuranceSelectOptions(domain.organizations.companies)];
  const plans = [{ value: "", label: allLabel }, ...buildInsuranceSelectOptions(domain.plans)];
  const levels = [{ value: "", label: allLabel }, ...buildInsuranceSelectOptions(domain.organizations.levels)];
  const statuses = [
    { value: "", label: allLabel },
    { value: "active", label: language === "en" ? "Active" : "Activo" },
    { value: "pending", label: language === "en" ? "Pending" : "Pendiente" },
    { value: "excluded", label: language === "en" ? "Excluded" : "Excluido" },
    { value: "change_pending", label: language === "en" ? "Change pending" : "Cambio pendiente" },
    { value: "submitted", label: language === "en" ? "Submitted" : "Enviado" },
  ];
  const providers = [
    { value: "", label: allLabel },
    ...[...new Set(domain.plans.map((plan) => plan.provider).filter(Boolean))].map((provider) => ({ value: provider, label: provider })),
  ];
  const employeeTypes = [
    { value: "", label: allLabel },
    ...[...new Set(domain.employees.map((employee) => employee.employeeType).filter(Boolean))].map((employeeType) => ({ value: employeeType, label: employeeType })),
  ];

  return { companies, plans, statuses, providers, employeeTypes, levels };
}

export async function exportInsuranceWorkspace(reportKey, format, filters = {}, language = "es") {
  return {
    ok: true,
    reportKey,
    format,
    filters,
    generatedAt: new Date().toISOString(),
    message: language === "en"
      ? `${reportKey} prepared for ${format.toUpperCase()} export`
      : `${reportKey} preparado para exportacion ${format.toUpperCase()}`,
    fileName: `insurance-${reportKey}-${new Date().toISOString().slice(0, 10)}.${format}`,
  };
}

export default {
  getInsuranceDashboard,
  getInsuranceFiltersOptions,
  exportInsuranceWorkspace,
};
