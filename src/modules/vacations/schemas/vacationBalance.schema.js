export const vacationBalanceSchema = {
  employeeId: "",
  employeeName: "",
  company: "",
  department: "",
  manager: "",
  entitlement: 0,
  earned: 0,
  carryOver: 0,
  consumed: 0,
  approved: 0,
  pending: 0,
  expired: 0,
  available: 0,
  risk: "neutral",
};

export const vacationBalanceMovementSchema = {
  id: "",
  employeeId: "",
  requestId: "",
  type: "earned",
  days: 0,
  effectiveDate: "",
  actor: "",
  reason: "",
};

export default vacationBalanceSchema;
