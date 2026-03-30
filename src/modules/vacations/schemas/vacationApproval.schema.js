export const vacationApprovalStepSchema = {
  id: "",
  requestId: "",
  sequence: 1,
  role: "manager",
  actor: "",
  delegatedTo: "",
  status: "pending",
  decidedAt: "",
  comment: "",
};

export const vacationAuditEventSchema = {
  id: "",
  requestId: "",
  actor: "",
  action: "",
  fromStatus: "",
  toStatus: "",
  occurredAt: "",
  note: "",
};

export default vacationApprovalStepSchema;
