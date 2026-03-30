import useVacationLocale from "../hooks/useVacationLocale";

export default function TeamCoveragePanel({ conflicts = [] }) {
  const { copy } = useVacationLocale();
  const typeLabels = {
    coverage: copy.coverage,
    balance: copy.balanceType,
    overlap: copy.overlap,
  };

  return (
    <section className="suite-card">
      <h2>{copy.coverageTitle}</h2>
      <div className="suite-list">
        {conflicts.length === 0 ? (
          <article className="suite-list-item">
            <strong>{copy.noCoverageAlerts}</strong>
            <p className="suite-muted">{copy.noCoverageHelper}</p>
          </article>
        ) : conflicts.slice(0, 6).map((conflict) => (
          <article className="suite-list-item" key={conflict.id}>
            <span>{typeLabels[conflict.type] || conflict.type}</span>
            <strong>{conflict.title}</strong>
            <p className="suite-muted">{conflict.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
