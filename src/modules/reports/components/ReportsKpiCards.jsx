import { formatCurrency, formatNumber, formatPercent } from "../utils/reports.helpers";

function formatValue(item) {
  if (item.format === "currency") {
    return formatCurrency(item.value, item.currency || "BOB");
  }
  if (item.format === "percent") {
    return formatPercent(item.value, item.digits ?? 1);
  }
  if (item.format === "number") {
    return formatNumber(item.value);
  }

  return item.value;
}

export default function ReportsKpiCards({ items = [] }) {
  return (
    <section className="reports-kpis">
      {items.map((item) => (
        <article key={item.label} className="reports-kpi">
          <span>{item.label}</span>
          <strong>{formatValue(item)}</strong>
          {item.helper ? <p>{item.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}
