export default function DevelopmentPlanProgress({ progress, label, caption }) {
  return (
    <div className="development-progress">
      <strong>{caption ? `${caption}: ${progress}%` : `${progress}%`}</strong>
      <div className="development-progress__track">
        <div className="development-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="development-muted">{label}</p>
    </div>
  );
}
