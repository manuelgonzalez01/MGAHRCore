import { getReadinessTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function TalentReadinessCard({ item }) {
  const { t } = useDevelopmentLocale();

  return (
    <article className="development-card">
      <div className="development-card__head">
        <div>
          <h3>{item.employeeName}</h3>
          <p className="development-muted">{item.role} | {item.levelName}</p>
        </div>
        <span className={`development-badge ${getReadinessTone(item.promotionReadiness)}`}>{item.promotionReadiness}</span>
      </div>
      <p className="development-muted">{t("Readiness", "Readiness")} {item.readiness}% | {t("Potencial", "Potential")} {item.potential} | {t("Movilidad", "Mobility")} {item.mobilityOptions}</p>
      <p className="development-muted">{t("Prioridad", "Priority")}: {item.developmentPriority}</p>
      <p className="development-muted">{t("Sucesor para", "Successor for")}: {item.successorFor || t("Sin posicion objetivo", "No target role yet")}</p>
      <p className="development-muted">{t("Riesgo de retencion", "Retention risk")}: {item.retentionRisk} | {t("Mesa", "Review board")}: {item.reviewBoard}</p>
    </article>
  );
}
