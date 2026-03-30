export default function RecruitmentHeader({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  highlights = [],
  children,
}) {
  return (
    <section className="recruitment-hero">
      <span className="recruitment-eyebrow">{eyebrow}</span>
      <div className="recruitment-title-row">
        <div className="recruitment-title-copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="recruitment-hero-actions">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
      {highlights.length ? (
        <div className="recruitment-highlight-row">
          {highlights.map((item) => (
            <div key={item.label} className="recruitment-highlight-pill">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
}
