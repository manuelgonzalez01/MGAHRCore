export default function EmployeeEmptyState({ title, description }) {
  return (
    <div className="employees-empty">
      <h3>{title}</h3>
      <p className="employees-muted">{description}</p>
    </div>
  );
}
