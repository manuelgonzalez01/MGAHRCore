export default function DevelopmentHeader({ eyebrow, title, description, actions, badges = [] }) {
  return (
    <section className="suite-hero suite-hero--development">
      <span className="suite-eyebrow">{eyebrow}</span>
      <div className="suite-head">
        <div>
          <h1>{title}</h1>
          <p className="suite-muted">{description}</p>
          {badges.length > 0 ? (
            <div className="suite-badge-row">
              {badges.map((badge) => (
                <span key={`${badge.label}-${badge.value}`} className={`suite-badge ${badge.tone || "info"}`}>
                  {badge.label}: {badge.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions}
      </div>
    </section>
  );
}
