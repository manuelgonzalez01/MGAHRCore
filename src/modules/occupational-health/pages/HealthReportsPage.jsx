import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthHeader from "../components/HealthHeader";
import HealthStatsCards from "../components/HealthStatsCards";
import useOccupationalHealthDashboard from "../hooks/useOccupationalHealthDashboard";
import useHealthLocale from "../hooks/useHealthLocale";

export default function HealthReportsPage() {
  const { t } = useHealthLocale();
  const { data, loading, error } = useOccupationalHealthDashboard();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando reportes de salud", "Loading health reports")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar reportes", "Could not load reports")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader eyebrow={t("Health Reports", "Health Reports")} title={t("Reportes de salud ocupacional", "Occupational health reports")} description={t("Lectura ejecutiva de incidentes, cumplimiento y tendencia operativa.", "Executive view of incidents, compliance, and operational trends.")} />
      <HealthStatsCards
        items={[
          { label: t("Visitas completadas", "Completed visits"), value: data.reporting.compliance.visitsCompleted },
          { label: t("Visitas pendientes", "Pending visits"), value: data.reporting.compliance.visitsPending },
          { label: t("Labs completados", "Completed labs"), value: data.reporting.compliance.labsCompleted },
          { label: t("Labs pendientes", "Pending labs"), value: data.reporting.compliance.labsPending },
        ]}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Tendencia de incidentes", "Incident trend")}</h2>
            <div className="health-timeline">
              {data.reporting.incidentTrend.map((item, index) => (
                <article key={`${item.label}-${index}`} className="suite-list-item">
                  <span>{item.label}</span>
                  <strong>{item.severity}</strong>
                  <p className="suite-muted">{item.value}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
