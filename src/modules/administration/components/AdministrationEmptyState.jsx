export default function AdministrationEmptyState({ title, description, action }) {
  return (
    <div className="administration-empty">
      <h3>{title}</h3>
      <p className="administration-muted">{description}</p>
      {action}
    </div>
  );
}
