export const employeeFilterSchema = {
  query: "",
  company: "all",
  department: "all",
  status: "all",
  location: "all",
};

export const employeeLifecycleSchema = {
  history: [],
  actions: [],
  onboarding: {
    status: "in_progress",
    completion: 0,
    owner: "",
    nextCheckpoint: "",
  },
};
