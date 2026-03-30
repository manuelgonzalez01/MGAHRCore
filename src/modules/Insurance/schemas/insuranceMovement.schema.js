function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateInsuranceMovementInput({ enrollment, newPlan, employee, input }) {
  const errors = [];

  if (!enrollment) {
    errors.push(t("El movimiento requiere una afiliacion valida.", "Insurance movement requires a valid enrollment."));
  }
  if (!input.effectiveDate) {
    errors.push(t("El movimiento requiere una fecha efectiva.", "Insurance movement requires an effective date."));
  }
  if (!input.reason?.trim()) {
    errors.push(t("El movimiento requiere un motivo.", "Insurance movement requires a reason."));
  }

  if (enrollment?.effectiveDate && input.effectiveDate && new Date(input.effectiveDate) < new Date(enrollment.effectiveDate)) {
    errors.push(t("La fecha del movimiento no puede ser anterior a la afiliacion.", "Insurance movement effective date cannot be earlier than the enrollment effective date."));
  }

  if (input.type === "plan_change" && !newPlan) {
    errors.push(t("El cambio de plan requiere un plan destino.", "Insurance plan change requires a destination plan."));
  }

  if (newPlan?.effectiveFrom && input.effectiveDate && new Date(input.effectiveDate) < new Date(newPlan.effectiveFrom)) {
    errors.push(t("La fecha del movimiento no puede ser anterior al inicio del plan destino.", "Insurance movement date cannot be earlier than the destination plan start date."));
  }
  if (newPlan?.effectiveTo && input.effectiveDate && new Date(input.effectiveDate) > new Date(newPlan.effectiveTo)) {
    errors.push(t("La fecha del movimiento no puede ser posterior al fin del plan destino.", "Insurance movement date cannot be later than the destination plan end date."));
  }

  if (employee && enrollment && employee.id !== enrollment.employeeId) {
    errors.push(t("Se detecto una inconsistencia entre colaborador y afiliacion.", "Insurance movement employee mismatch detected."));
  }

  return errors;
}
