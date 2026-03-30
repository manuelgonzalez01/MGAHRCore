import { calculateTenureLabel, formatCurrency, formatNumber } from "../utils/reports.helpers";
import useReportsLocale from "../hooks/useReportsLocale";

export default function HeadcountSummaryPanel({ summary }) {
  const { t } = useReportsLocale();

  return (
    <div className="reports-columns">
      <article className="reports-card">
        <span className="reports-mini-label">{t("Composicion activa", "Active composition")}</span>
        <h3>{formatNumber(summary.activeEmployees)} {t("activos", "active")} / {formatNumber(summary.inactiveEmployees)} {t("inactivos", "inactive")}</h3>
        <p className="reports-muted">{t("Visibilidad estructural para lectura ejecutiva del workforce actual.", "Structural visibility for executive reading of the current workforce.")}</p>
      </article>
      <article className="reports-card">
        <span className="reports-mini-label">{t("Tenure promedio", "Average tenure")}</span>
        <h3>{calculateTenureLabel(summary.averageTenure)}</h3>
        <p className="reports-muted">{t("Antiguedad media del universo filtrado.", "Average tenure of the filtered workforce.")}</p>
      </article>
      <article className="reports-card">
        <span className="reports-mini-label">{t("Completitud del expediente", "File completion")}</span>
        <h3>{summary.averageProfileCompletion}%</h3>
        <p className="reports-muted">{t("Madurez promedio del expediente y contexto del colaborador.", "Average maturity of employee file and organizational context.")}</p>
      </article>
      <article className="reports-card">
        <span className="reports-mini-label">{t("Compensacion media", "Average compensation")}</span>
        <h3>{formatCurrency(summary.averageCompensation)}</h3>
        <p className="reports-muted">{t("Referencia transversal para lectura por posicion y nivel.", "Cross-reference for reading by position and level.")}</p>
      </article>
    </div>
  );
}
