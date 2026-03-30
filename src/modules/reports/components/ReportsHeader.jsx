export default function ReportsHeader({ eyebrow, title, description, actions, badges = [] }) {
  return (
    <section className="reports-hero">
      <span className="reports-eyebrow">{eyebrow}</span>
      <div className="reports-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          {badges.length > 0 && (
            <div className="reports-badge-row">
              {badges.map((badge) => (
                <span key={`${badge.label}-${badge.value}`} className={`reports-status ${badge.status || "neutral"}`}>
                  {badge.label}: {badge.value}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions ? <div className="reports-header__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
