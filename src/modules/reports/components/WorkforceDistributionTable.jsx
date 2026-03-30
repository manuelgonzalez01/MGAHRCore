import { formatCurrency, formatNumber } from "../utils/reports.helpers";
import useReportsLocale from "../hooks/useReportsLocale";

export default function WorkforceDistributionTable({ title, rows = [], valueLabel = "Registros", valueType = "number" }) {
  const { t } = useReportsLocale();

  return (
    <div className="reports-table-shell">
      <table className="reports-table">
        <thead>
          <tr>
            <th>{title}</th>
            <th>{t("Headcount", "Headcount")}</th>
            <th>{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${title}-${row.label}`}>
              <td><strong>{row.label}</strong></td>
              <td>{formatNumber(row.count)}</td>
              <td>{valueType === "currency" ? formatCurrency(row.value) : formatNumber(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
