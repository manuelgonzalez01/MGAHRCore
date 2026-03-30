function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateTransferInput(action = {}) {
  const errors = [];
  if (!["transfer", "department_change", "location_change", "position_change", "supervisor_change"].includes(action.actionType)) {
    return errors;
  }

  if (!action.targetDepartmentId && !action.targetLocationId && !action.targetPositionId && !action.targetSupervisor) {
    errors.push(t("El traslado requiere un destino organizacional.", "Transfer requires an organizational destination."));
  }

  return errors;
}
