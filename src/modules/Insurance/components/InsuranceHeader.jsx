export default function InsuranceHeader({ eyebrow, title, description, badges = [], actions }) {
  return (
    <section className="suite-hero suite-hero--insurance insurance-hero">
      <span className="suite-eyebrow">{eyebrow}</span>
      <div className="suite-head">
        <div>
          <h1>{title}</h1>
          <p className="suite-muted">{description}</p>
          {badges.length ? (
            <div className="suite-badge-row">
              {badges.map((badge) => (
                <span key={`${badge.label}-${badge.value}`} className={`suite-badge ${badge.tone || "info"}`}>
                  {badge.label}: {badge.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="suite-inline-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
