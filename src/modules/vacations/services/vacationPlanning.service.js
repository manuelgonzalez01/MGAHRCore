import { getVacationSubsystem, upsertVacationPlan } from "./vacations.domain";

export async function getVacationPlanningWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    plans: subsystem.plans,
    conflicts: subsystem.conflicts,
    requests: subsystem.requests,
    balances: subsystem.balances,
  };
}

export async function saveVacationPlan(payload) {
  return upsertVacationPlan(payload);
}

export default {
  getVacationPlanningWorkspace,
  saveVacationPlan,
};
