import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { formatInsuranceCurrency } from "../utils/insurance.helpers";

export default function InsuranceCostBreakdown({ items = [], currency = "BOB", title, description }) {
  const { language, t } = useInsuranceLocale();

  return (
    <section className="suite-card">
      <h2>{title}</h2>
      <p className="suite-muted">{description}</p>
      <div className="insurance-breakdown-list">
        {items.map((item) => (
          <article key={item.label} className="suite-list-item">
            <span>{item.count} {t("registros", "records")}</span>
            <strong>{item.label}</strong>
            <p className="suite-muted">{formatInsuranceCurrency(item.value, currency, language)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
