import useI18n from "../../../app/providers/useI18n";
import employeesCopy from "../content/employees.copy";

export default function useEmployeesCopy() {
  const { language } = useI18n();
  return employeesCopy[language] || employeesCopy.es;
}
