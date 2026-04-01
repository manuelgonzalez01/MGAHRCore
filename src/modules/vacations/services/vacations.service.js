import { getVacationSubsystem } from "./vacations.domain";
import { loadCachedResource } from "../../../utils/resourceCache";

const VACATIONS_CACHE_TTL_MS = 20_000;

export async function getVacationsDashboard() {
  return loadCachedResource(
    "vacations:dashboard",
    async () => {
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
    },
    VACATIONS_CACHE_TTL_MS,
  );
}

export async function getVacationHistory() {
  return loadCachedResource(
    "vacations:history",
    async () => {
      const subsystem = await getVacationSubsystem();
      return subsystem.history;
    },
    VACATIONS_CACHE_TTL_MS,
  );
}

export async function getVacationConflicts() {
  return loadCachedResource(
    "vacations:conflicts",
    async () => {
      const subsystem = await getVacationSubsystem();
      return subsystem.conflicts;
    },
    VACATIONS_CACHE_TTL_MS,
  );
}

export default {
  getVacationsDashboard,
  getVacationHistory,
  getVacationConflicts,
};
