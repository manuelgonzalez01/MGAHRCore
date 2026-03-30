export const PERSONNEL_ACTION_TYPES = [
  "promotion",
  "transfer",
  "salary_change",
  "supervisor_change",
  "department_change",
  "location_change",
  "position_change",
  "suspension",
  "termination",
  "reinstatement",
  "regularization",
];

export const PERSONNEL_ACTION_TYPE_LABELS = {
  promotion: { es: "Promocion", en: "Promotion" },
  transfer: { es: "Traslado", en: "Transfer" },
  salary_change: { es: "Cambio salarial", en: "Salary change" },
  supervisor_change: { es: "Cambio de supervisor", en: "Supervisor change" },
  department_change: { es: "Cambio de departamento", en: "Department change" },
  location_change: { es: "Cambio de localizacion", en: "Location change" },
  position_change: { es: "Cambio de posicion", en: "Position change" },
  suspension: { es: "Suspension", en: "Suspension" },
  termination: { es: "Desvinculacion", en: "Termination" },
  reinstatement: { es: "Reincorporacion", en: "Reinstatement" },
  regularization: { es: "Regularizacion", en: "Regularization" },
};

export const PERSONNEL_STATUS_LABELS = {
  draft: { es: "Borrador", en: "Draft" },
  submitted: { es: "Enviado", en: "Submitted" },
  pending_manager_review: { es: "Revision manager", en: "Manager review" },
  pending_hr_review: { es: "Revision HR", en: "HR review" },
  pending_final_approval: { es: "Aprobacion final", en: "Final approval" },
  approved: { es: "Aprobado", en: "Approved" },
  rejected: { es: "Rechazado", en: "Rejected" },
  returned_for_changes: { es: "Devuelto con cambios", en: "Returned for changes" },
  effective: { es: "Efectivo", en: "Effective" },
  cancelled: { es: "Cancelado", en: "Cancelled" },
};

export const PERSONNEL_WORKFLOW_ACTIONS = {
  draft: ["submit", "cancel"],
  submitted: ["start_manager_review", "return", "reject", "cancel"],
  pending_manager_review: ["approve_manager", "return", "reject"],
  pending_hr_review: ["approve_hr", "return", "reject"],
  pending_final_approval: ["approve_final", "return", "reject"],
  approved: ["mark_effective", "cancel"],
  returned_for_changes: ["resubmit", "cancel"],
  rejected: [],
  effective: [],
  cancelled: [],
};

export const PERSONNEL_TRANSITIONS = {
  submit: "submitted",
  start_manager_review: "pending_manager_review",
  approve_manager: "pending_hr_review",
  approve_hr: "pending_final_approval",
  approve_final: "approved",
  mark_effective: "effective",
  return: "returned_for_changes",
  reject: "rejected",
  cancel: "cancelled",
  resubmit: "submitted",
};

export function getPersonnelLabel(map, key, language = "es") {
  return map[key]?.[language] || map[key]?.es || key;
}

export function getActionTypeLabel(key, language = "es") {
  return getPersonnelLabel(PERSONNEL_ACTION_TYPE_LABELS, key, language);
}

export function getActionStatusLabel(key, language = "es") {
  return getPersonnelLabel(PERSONNEL_STATUS_LABELS, key, language);
}
