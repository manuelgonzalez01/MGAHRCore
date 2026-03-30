import { Link } from "react-router-dom";
import { getModuleConnections } from "./moduleConnections";
import "./moduleConnections.css";

export default function ModuleConnectionsPanel({ moduleKey, language = "es", className = "" }) {
  const content = getModuleConnections(moduleKey, language);

  return (
    <section className={`module-connections ${className}`.trim()}>
      <div className="module-connections__head">
        <div>
          <span className="module-connections__eyebrow">{content.title}</span>
          <p className="module-connections__description">{content.description}</p>
        </div>
      </div>

      <div className="module-connections__grid">
        {content.items.map((item) => (
          <Link key={`${moduleKey}-${item.to}`} to={item.to} className="module-connections__card">
            <span>{item.relation}</span>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
