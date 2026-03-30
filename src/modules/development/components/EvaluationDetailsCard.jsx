import { getEvaluationStatusTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function EvaluationDetailsCard({ evaluation, onEdit, onDelete }) {
  const { t } = useDevelopmentLocale();

  return (
    <article className="development-card">
      <div className="development-card__head">
        <div>
          <h3>{evaluation.employeeName}</h3>
          <p className="development-muted">{evaluation.positionName} | {evaluation.departmentName}</p>
        </div>
        <div className="development-inline-actions">
          <span className={`development-badge ${getEvaluationStatusTone(evaluation.status)}`}>{evaluation.status}</span>
          {onEdit ? <button type="button" className="suite-button-secondary" onClick={() => onEdit(evaluation)}>{t("Editar", "Edit")}</button> : null}
          {onDelete ? <button type="button" className="suite-button-secondary" onClick={() => onDelete(evaluation)}>{t("Eliminar", "Delete")}</button> : null}
        </div>
      </div>
      <p className="development-muted">{t("Score", "Score")} {evaluation.score} | {evaluation.cycleName}</p>
      <div className="development-list">
        {evaluation.competencies.map((item) => (
          <article key={`${evaluation.id}-${item.skillName}`}>
            <strong>{item.skillName}</strong>
            <p className="development-muted">{t("Esperado", "Expected")} {item.expectedLevel} | {t("Actual", "Current")} {item.currentScore} | {t("Brecha", "Gap")} {item.gap}</p>
          </article>
        ))}
      </div>
    </article>
  );
}
