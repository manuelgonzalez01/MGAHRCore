function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateTerminationInput(action = {}) {
  const errors = [];
  if (action.actionType !== "termination") {
    return errors;
  }

  if (!action.reason?.trim()) {
    errors.push(t("La desvinculacion requiere un motivo.", "Termination requires a reason."));
  }
  if (!action.effectiveDate) {
    errors.push(t("La desvinculacion requiere una fecha efectiva.", "Termination requires an effective date."));
  }

  return errors;
}
