import {
  createVacationAmendment,
  createVacationRequest,
  getVacationRequestById,
  getVacationSubsystem,
  simulateVacationImpact,
  transitionVacationRequest,
  updateVacationRequest,
} from "./vacations.domain";

export async function getVacationRequestsWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    requests: subsystem.requests,
    employees: subsystem.employees,
    balances: subsystem.balances,
    policies: subsystem.policies,
    rules: subsystem.rules,
    conflicts: subsystem.conflicts,
  };
}

export async function getVacationRequestDetails(requestId) {
  return getVacationRequestById(requestId);
}

export async function saveVacationRequest(payload) {
  if (payload.id) {
    return updateVacationRequest(payload.id, payload);
  }
  return createVacationRequest(payload);
}

export async function submitVacationRequest(requestId, payload = {}) {
  return transitionVacationRequest(requestId, "submit", payload);
}

export async function previewVacationRequest(payload) {
  return simulateVacationImpact(payload);
}

export async function amendVacationRequest(requestId, payload = {}) {
  return createVacationAmendment(requestId, payload);
}

export default {
  getVacationRequestsWorkspace,
  getVacationRequestDetails,
  saveVacationRequest,
  submitVacationRequest,
  previewVacationRequest,
  amendVacationRequest,
};
