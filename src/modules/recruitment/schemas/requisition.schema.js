export const REQUISITION_STATUS_OPTIONS = [
  "draft",
  "submitted",
  "pending_review",
  "approved",
  "rejected",
  "closed",
];

export const REQUISITION_PRIORITY_OPTIONS = ["medium", "high", "critical"];
export const REQUISITION_MODALITY_OPTIONS = ["remote", "hybrid", "onsite"];
export const REQUISITION_REQUEST_TYPE_OPTIONS = [
  "new_position",
  "replacement",
  "expansion",
  "backfill",
  "temporary",
  "critical",
];
export const REQUISITION_CONTRACT_TYPE_OPTIONS = [
  "indefinite",
  "fixed_term",
  "temporary",
  "internship",
  "contractor",
];

export function createInitialRequisitionForm() {
  return {
    id: "",
    title: "",
    companyId: "",
    companyName: "",
    departmentId: "",
    department: "",
    positionId: "",
    position: "",
    levelId: "",
    levelName: "",
    locationId: "",
    location: "",
    modality: "hybrid",
    contractType: "indefinite",
    openings: 1,
    targetHireDate: "",
    requestType: "replacement",
    requestCategory: "operational",
    priority: "medium",
    status: "draft",
    hiringManager: "",
    recruiterOwner: "",
    processOwner: "",
    requestingArea: "",
    replacedEmployeeId: "",
    replacedEmployeeName: "",
    businessReason: "",
    roleImpact: "",
    priorityJustification: "",
    areaNotes: "",
    hiringPlan: "",
    requiresApprovalOverride: false,
    createdAt: "",
    createdBy: "",
    updatedAt: "",
    lastModifiedBy: "",
    workflowComments: "",
    history: [],
  };
}
