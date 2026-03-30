export default function DevelopmentStatsCards({ items = [] }) {
  return (
    <section className="development-kpis">
      {items.map((item) => (
        <article key={item.label} className="development-stat">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <p className="development-muted">{item.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}
