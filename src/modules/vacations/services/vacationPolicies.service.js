import { deleteVacationPolicy, deleteVacationRule, getVacationSubsystem, upsertVacationPolicy, upsertVacationRule } from "./vacations.domain";

export async function getVacationPoliciesWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    policies: subsystem.policies,
    rules: subsystem.rules,
    organizations: subsystem.organizations,
    approvalFlow: subsystem.approvalFlow,
  };
}

export async function saveVacationPolicy(payload) {
  return upsertVacationPolicy(payload);
}

export async function saveVacationRule(payload) {
  return upsertVacationRule(payload);
}

export async function removeVacationPolicy(policyId) {
  return deleteVacationPolicy(policyId);
}

export async function removeVacationRule(ruleId) {
  return deleteVacationRule(ruleId);
}

export default {
  getVacationPoliciesWorkspace,
  saveVacationPolicy,
  saveVacationRule,
  removeVacationPolicy,
  removeVacationRule,
};
