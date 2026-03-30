import { Link } from "react-router-dom";

export default function SelfServiceQuickActions({ items = [], t }) {
  return (
    <section className="suite-card">
      <div className="suite-head">
        <div>
          <h2>{t("Accesos rapidos", "Quick actions")}</h2>
          <p className="suite-muted">{t("Atajos operativos para solicitudes del colaborador.", "Operational shortcuts for employee requests.")}</p>
        </div>
      </div>
      <div className="self-service-quick-actions">
        {items.map((item) => (
          <Link key={item.key} to={item.path} className="self-service-quick-action">
            <strong>{item.label}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
