const STATUS_LABELS = {
  submitted: "Enviado",
  pending_manager_review: "Revision manager",
  pending_hr_review: "Revision HR",
  approved: "Aprobado",
  rejected: "Rechazado",
  returned_for_changes: "Devuelto",
  cancelled: "Cancelado",
  scheduled: "Programado",
  consumed: "Consumido",
};

const EN_LABELS = {
  submitted: "Submitted",
  pending_manager_review: "Manager review",
  pending_hr_review: "HR review",
  approved: "Approved",
  rejected: "Rejected",
  returned_for_changes: "Returned",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
  consumed: "Consumed",
};

export default function SelfServiceStatusBadge({ status = "", language = "es" }) {
  const label = language === "en" ? (EN_LABELS[status] || status) : (STATUS_LABELS[status] || status);
  return <span className={`self-service-badge self-service-badge--${status}`}>{label}</span>;
}
