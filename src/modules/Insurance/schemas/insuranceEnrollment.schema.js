function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateInsuranceEnrollmentInput({ employee, plan, input, currentEnrollments = [] }) {
  const errors = [];

  if (!employee) {
    errors.push(t("La afiliacion requiere un colaborador valido.", "Insurance enrollment requires a valid employee."));
  }
  if (!plan) {
    errors.push(t("La afiliacion requiere un plan valido.", "Insurance enrollment requires a valid plan."));
  }
  if (!input.effectiveDate) {
    errors.push(t("La afiliacion requiere una fecha efectiva.", "Insurance enrollment requires an effective date."));
  }

  if (plan?.effectiveFrom && input.effectiveDate && new Date(input.effectiveDate) < new Date(plan.effectiveFrom)) {
    errors.push(t("La fecha efectiva no puede ser anterior al inicio del plan.", "Insurance enrollment effective date cannot be earlier than the plan start date."));
  }
  if (plan?.effectiveTo && input.effectiveDate && new Date(input.effectiveDate) > new Date(plan.effectiveTo)) {
    errors.push(t("La fecha efectiva no puede ser posterior al fin del plan.", "Insurance enrollment effective date cannot be later than the plan end date."));
  }

  const overlapping = currentEnrollments.find((item) =>
    item.id !== input.id
    && item.employeeId === input.employeeId
    && ["active", "pending", "change_pending"].includes(item.status));
  if (overlapping) {
    errors.push(t("El colaborador ya tiene una afiliacion activa o pendiente.", "Employee already has an active or pending insurance enrollment."));
  }

  return errors;
}
