export default function PersonnelActionsStatsCards({ items = [] }) {
  return (
    <section className="personnel-actions-stats">
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
