export default function ReportStatusBadge({ status = "neutral", label }) {
  return <span className={`reports-status ${status}`}>{label || status}</span>;
}
