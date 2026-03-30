function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateInsurancePlanInput(plan = {}) {
  const errors = [];

  if (!plan.companyId) {
    errors.push(t("El plan requiere una compania.", "Insurance plan requires a company."));
  }
  if (!plan.name?.trim()) {
    errors.push(t("El plan requiere un nombre.", "Insurance plan requires a name."));
  }
  if (!plan.provider?.trim()) {
    errors.push(t("El plan requiere un proveedor.", "Insurance plan requires a provider."));
  }
  if (!plan.type?.trim()) {
    errors.push(t("El plan requiere un tipo.", "Insurance plan requires a type."));
  }
  if (!plan.coverageScope?.trim()) {
    errors.push(t("El plan requiere un alcance de cobertura.", "Insurance plan requires a coverage scope."));
  }

  const employerShare = Number(plan.employerShare) || 0;
  const employeeShare = Number(plan.employeeShare) || 0;
  if (employerShare < 0 || employeeShare < 0) {
    errors.push(t("Los porcentajes de costo no pueden ser negativos.", "Insurance cost shares cannot be negative."));
  }
  if (employerShare + employeeShare !== 100) {
    errors.push(t("La distribucion del costo debe sumar 100%.", "Insurance cost shares must total 100%."));
  }
  if ((Number(plan.baseEmployeeCost) || 0) < 0 || (Number(plan.baseDependentCost) || 0) < 0) {
    errors.push(t("Los costos del plan no pueden ser negativos.", "Insurance plan costs cannot be negative."));
  }

  if (plan.effectiveFrom && plan.effectiveTo && new Date(plan.effectiveFrom) > new Date(plan.effectiveTo)) {
    errors.push(t("La fecha fin del plan no puede ser anterior al inicio.", "Insurance plan end date cannot be earlier than start date."));
  }

  return errors;
}
