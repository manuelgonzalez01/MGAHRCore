import { getVacationSubsystem } from "./vacations.domain";

export async function getVacationsDashboard() {
  const subsystem = await getVacationSubsystem();

  return {
    dashboard: subsystem.dashboard,
    policies: subsystem.policies,
    balances: subsystem.balances,
    requests: subsystem.requests,
    approvalQueue: subsystem.approvalQueue,
    plans: subsystem.plans,
    conflicts: subsystem.conflicts,
    reports: subsystem.reports,
    history: subsystem.history,
    calendar: subsystem.calendar,
    approvalFlow: subsystem.approvalFlow,
    organizations: subsystem.organizations,
    rules: subsystem.rules,
  };
}

export async function getVacationHistory() {
  const subsystem = await getVacationSubsystem();
  return subsystem.history;
}

export async function getVacationConflicts() {
  const subsystem = await getVacationSubsystem();
  return subsystem.conflicts;
}

export default {
  getVacationsDashboard,
  getVacationHistory,
  getVacationConflicts,
};
