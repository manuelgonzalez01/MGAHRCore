import { getMaxSeriesValue } from "../utils/reports.helpers";
import useReportsLocale from "../hooks/useReportsLocale";

function Series({ title, rows }) {
  const max = getMaxSeriesValue(rows);

  return (
    <div className="reports-card">
      <span className="reports-mini-label">{title}</span>
      <div className="reports-series">
        {rows.map((row) => (
          <div key={`${title}-${row.key}`} className="reports-series__row">
            <span>{row.label}</span>
            <div className="reports-series__track">
              <div className="reports-series__fill" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RotationTrendPanel({ trend }) {
  const { t } = useReportsLocale();

  return (
    <div className="reports-columns">
      <Series title={t("Entradas", "Entries")} rows={trend.entries} />
      <Series title={t("Salidas", "Exits")} rows={trend.exits} />
    </div>
  );
}
