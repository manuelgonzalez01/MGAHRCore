import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeTypeBadge from "./EmployeeTypeBadge";

export default function EmployeeSpotlightCard({
  eyebrow,
  title,
  description,
  meta = [],
  badges = [],
  actions = null,
  variant = "default",
}) {
  return (
    <article className={`employees-spotlight-card employees-spotlight-card--${variant}`}>
      <div className="employees-spotlight-head">
        <div>
          {eyebrow ? <span className="employees-spotlight-eyebrow">{eyebrow}</span> : null}
          <h3>{title}</h3>
          {description ? <p className="employees-muted">{description}</p> : null}
        </div>
        {actions}
      </div>

      {badges.length ? (
        <div className="employees-badge-row">
          {badges.map((badge) => {
            if (badge.kind === "status") {
              return <EmployeeStatusBadge key={`${badge.kind}-${badge.value}`} status={badge.value} />;
            }

            if (badge.kind === "type") {
              return <EmployeeTypeBadge key={`${badge.kind}-${badge.value}`} type={badge.value} />;
            }

            return (
              <span key={`${badge.kind}-${badge.label}-${badge.value}`} className={`employees-badge ${badge.tone || "neutral"}`}>
                {badge.label ? `${badge.label}: ${badge.value}` : badge.value}
              </span>
            );
          })}
        </div>
      ) : null}

      {meta.length ? (
        <div className="employees-spotlight-grid">
          {meta.map((item) => (
            <div key={`${item.label}-${item.value}`} className="employees-spotlight-metric">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.helper ? <p className="employees-muted">{item.helper}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
