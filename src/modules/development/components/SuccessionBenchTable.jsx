import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function SuccessionBenchTable({ items = [] }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Rol critico", "Critical role")}</th>
            <th>{t("Nivel", "Level")}</th>
            <th>{t("Bench", "Bench")}</th>
            <th>{t("Ready now", "Ready now")}</th>
            <th>{t("Ready soon", "Ready soon")}</th>
            <th>{t("Cobertura", "Coverage")}</th>
            <th>{t("Riesgo", "Risk")}</th>
            <th>{t("Exposicion", "Exposure")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.role}-${item.levelName}`}>
              <td>{item.role}</td>
              <td>{item.levelName}</td>
              <td>{item.benchCount}</td>
              <td>{item.readyNow}</td>
              <td>{item.readySoon}</td>
              <td>{item.coverageRate}%</td>
              <td>{item.riskLevel}</td>
              <td>{item.criticalExposure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
