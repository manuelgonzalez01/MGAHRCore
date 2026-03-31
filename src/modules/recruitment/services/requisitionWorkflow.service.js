import {
  REQUISITION_CONTRACT_TYPE_OPTIONS,
  REQUISITION_MODALITY_OPTIONS,
  REQUISITION_PRIORITY_OPTIONS,
  REQUISITION_REQUEST_TYPE_OPTIONS,
  REQUISITION_STATUS_OPTIONS,
} from "../schemas/requisition.schema";

function getLabelMap(isSpanish) {
  return {
    requestType: {
      new_position: isSpanish ? "Nueva posicion" : "New position",
      replacement: isSpanish ? "Reemplazo" : "Replacement",
      expansion: isSpanish ? "Expansion" : "Expansion",
      backfill: isSpanish ? "Backfill" : "Backfill",
      temporary: isSpanish ? "Temporal" : "Temporary",
      critical: isSpanish ? "Critica" : "Critical",
    },
    priority: {
      medium: isSpanish ? "Media" : "Medium",
      high: isSpanish ? "Alta" : "High",
      critical: isSpanish ? "Critica" : "Critical",
    },
    modality: {
      remote: isSpanish ? "Remota" : "Remote",
      hybrid: isSpanish ? "Hibrida" : "Hybrid",
      onsite: isSpanish ? "Presencial" : "On site",
    },
    contractType: {
      indefinite: isSpanish ? "Indefinido" : "Indefinite",
      fixed_term: isSpanish ? "Plazo fijo" : "Fixed-term",
      temporary: isSpanish ? "Temporal" : "Temporary",
      internship: isSpanish ? "Pasantia" : "Internship",
      contractor: isSpanish ? "Contratista" : "Contractor",
    },
    status: {
      draft: isSpanish ? "Borrador" : "Draft",
      submitted: isSpanish ? "Enviada" : "Submitted",
      pending_review: isSpanish ? "Pendiente de revision" : "Pending review",
      approved: isSpanish ? "Aprobada" : "Approved",
      rejected: isSpanish ? "Rechazada" : "Rejected",
      closed: isSpanish ? "Cerrada" : "Closed",
    },
  };
}

export function createRequisitionLabels(isSpanish) {
  const labels = getLabelMap(isSpanish);

  return {
    requestTypeOptions: REQUISITION_REQUEST_TYPE_OPTIONS.map((value) => ({ value, label: labels.requestType[value] })),
    priorityOptions: REQUISITION_PRIORITY_OPTIONS.map((value) => ({ value, label: labels.priority[value] })),
    modalityOptions: REQUISITION_MODALITY_OPTIONS.map((value) => ({ value, label: labels.modality[value] })),
    contractTypeOptions: REQUISITION_CONTRACT_TYPE_OPTIONS.map((value) => ({ value, label: labels.contractType[value] })),
    statusOptions: REQUISITION_STATUS_OPTIONS.map((value) => ({ value, label: labels.status[value] })),
    labels,
  };
}

