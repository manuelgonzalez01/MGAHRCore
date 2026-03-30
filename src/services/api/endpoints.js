export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
  },
  administration: {
    settings: "/administration/settings",
    organizations: "/administration/organizations",
    approvalFlows: "/administration/approval-flows",
  },
  recruitment: {
    dashboard: "/recruitment/dashboard",
    jobRequests: "/recruitment/job-requests",
    candidates: "/recruitment/candidates",
    interviews: "/recruitment/interviews",
    evaluations: "/recruitment/evaluations",
  },
  employees: {
    dashboard: "/employees/dashboard",
    records: "/employees",
    requests: "/employees/requests",
  },
};

export default API_ENDPOINTS;
