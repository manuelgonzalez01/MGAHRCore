export default function AdministrationHeader({ eyebrow, title, description, actions, highlights = [] }) {
  return (
    <section className="administration-hero">
      <span className="administration-eyebrow">{eyebrow}</span>
      <div className="administration-title-row">
        <div>
          <h1>{title}</h1>
          <p className="administration-muted">{description}</p>
        </div>
        <div className="administration-inline-actions">{actions}</div>
      </div>
      <div className="administration-kpi-grid">
        {highlights.map((item) => (
          <article key={item.label} className="administration-stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p className="administration-muted">{item.trend}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
