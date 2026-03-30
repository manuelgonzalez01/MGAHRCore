import "../administration.css";
import { useMemo, useState } from "react";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import CompaniesTable from "../components/CompaniesTable";
import useOrganizations from "../hooks/useOrganizations";
import { getCountryLabel, getCountryOptions, resolveCountryCode } from "../utils/country.options";
import { getCurrencyOptions } from "../utils/currency.options";
import { companySchema, validateCompanyForm } from "../schemas/organization.schema";

const INDUSTRY_OPTIONS = [
  "Tecnologia",
  "Servicios financieros",
  "Manufactura",
  "Retail",
  "Salud",
  "Educacion",
  "Logistica",
  "Servicios compartidos",
  "Consultoria",
  "Otro",
];

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
];

const STRUCTURE_OPTIONS = [
  { value: "principal", label: "Principal" },
  { value: "filial", label: "Filial" },
  { value: "subsidiaria", label: "Subsidiaria" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "draft", label: "En configuracion" },
  { value: "inactive", label: "Inactiva" },
];

function buildCompanyForm(company) {
  if (!company) {
    return companySchema;
  }

  return {
    id: company.id,
    legalName: company.legalName || company.name || "",
    tradeName: company.tradeName || "",
    taxId: company.taxId || "",
    countryCode: company.countryCode || resolveCountryCode(company.country, "es"),
    country: company.country || "",
    industry: company.industry || "",
    status: company.status || "active",
    corporateEmail: company.corporateEmail || "",
    mainPhone: company.mainPhone || "",
    website: company.website || "",
    taxAddress: company.taxAddress || "",
    cityProvince: company.cityProvince || "",
    estimatedEmployees: String(company.estimatedEmployees ?? company.workforce ?? ""),
    defaultLanguage: company.defaultLanguage || "es",
    baseCurrency: company.baseCurrency || "BOB",
    operationsStartDate: company.operationsStartDate || "",
    structureType: company.structureType || "principal",
  };
}