export function deriveRequisitionContext(form, organizations, jobRequests = []) {
  const companies = organizations.companies || [];
  const departments = organizations.departments || [];
  const positions = organizations.positions || [];
  const locations = organizations.locations || [];
  const levels = organizations.levels || [];

  const selectedPosition = positions.find((item) => item.id === form.positionId)
    || positions.find((item) => item.name === form.position);
  const selectedDepartment = departments.find((item) => item.id === form.departmentId)
    || departments.find((item) => item.name === form.department)
    || departments.find((item) => item.id === selectedPosition?.departmentId);
  const selectedLocation = locations.find((item) => item.id === form.locationId)
    || locations.find((item) => item.name === form.location)
    || locations.find((item) => item.id === selectedPosition?.locationId)
    || locations.find((item) => item.id === selectedDepartment?.locationId);
  const selectedCompany = companies.find((item) => item.id === form.companyId)
    || companies.find((item) => item.id === selectedPosition?.companyId)
    || companies.find((item) => item.id === selectedDepartment?.companyId);
  const selectedLevel = levels.find((item) => item.id === form.levelId)
    || levels.find((item) => item.id === selectedPosition?.levelId);

  const departmentRequests = jobRequests.filter((item) => item.departmentId === selectedDepartment?.id);
  const activeRequests = departmentRequests.filter((item) => ["submitted", "pending_review", "approved"].includes(item.status));
  const estimatedTeamSize = Number(selectedDepartment?.estimatedTeamSize) || 0;
  const occupiedHeadcount = activeRequests.reduce((sum, item) => sum + (Number(item.openings) || 0), 0);
  const availableHeadcount = Math.max(estimatedTeamSize - occupiedHeadcount, 0);
  const isNetNewHeadcount = ["new_position", "expansion", "critical"].includes(form.requestType);
  const replacementRequired = form.requestType === "replacement";
  const multiOpening = Number(form.openings) > 1;
  const priorityCritical = ["high", "critical"].includes(form.priority);
  const requiresApproval = Boolean(
    form.requiresApprovalOverride
    || priorityCritical
    || isNetNewHeadcount
    || multiOpening
    || selectedPosition?.criticalPosition
    || selectedDepartment?.criticalDepartment
  );
  const affectsBudget = isNetNewHeadcount || multiOpening || form.contractType === "contractor";
  const existingOpenRequest = jobRequests.find((item) => item.positionId === selectedPosition?.id && ["submitted", "pending_review", "approved"].includes(item.status) && item.id !== form.id);

  return {
    selectedCompany,
    selectedDepartment,
    selectedPosition,
    selectedLocation,
    selectedLevel,
    estimatedTeamSize,
    occupiedHeadcount,
    availableHeadcount,
    replacementRequired,
    multiOpening,
    priorityCritical,
    requiresApproval,
    affectsBudget,
    existingOpenRequest,
    approvalPath: [
      selectedDepartment?.departmentHead,
      form.recruiterOwner || "",
      form.processOwner || form.hiringManager || "",
    ].filter(Boolean),
  };
}

export function syncRequisitionWithContext(currentForm, context) {
  return {
    ...currentForm,
    companyId: context.selectedCompany?.id || currentForm.companyId,
    companyName: context.selectedCompany?.name || currentForm.companyName,
    positionId: context.selectedPosition?.id || currentForm.positionId,
    position: context.selectedPosition?.name || currentForm.position,
    departmentId: context.selectedDepartment?.id || currentForm.departmentId,
    department: context.selectedDepartment?.name || currentForm.department,
    levelId: context.selectedLevel?.id || currentForm.levelId,
    levelName: context.selectedLevel?.name || currentForm.levelName,
    locationId: context.selectedLocation?.id || currentForm.locationId,
    location: context.selectedLocation?.name || currentForm.location,
    hiringManager: currentForm.hiringManager || context.selectedDepartment?.departmentHead || "",
    requestingArea: currentForm.requestingArea || context.selectedDepartment?.name || "",
  };
}

export function validateRequisition(form, context, isSpanish, mode = "submit") {
  const errors = {};
  const openingCount = Number(form.openings);
  const justificationLength = form.businessReason.trim().length;

  if (mode === "draft") {
    if (!form.title.trim() && !form.positionId.trim()) {
      errors.title = isSpanish
        ? "Para guardar un borrador necesitas al menos un titulo o una posicion estructural."
        : "To save a draft you need at least a title or a structured position.";
    }
    return errors;
  }

  if (!form.title.trim()) {
    errors.title = isSpanish ? "La requisicion debe tener un titulo." : "The requisition must have a title.";
  }

  if (!form.positionId.trim()) {
    errors.positionId = isSpanish ? "Selecciona una posicion estructural." : "Select a structured position.";
  }

  if (!form.departmentId.trim() && !form.department.trim()) {
    errors.departmentId = isSpanish ? "Selecciona el departamento solicitante." : "Select the requesting department.";
  }

  if (!form.hiringManager.trim()) {
    errors.hiringManager = isSpanish ? "Define el hiring manager responsable." : "Define the responsible hiring manager.";
  }

  if (!form.recruiterOwner.trim()) {
    errors.recruiterOwner = isSpanish ? "Asigna un recruiter responsable." : "Assign a responsible recruiter.";
  }

  if (!form.processOwner.trim()) {
    errors.processOwner = isSpanish ? "Define un owner del proceso." : "Define a process owner.";
  }

  if (!form.locationId.trim() && !form.location.trim()) {
    errors.locationId = isSpanish ? "Selecciona la ubicacion de cobertura." : "Select the coverage location.";
  }

  if (!Number.isFinite(openingCount) || openingCount <= 0) {
    errors.openings = isSpanish ? "Las vacantes deben ser mayores a cero." : "Openings must be greater than zero.";
  }

  if (!form.targetHireDate) {
    errors.targetHireDate = isSpanish ? "Define una fecha objetivo de cobertura." : "Define a target coverage date.";
  }

  if (context.replacementRequired && !form.replacedEmployeeName.trim()) {
    errors.replacedEmployeeName = isSpanish
      ? "Un reemplazo debe indicar a quien sustituye."
      : "A replacement request must indicate who is being replaced.";
  }

  if ((context.priorityCritical || form.requestType === "critical") && justificationLength < 30) {
    errors.businessReason = isSpanish
      ? "Las solicitudes altas o criticas requieren una justificacion mas robusta."
      : "High or critical requests require a stronger business justification.";
  }

  if (context.multiOpening && form.hiringPlan.trim().length < 20) {
    errors.hiringPlan = isSpanish
      ? "Cuando hay mas de una vacante debes explicar el plan de cobertura."
      : "When there is more than one opening you must explain the staffing plan.";
  }

  if (context.existingOpenRequest) {
    errors.positionId = isSpanish
      ? "Ya existe una requisicion activa para esta posicion."
      : "There is already an active requisition for this position.";
  }

  if (form.status && !REQUISITION_STATUS_OPTIONS.includes(form.status)) {
    errors.status = isSpanish ? "El estado seleccionado no es valido." : "The selected status is invalid.";
  }

  return errors;
}

