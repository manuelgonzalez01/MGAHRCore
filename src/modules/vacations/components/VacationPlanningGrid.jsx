import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationPlanningGrid({ plans = [] }) {
  const { copy } = useVacationLocale();
  const riskLabels = {
    watch: copy.watch,
    healthy: copy.healthy,
  };

  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{copy.period}</th>
            <th>{copy.employee}</th>
            <th>{copy.plan}</th>
            <th>{copy.execution}</th>
            <th>{copy.variance}</th>
            <th>{copy.compliance}</th>
            <th>{copy.risk}</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.month}</td>
              <td>
                <strong>{plan.employeeName}</strong>
                <p className="suite-muted">{plan.department}</p>
              </td>
              <td>{plan.plannedDays}</td>
              <td>{plan.executedDays || 0}</td>
              <td>{plan.varianceDays || 0}</td>
              <td>{Math.round((plan.complianceRatio || 0) * 100)}%</td>
              <td>{riskLabels[plan.coverageRisk] || plan.coverageRisk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
