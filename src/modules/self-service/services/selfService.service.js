import {
  createPermissionRequest,
  createProfileChangeRequest,
  createVacationSelfServiceRequest,
  exportSelfServiceWorkspace,
  getSelfServiceDomain,
  setSelfServiceEmployeeContext,
  simulateSelfServiceVacationRequest,
  transitionPermissionRequest,
} from "./selfServiceDomain.service";

export async function getSelfServiceDashboard() {
  const domain = await getSelfServiceDomain();

  return {
    employee: domain.employee,
    approvals: domain.approvals,
    requests: domain.requests,
    stats: domain.stats,
    summary: domain.summary,
    quickActions: domain.quickActions,
    options: domain.options,
    byType: domain.byType,
    permissions: domain.permissions,
    vacationRequests: domain.vacationRequests,
    profileChanges: domain.profileChanges,
  };
}

export async function getSelfServiceRequestsWorkspace() {
  const domain = await getSelfServiceDomain();
  return {
    employee: domain.employee,
    requests: domain.requests,
    options: domain.options,
    stats: domain.stats,
  };
}

export async function getSelfServiceVacationRequestsWorkspace() {
  const domain = await getSelfServiceDomain();
  return {
    employee: domain.employee,
    requests: domain.vacationRequests,
    balances: domain.balances,
    plans: domain.plans,
    options: domain.options,
  };
}

export async function getSelfServicePermissionRequestsWorkspace() {
  const domain = await getSelfServiceDomain();
  return {
    employee: domain.employee,
    requests: domain.permissions,
    profileChanges: domain.profileChanges,
    options: domain.options,
  };
}

export async function getSelfServiceApprovalsWorkspace() {
  const domain = await getSelfServiceDomain();
  return {
    employee: domain.employee,
    approvals: domain.approvals,
    requests: domain.requests,
    options: domain.options,
  };
}

export {
  createPermissionRequest,
  createProfileChangeRequest,
  createVacationSelfServiceRequest,
  exportSelfServiceWorkspace,
  setSelfServiceEmployeeContext,
  simulateSelfServiceVacationRequest,
  transitionPermissionRequest,
};

export default {
  getSelfServiceDashboard,
  getSelfServiceRequestsWorkspace,
  getSelfServiceVacationRequestsWorkspace,
  getSelfServicePermissionRequestsWorkspace,
  getSelfServiceApprovalsWorkspace,
  createPermissionRequest,
  createProfileChangeRequest,
  createVacationSelfServiceRequest,
  transitionPermissionRequest,
  simulateSelfServiceVacationRequest,
  exportSelfServiceWorkspace,
  setSelfServiceEmployeeContext,
};
