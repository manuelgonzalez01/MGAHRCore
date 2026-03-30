import StageBadge from "./StageBadge";
import StatusBadge from "./StatusBadge";

function getReadiness(score, isSpanish) {
  if (score >= 90) {
    return isSpanish ? "Listo para decision" : "Decision ready";
  }

  if (score >= 75) {
    return isSpanish ? "Alta prioridad" : "High priority";
  }

  return isSpanish ? "Requiere seguimiento" : "Needs follow-up";
}

function getNextAction(stage, isSpanish) {
  const actions = {
    screening: isSpanish ? "Validar fit cultural y referencias iniciales." : "Validate culture fit and early references.",
    interview: isSpanish ? "Coordinar panel final con negocio." : "Coordinate final panel with business owners.",
    evaluation: isSpanish ? "Cerrar scorecard y recomendacion del hiring team." : "Close the scorecard and hiring team recommendation.",
    offer: isSpanish ? "Alinear propuesta y fecha de incorporacion." : "Align offer package and start date.",
  };

  return actions[stage] || actions.screening;
}

export default function CandidateProfilePreview({ candidate, copy, language = "es" }) {
  if (!candidate) {
    return null;
  }

  const isSpanish = language === "es";
  const readiness = getReadiness(Number(candidate.score) || 0, isSpanish);
  const nextAction = getNextAction(candidate.stage, isSpanish);
  const summaryItems = [
    { label: copy.table.location, value: candidate.location || "-" },
    { label: copy.table.contact, value: candidate.contact || "-" },
    { label: copy.table.source, value: candidate.source || "-" },
    { label: copy.candidateCard.availability, value: candidate.availability || "-" },
  ];

  return (
    <aside className="recruitment-profile-preview">
      <div className="recruitment-profile-top">
        <div>
          <span className="recruitment-eyebrow">{copy.pages.candidatesTitle}</span>
          <h3>{candidate.name}</h3>
          <p>{candidate.position}</p>
        </div>
        <StageBadge label={copy.labels.stage[candidate.stage]} value={candidate.stage} />
      </div>

      <div className="recruitment-profile-hero" style={{ "--score": candidate.score }}>
        <div className="recruitment-profile-score">
          <div>
            <span>{copy.candidateCard.score}</span>
            <strong>{candidate.score}</strong>
          </div>
        </div>

        <div className="recruitment-profile-summary">
          <StatusBadge label={copy.labels.status[candidate.status]} value={candidate.status} />
          <div className="recruitment-profile-tagline">
            <span>{isSpanish ? "Readiness" : "Readiness"}</span>
            <strong>{readiness}</strong>
          </div>
          <p>{candidate.summary}</p>
        </div>
      </div>

      <div className="recruitment-profile-metrics">
        <div className="recruitment-candidate-metric recruitment-candidate-metric--accent">
          <span>{copy.candidateCard.experience}</span>
          <strong>{candidate.experience}</strong>
        </div>
        {summaryItems.map((item) => (
          <div key={item.label} className="recruitment-candidate-metric">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="recruitment-detail-strip">
        <div className="recruitment-candidate-metric">
          <span>{isSpanish ? "Siguiente accion" : "Next action"}</span>
          <strong>{nextAction}</strong>
        </div>
        <div className="recruitment-candidate-metric">
          <span>{isSpanish ? "Prioridad" : "Priority"}</span>
          <strong>{readiness}</strong>
        </div>
      </div>

      <div className="recruitment-checklist">
        <div className="recruitment-checklist-item">
          <span />
          <div>
            <strong>{isSpanish ? "Stage ownership" : "Stage ownership"}</strong>
            <p>{copy.labels.stage[candidate.stage]}</p>
          </div>
        </div>
        <div className="recruitment-checklist-item">
          <span />
          <div>
            <strong>{isSpanish ? "Contacto listo" : "Contact readiness"}</strong>
            <p>{candidate.contact || (isSpanish ? "Sin dato cargado" : "No contact added")}</p>
          </div>
        </div>
        <div className="recruitment-checklist-item">
          <span />
          <div>
            <strong>{isSpanish ? "Proximo movimiento" : "Recommended move"}</strong>
            <p>{nextAction}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
