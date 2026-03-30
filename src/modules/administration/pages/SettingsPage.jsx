import { useMemo, useState } from "react";
import "../administration.css";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import AdminAuditFeed from "../components/AdminAuditFeed";
import AdminHealthPanel from "../components/AdminHealthPanel";
import LanguageSettingsCard from "../components/LanguageSettingsCard";
import SystemPreferencesPanel from "../components/SystemPreferencesPanel";
import useLanguageSettings from "../hooks/useLanguageSettings";
import useOrganizations from "../hooks/useOrganizations";
import useSystemSettings from "../hooks/useSystemSettings";
import { getActiveTimezone } from "../../../utils/dateTime";

export default function SettingsPage() {
  const { language, updateLanguage } = useLanguageSettings();
  const { companies } = useOrganizations();
  const { settings, auditFeed, healthChecks, loading, saveSettings, refresh } = useSystemSettings();
  const [feedback, setFeedback] = useState("");

  const activeFlags = useMemo(
    () => (settings?.featureFlags || []).filter((flag) => flag.enabled).length,
    [settings],
  );
  const criticalControls = useMemo(() => {
    if (!settings) {
      return 0;
    }

    return [
      settings.maintenanceModeScope !== "off",
      settings.readOnlyMode,
      settings.security.passwordPolicy === "strict",
      (settings.featureFlags || []).some((flag) => flag.critical && flag.enabled),
    ].filter(Boolean).length;
  }, [settings]);

  async function handleGlobalSave(payload) {
    await saveSettings({ ...payload, updatedBy: "Platform Administrator" });
    setFeedback("Centro de control actualizado correctamente.");
  }

  async function handleLanguageChange(nextLanguage) {
    await updateLanguage(nextLanguage);
    setFeedback(`Idioma global actualizado a ${nextLanguage === "es" ? "Espanol" : "English"}.`);
    refresh();
  }

  if (loading || !settings) {
    return (
      <main className="administration-page">
        <AdministrationEmptyState title="Cargando centro de control" description="Estamos preparando localizacion, flags, seguridad y operacion global." />
      </main>
    );
  }

  const statsItems = [
    { key: "state", label: "Estado del sistema", value: settings.maintenanceModeScope === "off" ? "Operativo" : settings.maintenanceModeScope === "partial" ? "Parcial" : "Mantenimiento", trend: "runtime corporativo" },
    { key: "flags", label: "Flags activos", value: activeFlags, trend: "features bajo control" },
    { key: "critical", label: "Controles criticos", value: criticalControls, trend: "gobierno reforzado" },
    { key: "language", label: "Idioma global", value: language.toUpperCase(), trend: "provider sincronizado" },
  ];

  const quickActions = [
    {
      title: "Forzar operacion estable",
      description: "Lleva el sistema a modo operativo con mantenimiento desactivado y lectura completa.",
      actionLabel: "Restaurar operacion",
      action: async () => {
        await handleGlobalSave({
          ...settings,
          maintenanceModeScope: "off",
          maintenanceModules: [],
          readOnlyMode: false,
        });
      },
    },
    {
      title: "Activar gobierno estricto",
      description: "Refuerza seguridad y eleva politica de contrasenas para contexto sensible.",
      actionLabel: "Aplicar seguridad",
      action: async () => {
        await handleGlobalSave({
          ...settings,
          security: {
            ...settings.security,
            passwordPolicy: "strict",
            sessionTimeoutMinutes: 20,
          },
        });
      },
    },
    {
      title: "Monitorear trazabilidad",
      description: "Revisa auditoria, cambios recientes y estado de salud del control central.",
      actionLabel: "Actualizar lectura",
      action: () => {
        refresh();
        setFeedback("Se refresco la lectura ejecutiva del centro de control.");
      },
    },
  ];

  return (
    <main className="administration-page administration-page-runtime">
      <AdministrationHeader
        eyebrow="Global Control Center"
        title="Configuracion global y localizacion"
        description="Centro de control premium para localizacion, feature flags, seguridad, operacion y auditoria del comportamiento completo de MGAHRCore."
        highlights={[
          { label: "Idioma", value: language.toUpperCase(), trend: "localizacion activa" },
          { label: "Timezone", value: settings.timezone || getActiveTimezone(), trend: "regionalizacion real" },
          { label: "Flags", value: activeFlags, trend: "features activas" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-user-workspace administration-runtime-workspace">
        <div className="administration-user-main">
          <AdministrationSectionCard
            className="administration-panel-runtime-actions"
            title="Quick governance actions"
            description="Acciones ejecutivas para estabilizar operacion, seguridad y visibilidad del control central."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-runtime-controls"
            title="Configuracion operativa y regional"
            description="Controla localizacion, feature flags, seguridad, operacion y overrides por empresa desde un unico workspace."
          >
            <SystemPreferencesPanel settings={settings} companies={companies} onSave={handleGlobalSave} />
          </AdministrationSectionCard>
        </div>

        <aside className="administration-user-side">
          <AdministrationSectionCard
            className="administration-panel-runtime-health"
            title="Estado de gobierno"
            description="Lectura inmediata de salud operacional, localizacion y seguridad activa."
          >
            <AdminHealthPanel items={healthChecks} />
          </AdministrationSectionCard>

          <LanguageSettingsCard language={language} onChange={handleLanguageChange} settings={settings} companies={companies} />

          <AdministrationSectionCard
            className="administration-panel-runtime-audit"
            title="Auditoria de configuracion"
            description="Historial de cambios sobre localizacion, runtime, seguridad y feature flags."
          >
            <AdminAuditFeed items={auditFeed.slice(0, 8)} />
          </AdministrationSectionCard>
        </aside>
      </section>
    </main>
  );
}
