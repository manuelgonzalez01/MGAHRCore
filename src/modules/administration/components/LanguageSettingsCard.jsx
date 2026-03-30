import { getActiveTimezone } from "../../../utils/dateTime";

export default function LanguageSettingsCard({ language, onChange, settings, companies = [] }) {
  const activeLanguage = language || settings?.language || "es";

  return (
    <div className="administration-panel administration-localization-card">
      <div className="administration-language-head">
        <div>
          <h3>Localizacion global</h3>
          <p className="administration-muted">Controla el idioma activo, la huella regional y el alcance multiempresa de la plataforma.</p>
        </div>
      </div>

      <div className="administration-preview-grid">
        <article className="administration-list-item">
          <span>Idioma activo</span>
          <strong>{activeLanguage === "es" ? "Espanol" : "English"}</strong>
          <p className="administration-muted">Sincronizado con el provider global.</p>
        </article>
        <article className="administration-list-item">
          <span>Timezone efectiva</span>
          <strong>{settings?.timezone || getActiveTimezone()}</strong>
          <p className="administration-muted">Regionalizacion central del sistema.</p>
        </article>
        <article className="administration-list-item">
          <span>Moneda base</span>
          <strong>{settings?.baseCurrency || "BOB"}</strong>
          <p className="administration-muted">Base financiera para vistas intermodulares.</p>
        </article>
        <article className="administration-list-item">
          <span>Empresas gobernadas</span>
          <strong>{companies.length}</strong>
          <p className="administration-muted">{settings?.companyScope === "company" ? "Configuracion por compania activa." : "Gobierno global compartido."}</p>
        </article>
      </div>

      <div className="administration-field">
        <label>Idioma activo</label>
        <select value={activeLanguage} onChange={(event) => onChange(event.target.value)}>
          <option value="es">Espanol</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
