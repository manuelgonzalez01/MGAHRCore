export default function StageBadge({ label, value }) {
  return <span className={`recruitment-badge status-${value}`}>{label}</span>;
}
