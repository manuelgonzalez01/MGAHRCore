import { getVacationSubsystem } from "./vacations.domain";

export async function getVacationCalendarWorkspace() {
  const subsystem = await getVacationSubsystem();
  return {
    calendar: subsystem.calendar,
    conflicts: subsystem.conflicts,
    plans: subsystem.plans,
  };
}

export default {
  getVacationCalendarWorkspace,
};
