export default function ReportsSectionCard({ title, description, actions, children }) {
  return (
    <section className="reports-card">
      <div className="reports-card__head">
        <div>
          <h2>{title}</h2>
          {description ? <p className="reports-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
