import { useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import LocationsTable from "../components/LocationsTable";
import PermissionBadge from "../components/PermissionBadge";
import useOrganizations from "../hooks/useOrganizations";
import { locationSchema, validateLocationForm } from "../schemas/organization.schema";
import { getTimezoneOptions } from "../utils/timezone.options";
import { getActiveTimezone } from "../../../utils/dateTime";
import { getCountryLabel, getCountryOptions, resolveCountryCode } from "../utils/country.options";
import { getCurrencyOptions } from "../utils/currency.options";

const LOCATION_TYPE_OPTIONS = [
  { value: "hq", label: "HQ" },
  { value: "office", label: "Oficina" },
  { value: "remote", label: "Remota" },
  { value: "regional-hub", label: "Hub regional" },
];

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
];

const DATE_FORMAT_OPTIONS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const WORK_WEEK_OPTIONS = [
  { value: "monday-friday", label: "Lunes a viernes" },
  { value: "monday-saturday", label: "Lunes a sabado" },
  { value: "sunday-thursday", label: "Domingo a jueves" },
];

function buildLocationForm(item) {
  if (!item) {
    return {
      ...locationSchema,
      timezone: getActiveTimezone(),
    };
  }

  return {
    id: item.id,
    name: item.name || "",
    companyId: item.companyId || "",
    locationType: item.locationType || "office",
    status: item.status || "active",
    countryCode: item.countryCode || resolveCountryCode(item.country, "es"),
    country: item.country || "",
    regionState: item.regionState || "",
    city: item.city || "",
    fullAddress: item.fullAddress || "",
    postalCode: item.postalCode || "",
    timezone: item.timezone || getActiveTimezone(),
    currency: item.currency || "BOB",
    primaryLanguage: item.primaryLanguage || "es",
    dateFormat: item.dateFormat || "DD/MM/YYYY",
    workWeek: item.workWeek || "monday-friday",
    predominantContractType: item.predominantContractType || "",
    laborRegulation: item.laborRegulation || "",
    standardWorkingHours: String(item.standardWorkingHours || "40"),
    holidays: item.holidays || "",
    isPrimaryLocation: Boolean(item.isPrimaryLocation),
    allowsRemoteWork: Boolean(item.allowsRemoteWork),
    affectsPayroll: item.affectsPayroll !== false,
  };
}

