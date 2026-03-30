import { getStatusLabel, getStatusTone } from "../utils/vacation.helpers";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationStatusBadge({ status }) {
  const { isSpanish } = useVacationLocale();
  return <span className={`suite-badge ${getStatusTone(status)}`}>{getStatusLabel(status, isSpanish)}</span>;
}
