export default function VacationsKpiCards({ items = [] }) {
  return (
    <section className="suite-stats">
      {items.map((item) => (
        <article className="suite-stat" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p className="suite-muted">{item.helper}</p>
        </article>
      ))}
    </section>
  );
}
