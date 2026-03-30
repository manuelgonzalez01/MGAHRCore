import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../shared/hrSuite.css";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import ApprovalFlowCard from "../components/ApprovalFlowCard";
import ApprovalRulesTable from "../components/ApprovalRulesTable";
import LanguageSettingsCard from "../components/LanguageSettingsCard";
import AdminAuditFeed from "../components/AdminAuditFeed";
import AdminHealthPanel from "../components/AdminHealthPanel";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useAdministrationOverview from "../hooks/useAdministrationOverview";
import useLanguageSettings from "../hooks/useLanguageSettings";
import administrationService from "../services/administration.service";

export default function AdministrationPage() {
  const navigate = useNavigate();
  const [seedLoading, setSeedLoading] = useState(false);
  const { data, loading, error, refresh } = useAdministrationOverview();
  const { language, updateLanguage } = useLanguageSettings();
  const canUseDevSeed = Boolean(import.meta.env.DEV);
  const hasSeedLoaded = administrationService.hasAdministrationDevelopmentSeed();

  async function handleLoadSeed() {
    setSeedLoading(true);
    await administrationService.loadAdministrationDevelopmentSeed();
    setSeedLoading(false);
    refresh();
  }

  async function handleClearSeed() {
    setSeedLoading(true);
    await administrationService.clearAdministrationDevelopmentSeed();
    setSeedLoading(false);
    refresh();
  }

  if (loading) {
    return <main className="administration-page"><AdministrationEmptyState title="Cargando control tower" description="Estamos preparando el modulo de gobierno, accesos y configuracion." /></main>;
  }

  if (error || !data) {
    return <main className="administration-page"><AdministrationEmptyState title="No fue posible cargar Administration" description={error || "Sin datos"} /></main>;
  }

  const quickActions = [
    { title: "Usuarios y accesos", description: "Administra identidad, idioma, compania y estado de acceso.", actionLabel: "Abrir usuarios", action: () => navigate("/administration/users") },
    { title: "Roles y permisos", description: "Controla la matriz de permisos por modulo y accion.", actionLabel: "Abrir matriz", action: () => navigate("/administration/roles") },
    { title: "Flujos de autorizacion", description: "Supervisa reglas activas, cola pendiente y cadenas de aprobacion.", actionLabel: "Abrir flujos", action: () => navigate("/administration/authorization-flows") },
  ];

  return (
    <main className="administration-page administration-page-overview">
      <AdministrationHeader
        eyebrow="Administration Control Tower"
        title="Gobierno, seguridad y configuracion central"
        description="Centro de control premium para identidad, autorizaciones, estructuras maestras, idioma y parametros globales de MGAHRCore."
        actions={
          <>
            {canUseDevSeed ? (
              <button
                type="button"
                className="administration-secondary-button"
                onClick={hasSeedLoaded ? handleClearSeed : handleLoadSeed}
                disabled={seedLoading}
              >
                {seedLoading ? "Procesando..." : hasSeedLoaded ? "Limpiar datos locales" : "Cargar datos de referencia"}
              </button>
            ) : null}
            <Link className="administration-secondary-button" to="/administration/settings">Abrir configuracion</Link>
          </>
        }
        highlights={data.stats}
      />

      <AdministrationStatsCards items={data.stats.slice(0, 4)} />

      <section className="administration-grid administration-overview-grid">
        <div className="administration-side-stack">
          <AdministrationSectionCard
            className="administration-panel-overview-actions"
            title="Quick control actions"
            description="Accesos ejecutivos para los frentes que gobiernan el sistema completo."
          >
            <AdministrationQuickActions items={quickActions} />
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-overview-flows"
            title="Flujos de autorizacion activos"
            description="Flujos transversales que gobiernan vacaciones, permisos, cambios sensibles y accesos administrativos."
            actions={<Link className="administration-secondary-button" to="/administration/authorization-flows">Ver todos</Link>}
          >
            <div className="administration-flow-overview-grid">
              {data.approvalFlows.map((flow) => (
                <ApprovalFlowCard
                  key={flow.id}
                  flow={flow}
                  roles={data.roles}
                  queue={data.approvalQueue}
                />
              ))}
            </div>
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-overview-ecosystem"
            title="Intermodule governance"
            description="Administration gobierna el comportamiento visible de Recruitment y Employees desde reglas, estructuras y configuracion."
          >
            <div className="administration-mini-grid">
              <article className="administration-list-item">
                <span>Recruitment</span>
                <strong>{data.recruitmentDashboard.jobRequests.length} requisiciones activas</strong>
                <p className="administration-muted">Flujos de aprobacion y estructuras impactan solicitudes, posiciones y filtros del pipeline.</p>
              </article>
              <article className="administration-list-item">
                <span>Employees</span>
                <strong>{data.employeesDashboard.employees.length} colaboradores visibles</strong>
                <p className="administration-muted">Companias, departamentos, localizaciones y aprobaciones nacen desde Administration.</p>
              </article>
            </div>
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-overview-audit"
            title="Trazabilidad administrativa"
            description="Registro visible de acciones criticas para reforzar seguridad, control y auditoria."
          >
            <AdminAuditFeed items={data.auditFeed} />
          </AdministrationSectionCard>
        </div>

        <div className="administration-side-stack">
          <LanguageSettingsCard language={language} onChange={updateLanguage} />

          <AdministrationSectionCard
            className="administration-panel-overview-queue"
            title="Solicitudes pendientes por aprobar"
            description="Cola ejecutiva de decisiones sensibles bajo control administrativo."
          >
            <ApprovalRulesTable items={data.approvalQueue} />
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-overview-health"
            title="System health"
            description="Lectura rapida de la salud del gobierno, identidad y configuracion."
          >
            <AdminHealthPanel items={data.healthChecks} />
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-overview-context"
            title="Contexto maestro"
            description="Resumen de la base estructural que sostiene el ecosistema."
          >
            <div className="administration-list">
              <article className="administration-list-item">
                <span>Companias</span>
                <strong>{data.organizations.companies.length}</strong>
              </article>
              <article className="administration-list-item">
                <span>Departamentos</span>
                <strong>{data.organizations.departments.length}</strong>
              </article>
              <article className="administration-list-item">
                <span>Localizaciones</span>
                <strong>{data.organizations.locations.length}</strong>
              </article>
              <article className="administration-list-item">
                <span>Entidades base</span>
                <strong>{data.organizations.entities.length}</strong>
              </article>
            </div>
          </AdministrationSectionCard>
        </div>
      </section>

      <ModuleConnectionsPanel moduleKey="administration" language={language} />
    </main>
  );
}