export default function CompaniesPage() {
  const { companies, saveItem, deleteItem } = useOrganizations();
  const [form, setForm] = useState(companySchema);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const countryOptions = getCountryOptions("es");
  const currencyOptions = getCurrencyOptions();

  const workforceTotal = useMemo(
    () => companies.reduce((sum, item) => sum + Number(item.estimatedEmployees ?? item.workforce ?? 0), 0),
    [companies],
  );

  function resetForm() {
    setForm(companySchema);
    setErrors({});
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateCompanyForm(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setFeedback("Revisa los campos obligatorios para completar el alta corporativa.");
      return;
    }

    const payload = {
      ...form,
      name: form.tradeName || form.legalName,
      country: getCountryLabel(form.countryCode, "es"),
      estimatedEmployees: Number(form.estimatedEmployees) || 0,
      workforce: Number(form.estimatedEmployees) || 0,
    };

    const result = await saveItem("companies", payload);
    setFeedback(
      result?.ok
        ? (form.id ? "Compania actualizada correctamente." : "Compania registrada correctamente.")
        : result?.error || "No fue posible guardar la compania.",
    );

    if (result?.ok) {
      resetForm();
    }
  }

  return (
    <main className="administration-page administration-page-registry">
      <AdministrationHeader
        eyebrow="Corporate Registry"
        title="Companias y entidades corporativas"
        description="Registro corporativo inicial para entidades legales, filiales y estructuras operativas que sostienen MGAHRCore."
        highlights={[
          { label: "Companias", value: companies.length, trend: "entidades registradas" },
          { label: "Empleados estimados", value: workforceTotal, trend: "capacidad organizacional" },
          { label: "Activas", value: companies.filter((item) => item.status === "active").length, trend: "entidades operativas" },
        ]}
      />

      <section className="administration-grid administration-registry-workspace">
        <AdministrationSectionCard
          className="administration-panel-registry-portfolio"
          title="Portafolio corporativo"
          description="Vista ejecutiva de las companias registradas, su identidad fiscal y configuracion operativa."
        >
          {feedback ? (
            <p className={`administration-feedback ${Object.keys(errors).length ? "administration-feedback-error" : "administration-feedback-info"}`}>
              {feedback}
            </p>
          ) : null}
          <CompaniesTable
            items={companies}
            onEdit={(item) => {
              setForm(buildCompanyForm(item));
              setErrors({});
              setFeedback("Modo edicion activado para la entidad seleccionada.");
            }}
            onDelete={async (id) => {
              const result = await deleteItem("companies", id);
              setFeedback(result?.ok ? "Compania eliminada correctamente." : result?.error || "No fue posible eliminar la compania.");
            }}
          />
        </AdministrationSectionCard>

        <AdministrationSectionCard
          className="administration-panel-registry-form"
          title={form.id ? "Actualizar registro corporativo" : "Alta de nueva compania"}
          description="Configuracion base de nueva compania con identidad legal, datos operativos y parametros iniciales del ecosistema."
          actions={form.id ? (
            <button className="administration-secondary-button" type="button" onClick={resetForm}>
              Nueva compania
            </button>
          ) : null}
        >
          <form className="administration-company-form" onSubmit={handleSubmit}>
            <section className="administration-form-block">
              <header className="administration-form-block-head">
                <div>
                  <h3>Informacion corporativa</h3>
                  <p className="administration-muted">Define la identidad legal y administrativa de la compania dentro del sistema.</p>
                </div>
              </header>
              <div className="administration-form-grid administration-form-grid-wide">
                <div className="administration-field administration-field-span">
                  <label>Nombre legal de la compania</label>
                  <input
                    placeholder="Ejemplo: MGAHRCore Holding S.A."
                    value={form.legalName}
                    onChange={(event) => updateField("legalName", event.target.value)}
                  />
                  {errors.legalName ? <small className="administration-field-error">{errors.legalName}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Nombre comercial</label>
                  <input
                    placeholder="Ejemplo: MGAHRCore"
                    value={form.tradeName}
                    onChange={(event) => updateField("tradeName", event.target.value)}
                  />
                </div>
                <div className="administration-field">
                  <label>Identificacion fiscal / Tax ID</label>
                  <input
                    placeholder="Ejemplo: NIT, RNC o Tax ID"
                    value={form.taxId}
                    onChange={(event) => updateField("taxId", event.target.value)}
                  />
                  {errors.taxId ? <small className="administration-field-error">{errors.taxId}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Pais</label>
                  <select value={form.countryCode} onChange={(event) => updateField("countryCode", event.target.value)}>
                    <option value="">Selecciona pais</option>
                    {countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>{country.label}</option>
                    ))}
                  </select>
                  {errors.countryCode ? <small className="administration-field-error">{errors.countryCode}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Sector / industria</label>
                  <select value={form.industry} onChange={(event) => updateField("industry", event.target.value)}>
                    <option value="">Selecciona industria</option>
                    {INDUSTRY_OPTIONS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="administration-field">
                  <label>Estado de la compania</label>
                  <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="administration-form-block">
              <header className="administration-form-block-head">
                <div>
                  <h3>Informacion operativa</h3>
                  <p className="administration-muted">Datos corporativos que utilizaran RRHH, administracion y futuras integraciones.</p>
                </div>
              </header>
              <div className="administration-form-grid administration-form-grid-wide">
                <div className="administration-field">
                  <label>Correo corporativo</label>
                  <input
                    placeholder="contacto@compania.com"
                    value={form.corporateEmail}
                    onChange={(event) => updateField("corporateEmail", event.target.value)}
                  />
                  {errors.corporateEmail ? <small className="administration-field-error">{errors.corporateEmail}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Telefono principal</label>
                  <input
                    placeholder="+591 2 2000000"
                    value={form.mainPhone}
                    onChange={(event) => updateField("mainPhone", event.target.value)}
                  />
                </div>
                <div className="administration-field">
                  <label>Sitio web</label>
                  <input
                    placeholder="https://www.compania.com"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                  />
                </div>
                <div className="administration-field administration-field-span">
                  <label>Direccion fiscal</label>
                  <textarea
                    placeholder="Direccion legal o fiscal registrada por la compania"
                    value={form.taxAddress}
                    onChange={(event) => updateField("taxAddress", event.target.value)}
                  />
                </div>
                <div className="administration-field">
                  <label>Ciudad / provincia</label>
                  <input
                    placeholder="Ejemplo: La Paz"
                    value={form.cityProvince}
                    onChange={(event) => updateField("cityProvince", event.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="administration-form-block">
              <header className="administration-form-block-head">
                <div>
                  <h3>Configuracion inicial</h3>
                  <p className="administration-muted">Parametros de arranque para idioma, moneda y dimension operativa de la entidad.</p>
                </div>
              </header>
              <div className="administration-form-grid administration-form-grid-wide">
                <div className="administration-field">
                  <label>Tamano de empresa / empleados estimados</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ejemplo: 250"
                    value={form.estimatedEmployees}
                    onChange={(event) => updateField("estimatedEmployees", event.target.value)}
                  />
                  {errors.estimatedEmployees ? <small className="administration-field-error">{errors.estimatedEmployees}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Idioma predeterminado</label>
                  <select value={form.defaultLanguage} onChange={(event) => updateField("defaultLanguage", event.target.value)}>
                    {LANGUAGE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  {errors.defaultLanguage ? <small className="administration-field-error">{errors.defaultLanguage}</small> : null}
                </div>
                <div className="administration-field">
                  <label>Moneda base</label>
                  <select value={form.baseCurrency} onChange={(event) => updateField("baseCurrency", event.target.value)}>
                    {currencyOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div className="administration-field">
                  <label>Fecha de inicio de operaciones</label>
                  <input
                    type="date"
                    value={form.operationsStartDate}
                    onChange={(event) => updateField("operationsStartDate", event.target.value)}
                  />
                </div>
                <div className="administration-field">
                  <label>Tipo de estructura</label>
                  <select value={form.structureType} onChange={(event) => updateField("structureType", event.target.value)}>
                    {STRUCTURE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="administration-form-actions">
              <button className="administration-primary-button" type="submit">
                {form.id ? "Actualizar compania" : "Registrar compania"}
              </button>
              <button className="administration-secondary-button" type="button" onClick={resetForm}>
                Limpiar formulario
              </button>
            </div>
          </form>
        </AdministrationSectionCard>
      </section>
    </main>
  );
}
