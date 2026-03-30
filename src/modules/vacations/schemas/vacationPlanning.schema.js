export const vacationPlanSchema = {
  id: "",
  employeeId: "",
  employeeName: "",
  department: "",
  month: "",
  plannedDays: 0,
  executedDays: 0,
  complianceRatio: 0,
  varianceDays: 0,
  status: "scheduled",
  coverageRisk: "healthy",
};

export const vacationConflictSchema = {
  id: "",
  requestId: "",
  employeeId: "",
  employeeName: "",
  type: "coverage",
  severity: "warning",
  title: "",
  detail: "",
  affectedWindow: "",
};

export const vacationCalendarEventSchema = {
  id: "",
  date: "",
  type: "vacation",
  label: "",
  employeeName: "",
  status: "",
  location: "",
};

export default vacationPlanSchema;
