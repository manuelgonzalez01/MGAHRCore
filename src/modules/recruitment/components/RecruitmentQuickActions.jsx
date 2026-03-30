export default function RecruitmentQuickActions({ copy, items = [] }) {
  const actions = items.length ? items : copy.quickActions;

  return (
    <section className="recruitment-panel recruitment-section-card">
      <div className="recruitment-panel-header">
        <div>
          <h2>{copy.quickActionsTitle}</h2>
          <p>{copy.quickActionsDescription}</p>
        </div>
      </div>

      <div className="recruitment-quick-actions">
        {actions.map((item) => (
          <article key={item.title} className="recruitment-quick-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.action ? (
              <button type="button" className="recruitment-inline-button" onClick={item.action}>
                {item.actionLabel || item.title}
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
