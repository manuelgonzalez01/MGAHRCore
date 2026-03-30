const developmentPlanSchema = {
  id: "",
  employeeId: "",
  employeeName: "",
  owner: "",
  sponsor: "",
  workflowStatus: "draft",
  status: "draft",
  healthStatus: "in_progress",
  progress: 0,
  readiness: 0,
  targetDate: "",
  objectives: [],
  nextMilestone: "",
  workflowComment: "",
  workflowTrail: [],
  currentStageOwner: "",
  currentStageRole: "owner",
  lastUpdatedAt: "",
  lastUpdatedBy: "",
};

export default developmentPlanSchema;
