import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { getInsuranceStatusLabel } from "../utils/insurance.helpers";

export default function InsuranceWorkflowPanel({ item, onTransition }) {
  const { language, t } = useInsuranceLocale();
  const owners = {
    draft: t("HR Operations", "HR Operations"),
    submitted: t("HR Operations", "HR Operations"),
    hr_review: t("HR Benefits Lead", "HR Benefits Lead"),
    provider_review: t("Proveedor / Broker", "Provider / Broker"),
    approved: t("HR Director", "HR Director"),
    scheduled: t("Benefits Administration", "Benefits Administration"),
    completed: t("Benefits Administration", "Benefits Administration"),
    returned: t("HR Operations", "HR Operations"),
    rejected: t("HR Director", "HR Director"),
  };

  if (!item) {
    return null;
  }

  const actions = {
    draft: ["submit"],
    submitted: ["start_review", "return", "reject"],
    hr_review: ["approve_hr", "return", "reject"],
    provider_review: ["approve_provider", "return", "reject"],
    approved: ["schedule"],
    scheduled: ["complete", "return"],
    returned: ["resubmit"],
  }[item.workflowStatus || "draft"] || [];

  const labels = {
    submit: t("Enviar", "Submit"),
    start_review: t("Iniciar revision", "Start review"),
    approve_hr: t("Aprobar RRHH", "Approve HR"),
    approve_provider: t("Aprobar proveedor", "Approve provider"),
    schedule: t("Programar", "Schedule"),
    complete: t("Completar", "Complete"),
    return: t("Devolver", "Return"),
    reject: t("Rechazar", "Reject"),
    resubmit: t("Reenviar", "Resubmit"),
  };

  return (
    <section className="suite-card">
      <h2>{t("Workflow operativo", "Operational workflow")}</h2>
      <p className="suite-muted">{t("Estado actual y transiciones permitidas.", "Current state and allowed transitions.")}</p>
      <div className="insurance-workflow-panel">
        <div className="suite-list-item">
          <span>{t("Estado actual", "Current state")}</span>
          <strong>{getInsuranceStatusLabel(item.workflowStatus, language)}</strong>
          <p className="suite-muted">{t("Tipo de solicitud", "Request type")}: {item.requestType || item.type}</p>
          <p className="suite-muted">{t("Responsable de etapa", "Stage owner")}: {owners[item.workflowStatus || "draft"]}</p>
        </div>
        <div className="insurance-table-actions">
          {actions.map((action) => (
            <button key={action} className="suite-button-secondary" type="button" onClick={() => onTransition(action)}>
              {labels[action]}
            </button>
          ))}
        </div>
      </div>
      <div className="insurance-timeline">
        {(item.workflowTrail || []).map((entry) => (
          <article key={entry.id} className="suite-list-item">
            <span>{entry.changedAt?.slice(0, 10)}</span>
            <strong>{getInsuranceStatusLabel(entry.toStatus, language)}</strong>
            <p className="suite-muted">{entry.actor} · {entry.comment || entry.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
