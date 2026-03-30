import employeesService from "./employees.service";
import { isSupportedCurrency } from "../../administration/utils/currency.options";

function getCurrentLanguage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return "es";
  }

  const directLanguage = window.localStorage.getItem("mgahrcore.language");
  if (directLanguage === "en" || directLanguage === "es") {
    return directLanguage;
  }

  return "es";
}

export async function saveEmployeeSalary(employee, salary) {
  const currency = isSupportedCurrency(salary.currency) ? salary.currency : (employee.salary?.currency || "BOB");
  const isEnglish = getCurrentLanguage() === "en";

  return employeesService.saveEmployee({
    ...employee,
    salary: {
      ...(employee.salary || {}),
      ...salary,
      currency,
      salaryHistory: [
        {
          effectiveDate: new Date().toISOString().slice(0, 10),
          baseSalary: Number(salary.baseSalary) || 0,
          change: isEnglish ? "Manual update" : "Actualizacion manual",
          reason: isEnglish ? "Compensation review" : "Revision de compensacion",
        },
        ...((employee.salary?.salaryHistory || []).filter(
          (item) => item.effectiveDate !== new Date().toISOString().slice(0, 10)
        )),
      ],
    },
  });
}

export default { saveEmployeeSalary };
