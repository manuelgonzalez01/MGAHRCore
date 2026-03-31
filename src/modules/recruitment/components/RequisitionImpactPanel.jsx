export default function RequisitionImpactPanel({ title, items = [] }) {
  return (
    <section className="requisition-card requisition-card--impact">
      <div className="requisition-card__header">
        <h3>{title}</h3>
      </div>
      <div className="requisition-impact-grid">
        {items.map((item) => (
          <article key={item.key} className={`requisition-impact-item tone-${item.tone || "neutral"}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
