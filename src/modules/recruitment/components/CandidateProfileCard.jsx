function Badge({ children, value }) {
  return <span className={`recruitment-badge status-${value}`}>{children}</span>;
}

export default function CandidateProfileCard({ candidate, copy }) {
  return (
    <article className="recruitment-candidate-card">
      <div className="recruitment-candidate-card-header">
        <div>
          <h3>{candidate.name}</h3>
          <p className="recruitment-item-subtitle">{candidate.position}</p>
        </div>
        <Badge value={candidate.stage}>{copy.labels.stage[candidate.stage]}</Badge>
      </div>

      <p>{candidate.summary}</p>

      <div className="recruitment-candidate-grid">
        <div className="recruitment-candidate-metric">
          <span>{copy.candidateCard.score}</span>
          <strong>{candidate.score}/100</strong>
        </div>
        <div className="recruitment-candidate-metric">
          <span>{copy.candidateCard.experience}</span>
          <strong>{candidate.experience}</strong>
        </div>
        <div className="recruitment-candidate-metric">
          <span>{copy.candidateCard.source}</span>
          <strong>{candidate.source}</strong>
        </div>
        <div className="recruitment-candidate-metric">
          <span>{copy.candidateCard.availability}</span>
          <strong>{candidate.availability}</strong>
        </div>
      </div>

      <button type="button" className="recruitment-inline-button">
        {copy.buttons.openProfile}
      </button>
    </article>
  );
}
