export default function PersonnelActionsHeader({ eyebrow, title, description, actions = null }) {
  return (
    <section className="suite-hero suite-hero--actions">
      <span className="suite-eyebrow">{eyebrow}</span>
      <div className="suite-head">
        <div>
          <h1>{title}</h1>
          <p className="suite-muted">{description}</p>
        </div>
        {actions}
      </div>
    </section>
  );
}
