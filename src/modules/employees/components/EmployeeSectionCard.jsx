export default function EmployeeSectionCard({ title, description, actions, children, variant = "default", className = "", eyebrow }) {
  return (
    <section className={`employees-panel employees-panel--${variant}${className ? ` ${className}` : ""}`}>
      <header className="employees-panel-head">
        <div>
          {eyebrow ? <span className="employees-eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p className="employees-muted">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
