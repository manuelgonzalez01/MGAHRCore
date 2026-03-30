export function emptyPlanAction() {
  return {
    title: "",
    owner: "",
    targetDate: "",
    priority: "medium",
    progress: 0,
    status: "not_started",
    evidence: "",
    notes: "",
    blockers: "",
  };
}

export function emptyPlanObjective() {
  return {
    title: "",
    owner: "",
    targetDate: "",
    priority: "medium",
    progress: 0,
    status: "in_progress",
    evidence: "",
    notes: "",
    blockers: "",
    actions: [emptyPlanAction()],
  };
}
