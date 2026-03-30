export default function SelfServiceStatsCards({ items = [] }) {
  return (
    <section className="suite-stats">
      {items.map((item) => (
        <article key={item.label} className="suite-stat">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <small>{item.helper}</small> : null}
        </article>
      ))}
    </section>
  );
}
