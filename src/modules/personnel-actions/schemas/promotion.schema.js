function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validatePromotionInput(action = {}) {
  const errors = [];
  if (action.actionType !== "promotion") {
    return errors;
  }

  if (!action.targetPositionId && !action.targetLevelId) {
    errors.push(t("La promocion requiere nueva posicion o nivel.", "Promotion requires a new position or level."));
  }

  return errors;
}
