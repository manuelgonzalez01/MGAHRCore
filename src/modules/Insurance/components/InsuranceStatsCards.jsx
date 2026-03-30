export default function InsuranceStatsCards({ items = [] }) {
  return (
    <section className="suite-stats">
      {items.map((item) => (
        <article className="suite-stat" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <p>{item.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}
