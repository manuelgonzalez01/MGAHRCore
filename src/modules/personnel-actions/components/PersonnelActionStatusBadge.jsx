export default function PersonnelActionStatusBadge({ status, label }) {
  return <span className={`personnel-badge status-${status}`}>{label || status}</span>;
}
