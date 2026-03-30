import { useEffect, useMemo, useState } from "react";
import { getActiveTimezone } from "../../../utils/dateTime";
import { getCurrencyOptions } from "../utils/currency.options";
import { getTimezoneOptions } from "../utils/timezone.options";

const MODULE_OPTIONS = ["Recruitment", "Employees", "Vacations", "Administration"];

function buildDraft(settings) {
  return {
    ...settings,
    security: {
      sessionTimeoutMinutes: 30,
      passwordPolicy: "strong",
      failedAttempts: 5,
      userLockoutMinutes: 30,
      ...(settings?.security || {}),
    },
    featureFlags: settings?.featureFlags || [],
    companyOverrides: settings?.companyOverrides || [],
    maintenanceModules: settings?.maintenanceModules || [],
  };
}

export default function SystemPreferencesPanel({ settings, companies = [], onSave }) {
  const [draft, setDraft] = useState(buildDraft(settings));
  const timezoneOptions = getTimezoneOptions([draft?.timezone, getActiveTimezone()]);
  const currencyOptions = getCurrencyOptions();

  useEffect(() => {
    setDraft(buildDraft(settings));
  }, [settings]);

  const activeFlags = useMemo(() => draft.featureFlags.filter((flag) => flag.enabled).length, [draft.featureFlags]);

  function toggleMaintenanceModule(moduleName) {
    setDraft((current) => ({
      ...current,
      maintenanceModules: current.maintenanceModules.includes(moduleName)
        ? current.maintenanceModules.filter((item) => item !== moduleName)
        : [...current.maintenanceModules, moduleName],
    }));
  }

  function updateFeatureFlag(flagId, patch) {
    setDraft((current) => ({
      ...current,
      featureFlags: current.featureFlags.map((flag) => (flag.id === flagId ? { ...flag, ...patch } : flag)),
    }));
  }

  function updateCompanyOverride(companyId, patch) {
    setDraft((current) => ({
      ...current,
      companyOverrides: current.companyOverrides.map((item) => (item.companyId === companyId ? { ...item, ...patch } : item)),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave?.({
      ...draft,
      maintenanceMode: draft.maintenanceModeScope !== "off",
    });
  }

  return (
    <form className="administration-settings-control" onSubmit={handleSubmit}>
      <section className="administration-form-block">
        <header className="administration-form-block-head">
          <div>
            <h3>Localizacion</h3>
            <p className="administration-muted">Idioma, timezone, formatos regionales y base financiera global del sistema.</p>
          </div>
        </header>
        <div className="administration-form-grid administration-form-grid-wide">
          <div className="administration-field">
            <label>Zona horaria por defecto</label>
            <select value={draft.timezone || getActiveTimezone()} onChange={(event) => setDraft((current) => ({ ...current, timezone: event.target.value }))}>
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="administration-field">
            <label>Formato de fecha</label>
            <select value={draft.dateFormat} onChange={(event) => setDraft((current) => ({ ...current, dateFormat: event.target.value }))}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="administration-field">
            <label>Formato de hora</label>
            <select value={draft.timeFormat} onChange={(event) => setDraft((current) => ({ ...current, timeFormat: event.target.value }))}>
              <option value="24h">24 horas</option>
              <option value="12h">12 horas</option>
            </select>
          </div>
          <div className="administration-field">
            <label>Moneda base</label>
            <select value={draft.baseCurrency} onChange={(event) => setDraft((current) => ({ ...current, baseCurrency: event.target.value }))}>
              {currencyOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="administration-field">
            <label>Digest de notificaciones</label>
            <select value={draft.notificationsDigest} onChange={(event) => setDraft((current) => ({ ...current, notificationsDigest: event.target.value }))}>
              <option value="instant">Instantaneo</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <div className="administration-field">
            <label>Gobierno multiempresa</label>
            <select value={draft.companyScope} onChange={(event) => setDraft((current) => ({ ...current, companyScope: event.target.value }))}>
              <option value="global">Global</option>
              <option value="company">Por compania</option>
            </select>
          </div>
        </div>
      </section>

      <section className="administration-form-block">
        <header className="administration-form-block-head">
          <div>
            <h3>Feature flags</h3>
            <p className="administration-muted">{activeFlags} flags activos controlando modulos, capacidades y despliegues por entorno o compania.</p>
          </div>
        </header>
        <div className="administration-list">
          {draft.featureFlags.map((flag) => (
            <article key={flag.id} className="administration-feature-flag-card">
              <div className="administration-health-row">
                <div>
                  <span>{flag.module}</span>
                  <strong>{flag.label}</strong>
                  <p className="administration-muted">{flag.description}</p>
                </div>
                <div className="administration-user-badges">
                  <span className={`administration-badge ${flag.enabled ? "success" : "neutral"}`}>{flag.enabled ? "Activo" : "Inactivo"}</span>
                  {flag.critical ? <span className="administration-badge critical">Critico</span> : null}
                </div>
              </div>
              <div className="administration-preview-grid">
                <div className="administration-field">
                  <label>Estado</label>
                  <select value={flag.enabled ? "true" : "false"} onChange={(event) => updateFeatureFlag(flag.id, { enabled: event.target.value === "true" })}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div className="administration-field">
                  <label>Entorno</label>
                  <select value={flag.environment} onChange={(event) => updateFeatureFlag(flag.id, { environment: event.target.value })}>
                    <option value="all">Todos</option>
                    <option value="dev">Solo dev</option>
                    <option value="prod">Solo prod</option>
                  </select>
                </div>
                <div className="administration-field">
                  <label>Alcance empresarial</label>
                  <select value={flag.companyScope} onChange={(event) => updateFeatureFlag(flag.id, { companyScope: event.target.value })}>
                    <option value="all">Todas las empresas</option>
                    <option value="global">Scope global</option>
                    <option value="company">Por compania</option>
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="administration-form-block">
        <header className="administration-form-block-head">
          <div>
            <h3>Seguridad</h3>
            <p className="administration-muted">Sesiones, politica de contrasenas, intentos fallidos y bloqueo preventivo de usuarios.</p>
          </div>
        </header>
        <div className="administration-form-grid administration-form-grid-wide">
          <div className="administration-field">
            <label>Expiracion de sesion</label>
            <input type="number" value={draft.security.sessionTimeoutMinutes} onChange={(event) => setDraft((current) => ({ ...current, security: { ...current.security, sessionTimeoutMinutes: Number(event.target.value) || 0 } }))} />
          </div>
          <div className="administration-field">
            <label>Politica de contrasenas</label>
            <select value={draft.security.passwordPolicy} onChange={(event) => setDraft((current) => ({ ...current, security: { ...current.security, passwordPolicy: event.target.value } }))}>
              <option value="standard">Standard</option>
              <option value="strong">Strong</option>
              <option value="strict">Strict</option>
            </select>
          </div>
          <div className="administration-field">
            <label>Intentos fallidos</label>
            <input type="number" value={draft.security.failedAttempts} onChange={(event) => setDraft((current) => ({ ...current, security: { ...current.security, failedAttempts: Number(event.target.value) || 0 } }))} />
          </div>
          <div className="administration-field">
            <label>Bloqueo de usuario (min)</label>
            <input type="number" value={draft.security.userLockoutMinutes} onChange={(event) => setDraft((current) => ({ ...current, security: { ...current.security, userLockoutMinutes: Number(event.target.value) || 0 } }))} />
          </div>
        </div>
      </section>

      <section className="administration-form-block">
        <header className="administration-form-block-head">
          <div>
            <h3>Operacion</h3>
            <p className="administration-muted">Modo mantenimiento, solo lectura, logs activos y restriccion parcial por modulo.</p>
          </div>
        </header>
        <div className="administration-form-grid administration-form-grid-wide">
          <div className="administration-field">
            <label>Modo mantenimiento</label>
            <select value={draft.maintenanceModeScope} onChange={(event) => setDraft((current) => ({ ...current, maintenanceModeScope: event.target.value }))}>
              <option value="off">Desactivado</option>
              <option value="partial">Parcial por modulo</option>
              <option value="full">Total</option>
            </select>
          </div>
          <label className="administration-toggle-field">
            <input type="checkbox" checked={draft.readOnlyMode} onChange={(event) => setDraft((current) => ({ ...current, readOnlyMode: event.target.checked }))} />
            <span>Modo solo lectura</span>
          </label>
          <label className="administration-toggle-field">
            <input type="checkbox" checked={draft.logsEnabled} onChange={(event) => setDraft((current) => ({ ...current, logsEnabled: event.target.checked }))} />
            <span>Logs activos</span>
          </label>
        </div>
        {draft.maintenanceModeScope === "partial" ? (
          <div className="administration-position-usage-badges">
            {MODULE_OPTIONS.map((moduleName) => (
              <label key={moduleName} className="administration-toggle-field">
                <input type="checkbox" checked={draft.maintenanceModules.includes(moduleName)} onChange={() => toggleMaintenanceModule(moduleName)} />
                <span>{moduleName}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="administration-form-block">
        <header className="administration-form-block-head">
          <div>
            <h3>Configuracion por empresa</h3>
            <p className="administration-muted">Override regional por compania para escenarios multi-sede y multi-pais.</p>
          </div>
        </header>
        <div className="administration-list">
          {companies.map((company) => {
            const override = draft.companyOverrides.find((item) => item.companyId === company.id);
            return (
              <article key={company.id} className="administration-feature-flag-card">
                <div className="administration-health-row">
                  <div>
                    <span>{company.country || "Sin pais"}</span>
                    <strong>{company.name}</strong>
                    <p className="administration-muted">{company.tradeName || company.legalName || "Entidad corporativa"}</p>
                  </div>
                </div>
                <div className="administration-preview-grid">
                  <div className="administration-field">
                    <label>Idioma</label>
                    <select value={override?.language || ""} onChange={(event) => updateCompanyOverride(company.id, { language: event.target.value })}>
                      <option value="">Heredar global</option>
                      <option value="es">Espanol</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Timezone</label>
                    <select value={override?.timezone || ""} onChange={(event) => updateCompanyOverride(company.id, { timezone: event.target.value })}>
                      <option value="">Heredar global</option>
                      {timezoneOptions.map((option) => (
                        <option key={`${company.id}-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Moneda</label>
                    <select value={override?.baseCurrency || ""} onChange={(event) => updateCompanyOverride(company.id, { baseCurrency: event.target.value })}>
                      <option value="">Heredar global</option>
                      {currencyOptions.map((item) => (
                        <option key={`${company.id}-${item.value}`} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Formato fecha</label>
                    <select value={override?.dateFormat || ""} onChange={(event) => updateCompanyOverride(company.id, { dateFormat: event.target.value })}>
                      <option value="">Heredar global</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="administration-form-actions">
        <button className="administration-primary-button" type="submit">Guardar control global</button>
      </div>
    </form>
  );
}
