import DevelopmentPlanProgress from "./DevelopmentPlanProgress";
import PlanStatusBadge from "./PlanStatusBadge";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentPlanCard({ plan }) {
  const { t } = useDevelopmentLocale();

  return (
    <article className="development-card">
      <div className="development-card__head">
        <div>
          <h3>{plan.employeeName}</h3>
          <p className="development-muted">{plan.positionName} | {plan.owner}</p>
        </div>
        <PlanStatusBadge status={plan.workflowStatus || plan.status} />
      </div>
      <DevelopmentPlanProgress progress={plan.progress} label={plan.nextMilestone} caption={t("Avance del plan", "Plan progress")} />
      <div className="development-list">
        {plan.objectives.map((objective) => (
          <article key={`${plan.id}-${objective.title}`}>
            <strong>{objective.title}</strong>
            <p className="development-muted">{objective.owner} | {objective.progress}% | {objective.status} | {objective.targetDate || "-"}</p>
          </article>
        ))}
      </div>
    </article>
  );
}
