import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationHistoryTimeline({ events = [] }) {
  const { copy, getActionLabel, getOrgLabel } = useVacationLocale();

  return (
    <section className="suite-card">
      <h2>{copy.requestHistoryTitle}</h2>
      <div className="suite-list">
        {events.map((event) => (
          <article className="suite-list-item" key={event.id}>
            <span>{event.occurredAt}</span>
            <strong>{getOrgLabel(event.actor)}</strong>
            <p className="suite-muted">{getActionLabel(event.action)} | {event.employeeName || ""} | {event.note || copy.noComment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
