import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function NineBoxGrid({ items = [] }) {
  const { t } = useDevelopmentLocale();
  const potentialLabels = {
    developing: t("Potencial en desarrollo", "Developing potential"),
    ready_soon: t("Potencial medio", "Medium potential"),
    ready_now: t("Alto potencial", "High potential"),
  };
  const performanceLabels = {
    emerging: t("Performance emergente", "Emerging performance"),
    medium: t("Performance media", "Medium performance"),
    high: t("Performance alta", "High performance"),
  };

  return (
    <div className="development-nine-box">
      {items.map((cell) => (
        <article key={cell.id} className="development-nine-box__cell">
          <strong>{potentialLabels[cell.potentialBand]}</strong>
          <p className="development-muted">{performanceLabels[cell.performanceBand]}</p>
          <span className="development-chip">{cell.employees.length}</span>
          <p className="development-muted">
            {cell.employees.slice(0, 3).map((item) => item.employeeName).join(", ") || t("Sin colaboradores", "No employees")}
          </p>
        </article>
      ))}
    </div>
  );
}
