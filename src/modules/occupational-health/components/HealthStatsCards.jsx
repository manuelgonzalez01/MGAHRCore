export default function HealthStatsCards({ items = [] }) {
  return (
    <section className="health-stats-grid">
      {items.map((item) => (
        <article key={item.label} className="suite-stat">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.caption ? <small className="suite-muted">{item.caption}</small> : null}
        </article>
      ))}
    </section>
  );
}
