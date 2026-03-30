import { getVacationSubsystem } from "./vacations.domain";

export async function getVacationBalancesWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    balances: subsystem.balances,
    policies: subsystem.policies,
    requests: subsystem.requests,
  };
}

export async function getVacationBalanceByEmployee(employeeId) {
  const subsystem = await getVacationSubsystem();
  return subsystem.balances.find((item) => item.employeeId === employeeId) || null;
}

export default {
  getVacationBalancesWorkspace,
  getVacationBalanceByEmployee,
};
