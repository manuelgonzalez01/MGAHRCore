import VacationStatusBadge from "./VacationStatusBadge";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationRequestDetailsCard({ request }) {
  const { copy, getModeLabel, getSeverityLabel, getOrgLabel } = useVacationLocale();
  if (!request) {
    return null;
  }

  return (
    <section className="suite-card">
      <div className="suite-card-head">
        <div>
          <h2>{request.employeeName}</h2>
          <p className="suite-muted">{request.id} | {request.department} | {request.startDate} - {request.endDate}</p>
        </div>
        <VacationStatusBadge status={request.status} />
      </div>
      <div className="suite-mini-grid">
        <div className="suite-domain">
          <span>{copy.policy}</span>
          <strong>{request.policyName}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.mode}</span>
          <strong>{getModeLabel(request.requestMode)}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.currentApprover}</span>
          <strong>{getOrgLabel(request.currentApprover)}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.balanceImpact}</span>
          <strong>{request.balanceImpactDays} {copy.days}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.requestedBy}</span>
          <strong>{request.requestedBy}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.accumulation}</span>
          <strong>{request.accumulatedPeriods} {copy.periods}</strong>
        </div>
        <div className="suite-domain">
          <span>{copy.parentRequest}</span>
          <strong>{request.parentRequestId || copy.notAvailable}</strong>
        </div>
      </div>
      <p className="suite-muted">{request.note || copy.noAdditionalNotes}</p>
      {request.exceptions?.length ? (
        <div className="suite-list">
          {request.exceptions.map((item) => (
            <article className="suite-list-item" key={item.code}>
              <span>{getSeverityLabel(item.severity)}</span>
              <strong>{item.title}</strong>
              <p className="suite-muted">{item.detail}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
