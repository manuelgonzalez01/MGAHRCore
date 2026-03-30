export function getWorkflowStatusLabel(status, t) {
  const labels = {
    draft: t("Borrador", "Draft"),
    submitted: t("Enviado", "Submitted"),
    manager_review: t("Revision de manager", "Manager review"),
    talent_review: t("Revision de talento", "Talent review"),
    approved: t("Aprobado", "Approved"),
    rejected: t("Rechazado", "Rejected"),
    returned_for_changes: t("Devuelto con cambios", "Returned for changes"),
    completed: t("Completado", "Completed"),
    archived: t("Archivado", "Archived"),
    at_risk: t("En riesgo", "At risk"),
    in_progress: t("En progreso", "In progress"),
  };

  return labels[status] || status;
}

export function getWorkflowActionLabel(action, t) {
  const labels = {
    submit: t("Enviar a aprobacion", "Submit for approval"),
    archive: t("Archivar", "Archive"),
    start_manager_review: t("Iniciar revision manager", "Start manager review"),
    return_for_changes: t("Devolver con cambios", "Return for changes"),
    reject: t("Rechazar", "Reject"),
    escalate_to_talent: t("Escalar a talento", "Escalate to talent"),
    approve: t("Aprobar", "Approve"),
    complete: t("Marcar como completado", "Mark as completed"),
    resubmit: t("Reenviar", "Resubmit"),
    move_to_draft: t("Volver a borrador", "Move back to draft"),
  };

  return labels[action] || action;
}

export function getWorkflowRoleLabel(role, t) {
  const labels = {
    employee: t("Colaborador", "Employee"),
    owner: t("Responsable del plan", "Plan owner"),
    manager: t("Manager", "Manager"),
    talent: t("Talento / HR", "Talent / HR"),
    super_admin: t("Super Admin", "Super Admin"),
  };

  return labels[role] || role;
}
