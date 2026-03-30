import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationCalendarBoard({ events = [] }) {
  const { copy, getEventTypeLabel, getOrgLabel, getStatusValueLabel } = useVacationLocale();

  return (
    <section className="suite-card">
      <h2>{copy.operationalCalendar}</h2>
      <div className="suite-list">
        {events.slice(0, 32).map((event) => (
          <article className="suite-list-item" key={event.id}>
            <span>{event.date}</span>
            <strong>{event.label}</strong>
            <p className="suite-muted">{getEventTypeLabel(event.type)} | {getOrgLabel(event.location || event.department || copy.global)} | {getStatusValueLabel(event.status)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
