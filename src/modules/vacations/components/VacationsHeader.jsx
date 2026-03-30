export default function VacationsHeader({
  eyebrow,
  title,
  description,
  badges = [],
  actions = null,
}) {
  return (
    <section className="suite-hero suite-hero--vacations">
      <span className="suite-eyebrow">{eyebrow}</span>
      <div className="suite-head">
        <div>
          <h1>{title}</h1>
          <p className="suite-muted">{description}</p>
          {badges.length > 0 ? (
            <div className="suite-badge-row">
              {badges.map((badge) => (
                <span className={`suite-badge ${badge.tone || "neutral"}`} key={`${badge.label}-${badge.value}`}>
                  {badge.value ? `${badge.label}: ${badge.value}` : badge.label}
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
