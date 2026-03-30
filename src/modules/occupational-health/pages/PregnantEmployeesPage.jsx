import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthCaseCard from "../components/HealthCaseCard";
import HealthHeader from "../components/HealthHeader";
import useHealthLocale from "../hooks/useHealthLocale";
import usePregnantEmployees from "../hooks/usePregnantEmployees";

export default function PregnantEmployeesPage() {
  const { t } = useHealthLocale();
  const { data, loading, error } = usePregnantEmployees();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando condiciones especiales", "Loading special conditions")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar condiciones especiales", "Could not load special conditions")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader eyebrow={t("Special Conditions", "Special Conditions")} title={t("Embarazo y restricciones", "Pregnancy and restrictions")} description={t("Seguimiento de condiciones medicas especiales y ajustes laborales.", "Tracking of special medical conditions and work adjustments.")} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="health-case-grid">
              {data.items.map((item) => (
                <article key={item.id} className="health-case-card">
                  <strong>{item.employeeName}</strong>
                  <p className="suite-muted">{item.conditionType}</p>
                  <p>{item.restriction}</p>
                  <p className="suite-muted">{item.followUpDate}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="suite-card">
            <div className="health-case-grid">
              {data.cases.map((item) => <HealthCaseCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
