export default function RequisitionContextCard({ title, items = [], tone = "default" }) {
  return (
    <section className={`requisition-card requisition-card--${tone}`}>
      <div className="requisition-card__header">
        <h3>{title}</h3>
      </div>
      <div className="requisition-context-grid">
        {items.map((item) => (
          <article key={item.label} className="requisition-context-item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            {item.meta ? <p>{item.meta}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
