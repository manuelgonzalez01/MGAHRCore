import VacationStatusBadge from "./VacationStatusBadge";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationApprovalQueue({ requests = [], onApprove, onReturn, onReject }) {
  const { copy } = useVacationLocale();

  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{copy.request}</th>
            <th>{copy.currentApprover}</th>
            <th>{copy.risk}</th>
            <th>{copy.status}</th>
            <th>{copy.actions}</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <strong>{request.employeeName}</strong>
                <p className="suite-muted">{request.startDate} - {request.endDate}</p>
              </td>
              <td>{request.currentApprover}</td>
              <td>{request.exceptions?.length || 0} {copy.conflicts}</td>
              <td><VacationStatusBadge status={request.status} /></td>
              <td>
                <div className="suite-inline-actions">
                  <button className="suite-button-secondary" onClick={() => onApprove(request.id)} type="button">{copy.approve}</button>
                  <button className="suite-button-secondary" onClick={() => onReturn(request.id)} type="button">{copy.return}</button>
                  <button className="suite-button-secondary" onClick={() => onReject(request.id)} type="button">{copy.reject}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
