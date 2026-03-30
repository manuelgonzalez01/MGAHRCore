import { Link } from "react-router-dom";
import VacationStatusBadge from "./VacationStatusBadge";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationRequestsTable({ requests = [] }) {
  const { copy } = useVacationLocale();

  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{copy.request}</th>
            <th>{copy.dates}</th>
            <th>{copy.days}</th>
            <th>{copy.approver}</th>
            <th>{copy.status}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <strong>{request.employeeName}</strong>
                <p className="suite-muted">{request.department}</p>
              </td>
              <td>{request.startDate} - {request.endDate}</td>
              <td>{request.balanceImpactDays}</td>
              <td>{request.currentApprover}</td>
              <td><VacationStatusBadge status={request.status} /></td>
              <td><Link to={`/vacations/requests/${request.id}`}>{copy.viewDetails}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
