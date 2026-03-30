export default function RecruitmentSectionCard({
  title,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <section className={`recruitment-panel recruitment-section-card ${className}`.trim()}>
      <div className="recruitment-panel-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="recruitment-section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
