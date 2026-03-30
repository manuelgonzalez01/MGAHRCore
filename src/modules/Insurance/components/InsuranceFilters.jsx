import useInsuranceLocale from "../hooks/useInsuranceLocale";

export default function InsuranceFilters({ filters, options, onChange, onReset }) {
  const { t } = useInsuranceLocale();

  return (
    <section className="suite-card insurance-filters">
      <div className="insurance-filters-grid">
        <label>
          <span>{t("Compania", "Company")}</span>
          <select value={filters.companyId} onChange={(event) => onChange("companyId", event.target.value)}>
            {options.companies.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Plan", "Plan")}</span>
          <select value={filters.planId} onChange={(event) => onChange("planId", event.target.value)}>
            {options.plans.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Estado", "Status")}</span>
          <select value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
            {options.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Proveedor", "Provider")}</span>
          <select value={filters.provider} onChange={(event) => onChange("provider", event.target.value)}>
            {options.providers.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Tipo de colaborador", "Employee type")}</span>
          <select value={filters.employeeType} onChange={(event) => onChange("employeeType", event.target.value)}>
            {options.employeeTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="insurance-filters-search">
          <span>{t("Buscar", "Search")}</span>
          <input value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder={t("Empleado, plan o proveedor", "Employee, plan, or provider")} />
        </label>
      </div>
      <div className="suite-inline-actions">
        <button className="suite-button-secondary" type="button" onClick={onReset}>{t("Limpiar filtros", "Clear filters")}</button>
      </div>
    </section>
  );
}
