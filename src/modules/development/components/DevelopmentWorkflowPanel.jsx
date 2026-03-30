import PlanStatusBadge from "./PlanStatusBadge";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import { getWorkflowActionLabel, getWorkflowRoleLabel } from "../utils/developmentWorkflow.labels";

export default function DevelopmentWorkflowPanel({ plan, workflow = {}, onTransition, comment, setComment }) {
  const { t } = useDevelopmentLocale();

  if (!plan) {
    return <p className="development-muted">{t("Selecciona un plan para ver el workflow.", "Select a plan to view the workflow.")}</p>;
  }

  const currentDefinition = workflow[plan.workflowStatus] || { actions: [], actors: [] };

  return (
    <div className="development-workflow">
      <div className="development-workflow__summary">
        <div>
          <span className="development-muted">{t("Estado actual", "Current status")}</span>
          <strong>{plan.employeeName}</strong>
        </div>
        <PlanStatusBadge status={plan.workflowStatus} />
      </div>
      <div className="development-workflow__meta">
        <span>{t("Responsable de etapa", "Stage owner")}: {plan.currentStageOwner || plan.owner}</span>
        <span>{t("Rol habilitado", "Enabled role")}: {(currentDefinition.actors || []).map((role) => getWorkflowRoleLabel(role, t)).join(", ") || "-"}</span>
      </div>
      <label className="development-filter">
        <span>{t("Comentario del flujo", "Workflow comment")}</span>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} />
      </label>
      <div className="development-row-actions">
        {(currentDefinition.actions || []).map((action) => (
          <button
            key={action.key}
            type="button"
            className="suite-button-secondary"
            onClick={() => onTransition(action)}
          >
            {getWorkflowActionLabel(action.key, t)}
          </button>
        ))}
      </div>
      <div className="development-list">
        {(plan.workflowTrail || []).slice(0, 6).map((entry) => (
          <article key={entry.id} className="development-list-item">
            <span>{entry.actorName}</span>
            <strong>{entry.summary || entry.action}</strong>
            <p className="development-muted">{entry.createdAt?.slice(0, 10)} | {entry.comment || t("Sin comentario", "No comment")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
