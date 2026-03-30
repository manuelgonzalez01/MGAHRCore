import ReportStatusBadge from "./ReportStatusBadge";

export default function LegalRiskPanel({ records = [] }) {
  return (
    <div className="reports-list">
      {records.map((item) => (
        <article key={item.id}>
          <strong>{item.employeeName || item.requester}</strong>
          <p className="reports-muted">{item.name || item.type} | {item.category || item.module}</p>
          <div className="reports-badge-row">
            <ReportStatusBadge status={item.status} />
          </div>
        </article>
      ))}
    </div>
  );
}
