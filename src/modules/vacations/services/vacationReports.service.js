import { getVacationSubsystem } from "./vacations.domain";

export async function getVacationReportsWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    ...subsystem.reports,
    dashboard: subsystem.dashboard,
  };
}

export default {
  getVacationReportsWorkspace,
};
