export default function StatusBadge({ label, value, category = "status" }) {
  return <span className={`recruitment-badge ${category}-${value}`}>{label}</span>;
}
