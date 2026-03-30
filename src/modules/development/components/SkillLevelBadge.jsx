import { getSkillLevelTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function SkillLevelBadge({ level }) {
  const { t } = useDevelopmentLocale();
  const labels = {
    advanced: t("Avanzado", "Advanced"),
    expert: t("Experto", "Expert"),
    developing: t("En desarrollo", "Developing"),
    critical_gap: t("Brecha critica", "Critical gap"),
  };

  return <span className={`development-badge ${getSkillLevelTone(level)}`}>{labels[level] || level}</span>;
}
