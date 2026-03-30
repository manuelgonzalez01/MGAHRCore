function getLanguage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return "es";
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? "en" : "es";
}

function t(es, en) {
  return getLanguage() === "en" ? en : es;
}

export function validatePersonnelActionInput(action = {}) {
  const errors = [];

  if (!action.employeeId) {
    errors.push(t("La accion requiere un colaborador.", "Personnel action requires an employee."));
  }
  if (!action.actionType) {
    errors.push(t("La accion requiere un tipo.", "Personnel action requires a type."));
  }
  if (!action.effectiveDate) {
    errors.push(t("La accion requiere una fecha efectiva.", "Personnel action requires an effective date."));
  }
  if (!action.reason?.trim()) {
    errors.push(t("La accion requiere un motivo.", "Personnel action requires a reason."));
  }

  return errors;
}
