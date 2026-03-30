export default function AdministrationStatsCards({ items = [] }) {
  return (
    <div className="administration-stats-grid">
      {items.map((item) => (
        <article key={item.key} className="administration-stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p className="administration-muted">{item.trend}</p>
        </article>
      ))}
    </div>
  );
}
