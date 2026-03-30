export default function DevelopmentSectionCard({ title, description, children, actions }) {
  return (
    <section className="development-card">
      <div className="development-card__head">
        <div>
          <h2>{title}</h2>
          {description ? <p className="development-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