export function buildRequisitionImpact(form, context, labels, isSpanish) {
  return [
    {
      key: "headcount",
      label: isSpanish ? "Impacta headcount" : "Impacts headcount",
      value: context.isNetNewHeadcount ? (isSpanish ? "Si" : "Yes") : (isSpanish ? "No" : "No"),
      tone: context.isNetNewHeadcount ? "warning" : "neutral",
    },
    {
      key: "approval",
      label: isSpanish ? "Requiere aprobacion" : "Requires approval",
      value: context.requiresApproval ? (isSpanish ? "Si" : "Yes") : (isSpanish ? "No" : "No"),
      tone: context.requiresApproval ? "info" : "neutral",
    },
    {
      key: "budget",
      label: isSpanish ? "Afecta presupuesto" : "Affects budget",
      value: context.affectsBudget ? (isSpanish ? "Si" : "Yes") : (isSpanish ? "No" : "No"),
      tone: context.affectsBudget ? "warning" : "neutral",
    },
    {
      key: "priority",
      label: isSpanish ? "Prioridad del negocio" : "Business priority",
      value: labels.priority[form.priority] || form.priority,
      tone: form.priority === "critical" ? "critical" : form.priority === "high" ? "warning" : "neutral",
    },
  ];
}

export function createWorkflowSteps(context, form, isSpanish) {
  const names = context.approvalPath.length
    ? context.approvalPath
    : [form.hiringManager, form.recruiterOwner, form.processOwner].filter(Boolean);

  if (!names.length) {
    return [];
  }

  return names.map((name, index) => ({
    id: `${name}-${index}`,
    title: name,
    state:
      form.status === "approved"
        ? "done"
        : form.status === "rejected"
          ? index === 0 ? "blocked" : "pending"
          : index === 0 && ["submitted", "pending_review"].includes(form.status)
            ? "current"
            : "pending",
    description:
      index === 0
        ? (isSpanish ? "Revision inicial" : "Initial review")
        : index === names.length - 1
          ? (isSpanish ? "Cierre y autorizacion" : "Final authorization")
          : (isSpanish ? "Aprobacion intermedia" : "Intermediate approval"),
  }));
}

export function createSubmissionPayload(form, context, actor, nextStatus) {
  const timestamp = new Date().toISOString();

  return {
    ...syncRequisitionWithContext(form, context),
    openings: Number(form.openings) || 1,
    status: nextStatus,
    createdAt: form.createdAt || timestamp,
    createdBy: form.createdBy || actor,
    updatedAt: timestamp,
    lastModifiedBy: actor,
    requiresApproval: context.requiresApproval,
    affectsBudget: context.affectsBudget,
    approvalPath: context.approvalPath,
    history: [
      ...(form.history || []),
      {
        id: `${nextStatus}-${timestamp}`,
        action: nextStatus,
        actor,
        date: timestamp,
      },
    ],
  };
}
