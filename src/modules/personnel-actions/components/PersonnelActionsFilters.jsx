export default function PersonnelActionsFilters({ filters, options, onChange, onReset, t }) {
  return (
    <section className="suite-card">
      <div className="suite-head">
        <div>
          <h2>{t("Filtros operativos", "Operational filters")}</h2>
          <p className="suite-muted">{t("Refina por tipo, estado, colaborador, area y periodo.", "Filter by type, status, employee, area, and period.")}</p>
        </div>
        <button className="suite-button-secondary" type="button" onClick={onReset}>{t("Limpiar", "Reset")}</button>
      </div>
      <div className="personnel-filter-grid">
        {[
          ["actionType", t("Tipo", "Type"), options.actionTypes],
          ["status", t("Estado", "Status"), options.statuses],
          ["employeeId", t("Colaborador", "Employee"), options.employees],
          ["departmentId", t("Departamento", "Department"), options.departments],
          ["companyId", t("Compania", "Company"), options.companies],
        ].map(([key, label, items]) => (
          <label key={key}>
            <span>{label}</span>
            <select value={filters[key]} onChange={(event) => onChange(key, event.target.value)}>
              {items.map((item) => <option key={`${key}-${item.value}`} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        ))}
        <label>
          <span>{t("Desde", "From")}</span>
          <input type="date" value={filters.from} onChange={(event) => onChange("from", event.target.value)} />
        </label>
        <label>
          <span>{t("Hasta", "To")}</span>
          <input type="date" value={filters.to} onChange={(event) => onChange("to", event.target.value)} />
        </label>
      </div>
    </section>
  );
}
