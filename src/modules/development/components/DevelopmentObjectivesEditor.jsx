import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import { emptyPlanAction, emptyPlanObjective } from "../utils/developmentPlan.factory";

export default function DevelopmentObjectivesEditor({ value = [], onChange }) {
  const { t } = useDevelopmentLocale();

  function updateObjective(index, patch) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function updateAction(objectiveIndex, actionIndex, patch) {
    onChange(value.map((item, itemIndex) => {
      if (itemIndex !== objectiveIndex) {
        return item;
      }

      return {
        ...item,
        actions: (item.actions || []).map((action, index) => (index === actionIndex ? { ...action, ...patch } : action)),
      };
    }));
  }

  return (
    <div className="development-objectives-editor">
      {value.map((objective, objectiveIndex) => (
        <article key={objective.id || `${objective.title}-${objectiveIndex}`} className="development-objective-card">
          <div className="development-form-grid">
            <label className="development-filter">
              <span>{t("Objetivo", "Objective")}</span>
              <input value={objective.title} onChange={(event) => updateObjective(objectiveIndex, { title: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Responsable", "Owner")}</span>
              <input value={objective.owner} onChange={(event) => updateObjective(objectiveIndex, { owner: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Fecha objetivo", "Target date")}</span>
              <input type="date" value={objective.targetDate} onChange={(event) => updateObjective(objectiveIndex, { targetDate: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Prioridad", "Priority")}</span>
              <select value={objective.priority} onChange={(event) => updateObjective(objectiveIndex, { priority: event.target.value })}>
                <option value="high">{t("Alta", "High")}</option>
                <option value="medium">{t("Media", "Medium")}</option>
                <option value="low">{t("Baja", "Low")}</option>
              </select>
            </label>
            <label className="development-filter">
              <span>{t("Avance", "Progress")}</span>
              <input type="number" min="0" max="100" value={objective.progress} onChange={(event) => updateObjective(objectiveIndex, { progress: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Estado", "Status")}</span>
              <select value={objective.status} onChange={(event) => updateObjective(objectiveIndex, { status: event.target.value })}>
                <option value="not_started">{t("No iniciado", "Not started")}</option>
                <option value="in_progress">{t("En progreso", "In progress")}</option>
                <option value="on_track">{t("En linea", "On track")}</option>
                <option value="attention">{t("Atencion", "Attention")}</option>
                <option value="completed">{t("Completado", "Completed")}</option>
              </select>
            </label>
            <label className="development-filter">
              <span>{t("Evidencia", "Evidence")}</span>
              <textarea value={objective.evidence} onChange={(event) => updateObjective(objectiveIndex, { evidence: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Notas", "Notes")}</span>
              <textarea value={objective.notes} onChange={(event) => updateObjective(objectiveIndex, { notes: event.target.value })} />
            </label>
            <label className="development-filter">
              <span>{t("Bloqueadores o riesgos", "Blockers or risks")}</span>
              <textarea value={objective.blockers} onChange={(event) => updateObjective(objectiveIndex, { blockers: event.target.value })} />
            </label>
          </div>
          <div className="development-sublist">
            {(objective.actions || []).map((action, actionIndex) => (
              <div key={`${objectiveIndex}-${actionIndex}`} className="development-sublist__item">
                <input value={action.title} placeholder={t("Accion", "Action")} onChange={(event) => updateAction(objectiveIndex, actionIndex, { title: event.target.value })} />
                <input value={action.owner} placeholder={t("Responsable", "Owner")} onChange={(event) => updateAction(objectiveIndex, actionIndex, { owner: event.target.value })} />
                <input type="date" value={action.targetDate} onChange={(event) => updateAction(objectiveIndex, actionIndex, { targetDate: event.target.value })} />
                <input type="number" min="0" max="100" value={action.progress} onChange={(event) => updateAction(objectiveIndex, actionIndex, { progress: event.target.value })} />
              </div>
            ))}
          </div>
          <div className="development-row-actions">
            <button
              type="button"
              className="suite-button-secondary"
              onClick={() => updateObjective(objectiveIndex, { actions: [...(objective.actions || []), emptyPlanAction()] })}
            >
              {t("Agregar accion", "Add action")}
            </button>
            <button
              type="button"
              className="suite-button-secondary"
              onClick={() => onChange(value.filter((_, index) => index !== objectiveIndex))}
            >
              {t("Eliminar objetivo", "Remove objective")}
            </button>
          </div>
        </article>
      ))}
      <button type="button" className="suite-button-secondary" onClick={() => onChange([...(value || []), emptyPlanObjective()])}>
        {t("Agregar objetivo", "Add objective")}
      </button>
    </div>
  );
}
