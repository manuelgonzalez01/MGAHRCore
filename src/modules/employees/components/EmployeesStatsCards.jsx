export default function EmployeesStatsCards({ items = [] }) {
  return (
    <div className="employees-stats-grid">
      {items.map((item) => (
        <article key={item.key} className={`employees-stat-card employees-stat-card--${item.key}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p className="employees-muted">{item.trend}</p>
        </article>
      ))}
    </div>
  );
}
