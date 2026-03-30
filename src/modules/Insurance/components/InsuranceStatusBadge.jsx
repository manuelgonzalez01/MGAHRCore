import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { getInsuranceStatusLabel, resolveInsuranceStatusTone } from "../utils/insurance.helpers";

export default function InsuranceStatusBadge({ status }) {
  const { language } = useInsuranceLocale();
  const tone = resolveInsuranceStatusTone(status);

  return (
    <span className={`insurance-status-badge ${tone}`}>
      {getInsuranceStatusLabel(status, language)}
    </span>
  );
}
