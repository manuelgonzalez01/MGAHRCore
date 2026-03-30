import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationBalanceMovementTimeline({ movements = [] }) {
  const { copy, getMovementTypeLabel } = useVacationLocale();

  return (
    <section className="suite-card">
      <h2>{copy.movementTitle}</h2>
      <div className="suite-list">
        {movements.map((movement) => (
          <article className="suite-list-item" key={movement.id}>
            <span>{getMovementTypeLabel(movement.type)}</span>
            <strong>{movement.label}</strong>
            <p className="suite-muted">{movement.effectiveDate} | {copy.impact} {movement.impactDays} | {copy.balance} {movement.balanceAfter}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
