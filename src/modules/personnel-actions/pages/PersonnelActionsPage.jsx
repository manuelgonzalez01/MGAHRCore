import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import PersonnelActionsStatsCards from "../components/PersonnelActionsStatsCards";
import PersonnelActionsTable from "../components/PersonnelActionsTable";
import PersonnelActionsEmptyState from "../components/PersonnelActionsEmptyState";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import usePersonnelActionsDashboard from "../hooks/usePersonnelActionsDashboard";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function PersonnelActionsPage() {
  const { t, language } = usePersonnelActionsLocale();
  const { data, loading, error } = usePersonnelActionsDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando acciones de personal", "Loading personnel actions")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar el modulo", "Could not load the module")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader
        eyebrow={t("Workforce Change Governance", "Workforce Change Governance")}
        title={t("Acciones de personal", "Personnel actions")}
        description={t("Controla cambios sensibles del colaborador con workflow, impacto before/after, aprobacion y trazabilidad.", "Control sensitive employee changes with workflow, before/after impact, approval, and traceability.")}
        actions={<Link className="suite-button" to="/personnel-actions/list">{t("Abrir bandeja operativa", "Open operational queue")}</Link>}
      />
      <PersonnelActionsStatsCards
        items={[
          { label: t("Total acciones", "Total actions"), value: data.kpis.totalActions },
          { label: t("Pendientes", "Pending"), value: data.kpis.pendingApprovals },
          { label: t("Promociones", "Promotions"), value: data.kpis.promotions },
          { label: t("Cambios salariales", "Salary changes"), value: data.kpis.salaryChanges },
          { label: t("Traslados", "Transfers"), value: data.kpis.transfers },
          { label: t("Tiempo promedio aprobacion", "Average approval time"), value: `${data.kpis.avgApprovalDays}d` },
        ]}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Acciones pendientes", "Pending actions")}</h2>
                <p className="suite-muted">{t("Solicitudes que requieren movimiento de workflow.", "Requests that require workflow movement.")}</p>
              </div>
              <Link className="suite-button-secondary" to="/personnel-actions/list">{t("Ver todo", "View all")}</Link>
            </div>
            {data.pendingActions.length ? (
              <PersonnelActionsTable items={data.pendingActions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
            ) : (
              <PersonnelActionsEmptyState
                title={t("Sin acciones pendientes", "No pending actions")}
                description={t("Cuando existan solicitudes en revision apareceran aqui.", "Requests under review will appear here.")}
              />
            )}
          </section>
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Feed del dominio", "Domain feed")}</h2>
                <p className="suite-muted">{t("Ultimos eventos efectivos y aprobaciones.", "Latest effective events and approvals.")}</p>
              </div>
            </div>
            <div className="personnel-audit-list">
              {data.recentActions.map((item) => (
                <article key={item.id} className="suite-list-item">
                  <span>{item.effectiveDate}</span>
                  <strong>{item.employeeName}</strong>
                  <p className="suite-muted">{item.typeLabel} | {item.statusLabel}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      <ModuleConnectionsPanel moduleKey="personnel-actions" language={language} />
    </main>
  );
}
