import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationImpactPreview({ preview }) {
  const { copy, getSeverityLabel } = useVacationLocale();
  if (!preview) {
    return (
      <section className="suite-card">
        <h2>{copy.impactTitle}</h2>
        <p className="suite-muted">{copy.impactHelper}</p>
      </section>
    );
  }

  return (
    <section className="suite-card">
      <h2>{copy.impactTitle}</h2>
      <div className="suite-mini-grid">
        <div className="suite-domain">
          <span>{copy.resultingBalance}</span>
          <strong>{preview.resultingBalance}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.impactedMembers}</span>
          <strong>{preview.teamImpact.overlappingTeamMembers}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.estimatedCoverage}</span>
          <strong>{Math.round((preview.teamImpact.coverageRatio || 0) * 100)}%</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.risk}</span>
          <strong>{getSeverityLabel(preview.teamImpact.riskLevel)}</strong>
        </div>
      </div>
      <div className="suite-list">
        {(preview.conflicts || []).map((conflict) => (
          <article className="suite-list-item" key={conflict.code}>
            <span>{getSeverityLabel(conflict.severity)}</span>
            <strong>{conflict.title}</strong>
            <p className="suite-muted">{conflict.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
