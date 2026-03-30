export default function SelfServiceHeader({ eyebrow, title, description, actions = null }) {
  return (
    <section className="suite-hero suite-hero--self-service">
      <span className="suite-eyebrow">{eyebrow}</span>
      <div className="suite-head">
        <div>
          <h1>{title}</h1>
          <p className="suite-muted">{description}</p>
        </div>
        {actions ? <div className="self-service-header-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
