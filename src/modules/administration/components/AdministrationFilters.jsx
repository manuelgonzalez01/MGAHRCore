export default function AdministrationFilters({ filters, onChange, companies = [] }) {
  return (
    <div className="administration-filter-grid">
      <div className="administration-field">
        <label>Buscar</label>
        <input value={filters.query} onChange={(event) => onChange("query", event.target.value)} placeholder="Nombre, correo o rol" />
      </div>
      <div className="administration-field">
        <label>Compania</label>
        <select value={filters.company} onChange={(event) => onChange("company", event.target.value)}>
          <option value="all">Todas</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>
      <div className="administration-field">
        <label>Estado</label>
        <select value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>
  );
}
