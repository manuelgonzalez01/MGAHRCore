import { formatCurrency, formatPercent } from "../utils/employee.helpers";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeSalaryOverview({ salary }) {
  const copy = useEmployeesCopy();

  return (
    <div className="employees-kpi-grid">
      <article className="employees-kpi"><span>{copy.salary.base}</span><strong>{formatCurrency(salary.baseSalary, salary.currency)}</strong><p className="employees-muted">{copy.salary.baseHelper}</p></article>
      <article className="employees-kpi"><span>{copy.salary.variable}</span><strong>{formatCurrency(salary.variable, salary.currency)}</strong><p className="employees-muted">{copy.salary.variableHelper}</p></article>
      <article className="employees-kpi"><span>{copy.salary.market}</span><strong>{formatCurrency(salary.marketMedian, salary.currency)}</strong><p className="employees-muted">{copy.salary.marketHelper}</p></article>
      <article className="employees-kpi"><span>{copy.salary.compaRatio}</span><strong>{formatPercent((salary.compaRatio || 0) * 100)}</strong><p className="employees-muted">{copy.salary.compaRatioHelper}</p></article>
    </div>
  );
}