export default function LocationsPage() {
  const { locations, companies, saveItem, deleteItem } = useOrganizations();
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [form, setForm] = useState({ ...locationSchema, timezone: getActiveTimezone() });
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const timezoneOptions = getTimezoneOptions([form.timezone, getActiveTimezone()]);
  const countryOptions = getCountryOptions("es");
  const currencyOptions = getCurrencyOptions();

  const items = useMemo(
    () => locations.map((location) => ({
      ...location,
      typeLabel: LOCATION_TYPE_OPTIONS.find((item) => item.value === location.locationType)?.label || "Oficina",
    })),
    [locations],
  );

  const selectedLocation = items.find((item) => item.id === selectedLocationId) || null;
  const countryCount = new Set(items.map((item) => item.countryCode || item.country).filter(Boolean)).size;
  const timezoneCount = new Set(items.map((item) => item.timezone).filter(Boolean)).size;

  const statsItems = [
    {
      key: "total",
      label: "Total localizaciones",
      value: items.length,
      trend: "operacion geografica registrada",
    },
    {
      key: "countries",
      label: "Paises activos",
      value: countryCount,
      trend: "alcance multinacional visible",
    },
    {
      key: "timezones",
      label: "Zonas horarias",
      value: timezoneCount,
      trend: "regionalizacion habilitada",
    },
    {
      key: "hq",
      label: "Sedes principales",
      value: items.filter((item) => item.isPrimaryLocation).length,
      trend: "puntos ancla de la operacion",
    },
  ];

  const quickActions = [
    {
      title: "Nueva sede operativa",
      description: "Configura geografia, regionalizacion y contexto laboral desde una alta ejecutiva.",
      actionLabel: "Crear localizacion",
      action: () => {
        setForm({ ...locationSchema, timezone: getActiveTimezone() });
        setErrors({});
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Revisar cobertura geografica",
      description: `${countryCount} paises y ${timezoneCount} zonas horarias visibles dentro del sistema.`,
      actionLabel: "Ver localizacion",
      action: () => {
        if (selectedLocation) {
          setFeedback(`Mostrando el contexto geografico de ${selectedLocation.name}.`);
        }
      },
    },
    {
      title: "Validar impacto operativo",
      description: "Employees y Recruitment dependen de estas sedes para staffing y operacion regional.",
      actionLabel: "Ver adopcion",
      action: () => {
        if (selectedLocation) {
          setFeedback(`${selectedLocation.name} soporta ${selectedLocation.employeesCount || 0} empleados y ${selectedLocation.recruitmentCount || 0} vacantes.`);
        }
      },
    },
  ];

  function resetForm() {
    setForm({ ...locationSchema, timezone: getActiveTimezone() });
    setErrors({});
  }

  function handleEdit(item) {
    setSelectedLocationId(item.id);
    setForm(buildLocationForm(item));
    setErrors({});
    setIsDrawerOpen(true);
  }

  async function handleDelete(id) {
    const result = await deleteItem("locations", id);
    setFeedback(result?.ok ? "Localizacion eliminada correctamente." : result?.error || "No fue posible eliminar la localizacion.");
    if (result?.ok && selectedLocationId === id) {
      setSelectedLocationId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLocationForm(form, items);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...form,
      country: getCountryLabel(form.countryCode, "es"),
      standardWorkingHours: Number(form.standardWorkingHours) || 40,
    };

    const result = await saveItem("locations", payload);
    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar la localizacion.");
      return;
    }

    setFeedback(form.id ? "Localizacion actualizada correctamente." : "Localizacion creada correctamente.");
    setSelectedLocationId(result.data.id);
    resetForm();
    setIsDrawerOpen(false);
  }

  return (
    <main className="administration-page administration-page-regional">
      <AdministrationHeader
        eyebrow="Global Operations Workspace"
        title="Localizaciones y operacion geografica"
        description="Sistema de sedes, contextos regionales y configuracion multinacional para Employees, Recruitment y futuras operaciones de payroll."
        actions={(
          <div className="administration-inline-actions">
            <button type="button" className="administration-secondary-button" onClick={() => setSelectedLocationId("")}>
              Limpiar seleccion
            </button>
            <button type="button" className="administration-primary-button" onClick={() => { resetForm(); setIsDrawerOpen(true); }}>
              Nueva localizacion
            </button>
          </div>
        )}
        highlights={[
          { label: "Localizaciones", value: items.length, trend: "operacion regional" },
          { label: "Paises", value: countryCount, trend: "cobertura geografica" },
          { label: "Monedas", value: new Set(items.map((item) => item.currency).filter(Boolean)).size, trend: "configuracion financiera" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-role-workspace administration-regional-workspace">
        <div className="administration-role-main">
          <AdministrationSectionCard
            className="administration-panel-regional-map"
            title="Mapa maestro de localizaciones"
            description="Portafolio geográfico con contexto regional, laboral y operativo para el ecosistema."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {items.length ? (
              <LocationsTable
                items={items}
                selectedId={selectedLocation?.id}
                onSelect={(item) => setSelectedLocationId(item.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <AdministrationEmptyState title="Sin localizaciones registradas" description="Crea la primera localizacion para habilitar operacion geografica y configuracion regional." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-role-side">
          <AdministrationSectionCard
            className="administration-panel-regional-summary"
            title="Lectura ejecutiva de la localizacion"
            description="Resumen regional, laboral y operativo de la sede seleccionada."
          >
            {selectedLocation ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Regional governance</span>
                    <h3>{selectedLocation.name}</h3>
                    <p className="administration-muted">
                      {selectedLocation.country} · {selectedLocation.city} · {selectedLocation.typeLabel}
                    </p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedLocation.status} />
                    <span className="administration-badge info">{selectedLocation.currency}</span>
                    <span className="administration-badge neutral">{selectedLocation.primaryLanguage?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Timezone</span>
                    <strong>{selectedLocation.timezone}</strong>
                    <p className="administration-muted">{selectedLocation.dateFormat} · {selectedLocation.workWeek}</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Direccion</span>
                    <strong>{selectedLocation.regionState || "Sin region"}</strong>
                    <p className="administration-muted">{selectedLocation.fullAddress || "Sin direccion"} {selectedLocation.postalCode ? `· ${selectedLocation.postalCode}` : ""}</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Empleados</span>
                    <strong>{selectedLocation.employeesCount || 0}</strong>
                    <p className="administration-muted">Colaboradores asignados a esta localizacion.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Vacantes</span>
                    <strong>{selectedLocation.recruitmentCount || 0}</strong>
                    <p className="administration-muted">Solicitudes abiertas o visibles para esta sede.</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Contexto laboral y legal</span>
                  <strong>{selectedLocation.predominantContractType || "Sin contrato predominante"}</strong>
                  <p className="administration-muted">
                    {selectedLocation.laborRegulation || "Sin regulacion laboral definida"} · {selectedLocation.standardWorkingHours || 40} horas estandar
                  </p>
                </article>

                <article className="administration-list-item">
                  <span>Configuracion operativa</span>
                  <div className="administration-position-usage-badges">
                    {selectedLocation.isPrimaryLocation ? <span className="administration-badge critical">Localizacion principal</span> : null}
                    {selectedLocation.allowsRemoteWork ? <span className="administration-badge info">Remote enabled</span> : null}
                    {selectedLocation.affectsPayroll ? <span className="administration-badge warning">Impacta payroll</span> : null}
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={() => handleEdit(selectedLocation)}>
                    Editar localizacion
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Selecciona una localizacion" description="Aqui veras contexto geografico, monetario y laboral de la sede." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-regional" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Location Design Studio</span>
                <h2>{form.id ? "Actualizar localizacion global" : "Diseñar nueva localizacion"}</h2>
                <p className="administration-muted">
                  Configura la operacion geografica, regional y laboral de una sede desde una experiencia premium.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-regional" onSubmit={handleSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Global operations</span>
                  <strong>{form.id ? "Ajuste de sede" : "Nueva localizacion corporativa"}</strong>
                  <p className="administration-muted">Configura territorio, contexto regional y operacion laboral para una sede del ecosistema.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Contexto regional</span>
                  <strong>{getCountryLabel(form.countryCode, "es") || "Pais pendiente"} · {form.timezone || getActiveTimezone()}</strong>
                  <p className="administration-muted">{form.currency} · {form.primaryLanguage?.toUpperCase()} · {form.workWeek || "monday-friday"}</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Operacion</span>
                    <strong>{form.isPrimaryLocation ? "Sede principal" : "Sede operativa"}</strong>
                    <p className="administration-muted">{form.allowsRemoteWork ? "Remote enabled" : "Trabajo presencial"} · {form.affectsPayroll ? "Impacta payroll" : "Sin payroll"}</p>
                  </article>
                </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion basica</h3>
                    <p className="administration-muted">Identidad y clasificacion primaria de la localizacion.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre de la localizacion</label>
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ejemplo: Santo Domingo HQ" />
                    {errors.name ? <span className="administration-field-error">{errors.name}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Empresa</label>
                    <select value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))}>
                      <option value="">Selecciona empresa</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.tradeName || company.name}</option>)}
                    </select>
                    {errors.companyId ? <span className="administration-field-error">{errors.companyId}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Tipo de localizacion</label>
                    <select value={form.locationType} onChange={(event) => setForm((current) => ({ ...current, locationType: event.target.value }))}>
                      {LOCATION_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Estado</label>
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion geografica</h3>
                    <p className="administration-muted">Ubicacion fisica y datos territoriales de la sede.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Pais</label>
                    <select value={form.countryCode} onChange={(event) => setForm((current) => ({ ...current, countryCode: event.target.value }))}>
                      <option value="">Selecciona pais</option>
                      {countryOptions.map((country) => <option key={country.code} value={country.code}>{country.label}</option>)}
                    </select>
                    {errors.countryCode ? <span className="administration-field-error">{errors.countryCode}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Region / Estado</label>
                    <input value={form.regionState} onChange={(event) => setForm((current) => ({ ...current, regionState: event.target.value }))} placeholder="Ejemplo: Distrito Nacional" />
                  </div>
                  <div className="administration-field">
                    <label>Ciudad</label>
                    <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Ejemplo: Santo Domingo" />
                    {errors.city ? <span className="administration-field-error">{errors.city}</span> : null}
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Direccion completa</label>
                    <textarea value={form.fullAddress} onChange={(event) => setForm((current) => ({ ...current, fullAddress: event.target.value }))} rows={3} placeholder="Direccion completa de la sede" />
                  </div>
                  <div className="administration-field">
                    <label>Codigo postal</label>
                    <input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} placeholder="Ejemplo: 10101" />
                  </div>
                </div>
              </section>
              </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion regional</h3>
                    <p className="administration-muted">Parametros locales para idioma, tiempo, moneda y calendario.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Zona horaria</label>
                    <select value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}>
                      {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {errors.timezone ? <span className="administration-field-error">{errors.timezone}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Moneda</label>
                    <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
                      {currencyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Idioma principal</label>
                    <select value={form.primaryLanguage} onChange={(event) => setForm((current) => ({ ...current, primaryLanguage: event.target.value }))}>
                      {LANGUAGE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Formato de fecha</label>
                    <select value={form.dateFormat} onChange={(event) => setForm((current) => ({ ...current, dateFormat: event.target.value }))}>
                      {DATE_FORMAT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Semana laboral</label>
                    <select value={form.workWeek} onChange={(event) => setForm((current) => ({ ...current, workWeek: event.target.value }))}>
                      {WORK_WEEK_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Contexto laboral y legal</h3>
                    <p className="administration-muted">Parametros contractuales y regulatorios de la sede.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Tipo de contrato predominante</label>
                    <input value={form.predominantContractType} onChange={(event) => setForm((current) => ({ ...current, predominantContractType: event.target.value }))} placeholder="Ejemplo: Indefinido" />
                  </div>
                  <div className="administration-field">
                    <label>Regulacion laboral</label>
                    <input value={form.laborRegulation} onChange={(event) => setForm((current) => ({ ...current, laborRegulation: event.target.value }))} placeholder="Ejemplo: Codigo de Trabajo local" />
                  </div>
                  <div className="administration-field">
                    <label>Horas laborales estandar</label>
                    <input type="number" value={form.standardWorkingHours} onChange={(event) => setForm((current) => ({ ...current, standardWorkingHours: event.target.value }))} placeholder="Ejemplo: 40" />
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Dias festivos</label>
                    <textarea value={form.holidays} onChange={(event) => setForm((current) => ({ ...current, holidays: event.target.value }))} rows={3} placeholder="Referencia de calendario o resumen de feriados relevantes" />
                  </div>
                </div>
              </section>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion operativa</h3>
                    <p className="administration-muted">Define el peso operativo y alcance funcional de la sede.</p>
                  </div>
                </header>
                <div className="administration-preview-grid">
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.isPrimaryLocation} onChange={(event) => setForm((current) => ({ ...current, isPrimaryLocation: event.target.checked }))} />
                    <span>Localizacion principal</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.allowsRemoteWork} onChange={(event) => setForm((current) => ({ ...current, allowsRemoteWork: event.target.checked }))} />
                    <span>Permite trabajo remoto</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.affectsPayroll} onChange={(event) => setForm((current) => ({ ...current, affectsPayroll: event.target.checked }))} />
                    <span>Impacta payroll</span>
                  </label>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar localizacion" : "Guardar localizacion"}
                </button>
                <button className="administration-secondary-button" type="button" onClick={resetForm}>
                  Limpiar
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
