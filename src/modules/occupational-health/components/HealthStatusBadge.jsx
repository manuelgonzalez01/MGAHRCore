export default function HealthStatusBadge({ status }) {
  return <span className={`health-badge health-status-${status}`}>{status}</span>;
}
