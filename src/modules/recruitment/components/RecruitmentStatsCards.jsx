export default function RecruitmentStatsCards({ items, copy }) {
  return (
    <div className="recruitment-stats-grid">
      {items.map((item) => (
        <article key={item.key} className={`recruitment-stat-card recruitment-stat-card--${item.key}`}>
          <div className="recruitment-stat-head">
            <h3>{copy.stats[item.key]}</h3>
            <span className="recruitment-stat-dot" />
          </div>
          <div className="recruitment-stat-value">{item.value}</div>
          <div className="recruitment-stat-footer">
            <span className="recruitment-stat-trend">{item.trend}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
