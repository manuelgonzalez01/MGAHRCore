import { getPlanStatusTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import { getWorkflowStatusLabel } from "../utils/developmentWorkflow.labels";

export default function PlanStatusBadge({ status }) {
  const { t } = useDevelopmentLocale();

  return <span className={`development-badge ${getPlanStatusTone(status)}`}>{getWorkflowStatusLabel(status, t)}</span>;
}
