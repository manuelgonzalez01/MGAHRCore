import EmployeeStatusBadge from "./EmployeeStatusBadge";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeAuthorizationQueue({ requests = [], onApprove }) {
  const copy = useEmployeesCopy();
  return (
    <div className="employees-list">
      {requests.map((request) => (
        <article key={request.id} className="employees-list-item">
          <span>{copy.status.pending}</span>
          <strong>{request.name || copy.common.pending}</strong>
          <p className="employees-muted">
            {request.position} | {request.department} | {request.location}
          </p>
          <p className="employees-muted">
            {request.recruitmentSource?.origin || copy.common.manual} | {request.requestedBy}
          </p>
          <div className="employees-inline-actions">
            <EmployeeStatusBadge status={request.approvalStatus} />
            {request.approvalStatus === "pending" ? (
              <button type="button" className="employees-button" onClick={() => onApprove(request.id)}>
                {copy.actions.approveHire}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
