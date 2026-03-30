import { formatCurrency, formatNumber } from "../utils/reports.helpers";
import useReportsLocale from "../hooks/useReportsLocale";

export default function SalaryDistributionPanel({ bands = [], byLevel = [] }) {
  const { t } = useReportsLocale();

  return (
    <div className="reports-columns">
      <div className="reports-card">
        <span className="reports-mini-label">{t("Bandas salariales", "Salary bands")}</span>
        <div className="reports-list">
          {bands.map((band) => (
            <article key={band.label}>
              <strong>{band.label}</strong>
              <p className="reports-muted">{formatNumber(band.count)} {t("colaboradores", "employees")}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="reports-card">
        <span className="reports-mini-label">{t("Promedio por nivel", "Average by level")}</span>
        <div className="reports-list">
          {byLevel.slice(0, 6).map((item) => (
            <article key={item.label}>
              <strong>{item.label}</strong>
              <p className="reports-muted">{formatCurrency(item.value)} {t("acumulado", "accumulated")} | {formatNumber(item.count)} {t("colaboradores", "employees")}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
