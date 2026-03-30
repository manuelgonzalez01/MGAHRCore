import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeesHeader({ eyebrow, title, description, actions, highlights = [] }) {
  const copy = useEmployeesCopy();
  return (
    <section className="employees-hero employees-hero--workspace">
      <span className="employees-eyebrow">{eyebrow || copy.header.eyebrow}</span>
      <div className="employees-title-row">
        <div>
          <h1>{title || copy.header.title}</h1>
          <p className="employees-muted">{description || copy.header.description}</p>
        </div>
        <div className="employees-inline-actions">{actions}</div>
      </div>
      <div className="employees-highlight-grid">
        {highlights.map((item) => (
          <article key={item.label} className="employees-highlight-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p className="employees-muted">{item.trend}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
