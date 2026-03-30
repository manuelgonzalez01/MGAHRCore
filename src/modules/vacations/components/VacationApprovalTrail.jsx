import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationApprovalTrail({ steps = [] }) {
  const { copy, getRoleLabel, getStepStateLabel, getOrgLabel } = useVacationLocale();

  return (
    <section className="suite-card">
      <h2>{copy.currentStateTitle}</h2>
      <div className="suite-list">
        {steps.map((step) => (
          <article className="suite-list-item" key={step.id}>
            <span>{getRoleLabel(step.role)}</span>
            <strong>{getOrgLabel(step.delegatedTo || step.actor)}</strong>
            <p className="suite-muted">{copy.level} {step.sequence} | {copy.state} {getStepStateLabel(step.status)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
