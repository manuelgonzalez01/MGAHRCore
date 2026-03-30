import { getTrainingStatusTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function TrainingCompliancePanel({ items = [] }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-list">
      {items.map((item) => (
        <article key={item.id}>
          <div className="development-card__head">
            <strong>{item.title}</strong>
            <span className={`development-badge ${getTrainingStatusTone(item.status)}`}>{item.status}</span>
          </div>
          <p className="development-muted">{item.audience} | {item.completionRate}% | {item.owner}</p>
          <p className="development-muted">{t("Planes vinculados", "Linked plans")}: {item.linkedPlans}</p>
        </article>
      ))}
    </div>
  );
}
