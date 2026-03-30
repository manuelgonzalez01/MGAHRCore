import SelfServiceStatusBadge from "./SelfServiceStatusBadge";

export default function SelfServiceApprovalTimeline({ request, language = "es", t }) {
  if (!request) return null;

  const getActionLabel = (action) => {
    const labels = {
      permission_requested: language === "en" ? "Permission requested" : "Permiso solicitado",
      profile_change_created: language === "en" ? "Profile change requested" : "Cambio de perfil solicitado",
      request_created: language === "en" ? "Request created" : "Solicitud creada",
      queue_manager: language === "en" ? "Sent to manager review" : "Enviado a revision manager",
      approve_manager: language === "en" ? "Manager approval" : "Aprobacion manager",
      approve_hr: language === "en" ? "HR approval" : "Aprobacion HR",
      return: language === "en" ? "Returned for changes" : "Devuelto con cambios",
      reject: language === "en" ? "Rejected" : "Rechazado",
      cancel: language === "en" ? "Cancelled" : "Cancelado",
      resubmit: language === "en" ? "Resubmitted" : "Reenviado",
    };

    return labels[action] || action;
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: language === "en" ? "Submitted" : "Enviado",
      pending_manager_review: language === "en" ? "Manager review" : "Revision manager",
      pending_hr_review: language === "en" ? "HR review" : "Revision HR",
      approved: language === "en" ? "Approved" : "Aprobado",
      rejected: language === "en" ? "Rejected" : "Rechazado",
      returned_for_changes: language === "en" ? "Returned" : "Devuelto",
      cancelled: language === "en" ? "Cancelled" : "Cancelado",
      draft: language === "en" ? "Draft" : "Borrador",
      scheduled: language === "en" ? "Scheduled" : "Programado",
      consumed: language === "en" ? "Consumed" : "Consumido",
    };

    return labels[status] || status;
  };

  return (
    <section className="suite-card">
      <div className="suite-head">
        <div>
          <h2>{t("Trazabilidad", "Workflow trail")}</h2>
          <p className="suite-muted">{request.title}</p>
        </div>
        <SelfServiceStatusBadge status={request.status} language={language} />
      </div>
      <div className="self-service-timeline">
        {(request.auditTrail || []).map((item) => (
          <article key={item.id} className="self-service-timeline-item">
            <strong>{item.actor}</strong>
            <p>{getActionLabel(item.action)}</p>
            <p className="suite-muted">{getStatusLabel(item.fromStatus)} {" -> "} {getStatusLabel(item.toStatus)}</p>
            <small>{item.occurredAt}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
