import { getStatusLabel } from "../utils/vacation.helpers";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationAuditLogPanel({ events = [] }) {
  const { copy, isSpanish, getActionLabel, getOrgLabel } = useVacationLocale();

  return (
    <section className="suite-card">
      <h2>{copy.auditTitle}</h2>
      <div className="suite-list">
        {events.slice(0, 8).map((event) => (
          <article className="suite-list-item" key={event.id}>
            <span>{getStatusLabel(event.fromStatus, isSpanish)} {"->"} {getStatusLabel(event.toStatus, isSpanish)}</span>
            <strong>{getOrgLabel(event.actor)}</strong>
            <p className="suite-muted">{getActionLabel(event.action)} | {event.note || copy.noComment} | {event.occurredAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
