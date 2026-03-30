import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthCaseCard from "../components/HealthCaseCard";
import HealthHeader from "../components/HealthHeader";
import HealthStatsCards from "../components/HealthStatsCards";
import InjuriesTable from "../components/InjuriesTable";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useOccupationalHealthDashboard from "../hooks/useOccupationalHealthDashboard";
import useHealthLocale from "../hooks/useHealthLocale";
import { exportOccupationalHealthSection } from "../services/occupationalHealth.service";
import { triggerTextDownload } from "../utils/download.helpers";

export default function OccupationalHealthPage() {
  const { t, language } = useHealthLocale();
  const { data, loading, error } = useOccupationalHealthDashboard();

  const handleExport = async () => {
    const exported = await exportOccupationalHealthSection("dashboard");
    triggerTextDownload(exported.fileName, exported.content);
  };

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando salud ocupacional", "Loading occupational health")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar salud ocupacional", "Could not load occupational health")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader
        eyebrow={t("Occupational Health & Safety", "Occupational Health & Safety")}
        title={t("Salud ocupacional", "Occupational health")}
        description={t("Gestiona incidentes, visitas medicas, laboratorio, restricciones y seguimiento de casos con trazabilidad operativa.", "Manage incidents, medical visits, laboratory, restrictions, and case follow-up with operational traceability.")}
        actions={
          <div className="health-header-actions">
            <button type="button" className="suite-button-secondary" onClick={handleExport}>{t("Exportar", "Export")}</button>
            <Link className="suite-button" to="/occupational-health/reports">{t("Ver reportes", "View reports")}</Link>
          </div>
        }
      />
      <HealthStatsCards
        items={[
          { label: t("Incidentes", "Incidents"), value: data.stats.incidents },
          { label: t("Casos abiertos", "Open cases"), value: data.stats.openCases },
          { label: t("Labs pendientes", "Pending labs"), value: data.stats.pendingLabs },
          { label: t("Restricciones activas", "Active restrictions"), value: data.stats.activeRestrictions },
          { label: t("Dias perdidos", "Lost days"), value: data.stats.lostDays },
          { label: t("Monitoreados", "Monitored"), value: data.stats.monitoredEmployees },
        ]}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Incidentes recientes", "Recent incidents")}</h2>
                <p className="suite-muted">{t("Vista ejecutiva de seguridad y seguimiento correctivo.", "Executive view of safety and corrective follow-up.")}</p>
              </div>
              <Link className="suite-button-secondary" to="/occupational-health/injuries">{t("Abrir", "Open")}</Link>
            </div>
            <InjuriesTable items={data.injuries.slice(0, 6)} t={t} />
          </section>
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Casos priorizados", "Prioritized cases")}</h2>
                <p className="suite-muted">{t("Seguimiento de salud con alertas y proximos pasos.", "Health follow-up with alerts and next steps.")}</p>
              </div>
            </div>
            <div className="health-case-grid">
              {data.cases.slice(0, 4).map((item) => <HealthCaseCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      </section>
      <ModuleConnectionsPanel moduleKey="occupational-health" language={language} />
    </main>
  );
}
