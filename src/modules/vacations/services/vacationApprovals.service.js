import { getVacationSubsystem, transitionVacationRequest } from "./vacations.domain";

export async function getVacationApprovalsWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    queue: subsystem.approvalQueue,
    approvalFlow: subsystem.approvalFlow,
    history: subsystem.history,
    requests: subsystem.requests,
  };
}

export async function approveVacationRequest(requestId, payload = {}) {
  return transitionVacationRequest(requestId, "approve", payload);
}

export async function rejectVacationRequest(requestId, payload = {}) {
  return transitionVacationRequest(requestId, "reject", payload);
}

export async function returnVacationRequest(requestId, payload = {}) {
  return transitionVacationRequest(requestId, "return", payload);
}

export async function delegateVacationApproval(requestId, payload = {}) {
  return transitionVacationRequest(requestId, "delegate", payload);
}

export default {
  getVacationApprovalsWorkspace,
  approveVacationRequest,
  rejectVacationRequest,
  returnVacationRequest,
  delegateVacationApproval,
};
