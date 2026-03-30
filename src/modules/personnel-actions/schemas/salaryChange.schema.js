function t(es, en) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return es;
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? en : es;
}

export function validateSalaryChangeInput(action = {}, currentSalary = 0) {
  const errors = [];
  if (action.actionType !== "salary_change") {
    return errors;
  }

  const targetSalary = Number(action.targetSalary);
  if (!targetSalary || targetSalary <= 0) {
    errors.push(t("El cambio salarial requiere un salario destino valido.", "Salary change requires a valid target salary."));
  }
  if (targetSalary === Number(currentSalary || 0)) {
    errors.push(t("El salario destino debe ser distinto al actual.", "Target salary must differ from current salary."));
  }

  return errors;
}
