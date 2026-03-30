import { Link } from "react-router-dom";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentQuickActions({ actions = [] }) {
  const { t } = useDevelopmentLocale();

  return (
    <section className="development-card">
      <div className="development-card__head">
        <div>
          <h2>{t("Accesos rapidos", "Quick actions")}</h2>
          <p className="development-muted">
            {t("Cambia de dominio sin perder el contexto de talento.", "Move across domains without losing talent context.")}
          </p>
        </div>
      </div>
      <div className="development-actions">
      {actions.map((action) => (
        <Link key={action.path} to={action.path} className="development-action">
          <strong>{action.label}</strong>
          <span>{t("Abrir vista", "Open view")}</span>
        </Link>
      ))}
      </div>
    </section>
  );
}
