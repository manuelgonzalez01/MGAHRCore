export default function AdministrationSectionCard({ title, description, actions, children, className = "" }) {
  return (
    <section className={`administration-panel ${className}`.trim()}>
      <header className="administration-panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p className="administration-muted">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
