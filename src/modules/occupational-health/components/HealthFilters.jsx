export default function HealthFilters({ options, filters = {}, onChange = () => {}, onReset = () => {}, t }) {
  return (
    <section className="suite-card">
      <div className="suite-head">
        <div>
          <h2>{t("Filtros de salud", "Health filters")}</h2>
          <p className="suite-muted">{t("Refina por colaborador, compania, departamento y estado.", "Filter by employee, company, department, and status.")}</p>
        </div>
        <button className="suite-button-secondary" type="button" onClick={onReset}>{t("Limpiar", "Reset")}</button>
      </div>
      <div className="health-filter-grid">
        {[
          ["employeeId", t("Colaborador", "Employee"), options.employees],
          ["companyId", t("Compania", "Company"), options.companies],
          ["departmentId", t("Departamento", "Department"), options.departments],
          ["status", t("Estado", "Status"), options.statuses],
        ].map(([key, label, items]) => (
          <label key={key}>
            <span>{label}</span>
            <select value={filters[key] || ""} onChange={(event) => onChange(key, event.target.value)}>
              {items.map((item) => <option key={`${key}-${item.value}`} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
