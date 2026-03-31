export default function RequisitionHeader({
  eyebrow,
  title,
  description,
  metrics = [],
  actions,
}) {
  return (
    <section className="requisition-header">
      <div className="requisition-header__copy">
        <span className="requisition-header__eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="requisition-header__aside">
        <div className="requisition-header__metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="requisition-header__metric">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.meta ? <small>{metric.meta}</small> : null}
            </article>
          ))}
        </div>
        {actions ? <div className="requisition-header__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
