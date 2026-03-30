import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeesFilters({ filters, updateFilter, employees }) {
  const copy = useEmployeesCopy();
  const departments = [...new Set(employees.map((item) => item.department).filter(Boolean))];
  const locations = [...new Set(employees.map((item) => item.location).filter(Boolean))];
  const companies = [...new Set(employees.map((item) => item.company).filter(Boolean))];

  return (
    <div className="employees-filter-grid employees-filter-grid--premium">
      <div className="employees-field">
        <label>{copy.filters.search}</label>
        <input value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} placeholder={copy.filters.searchPlaceholder} />
      </div>
      <div className="employees-field">
        <label>{copy.filters.company}</label>
        <select value={filters.company || "all"} onChange={(event) => updateFilter("company", event.target.value)}>
          <option value="all">{copy.filters.allPlural}</option>
          {companies.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="employees-field">
        <label>{copy.filters.area}</label>
        <select value={filters.department} onChange={(event) => updateFilter("department", event.target.value)}>
          <option value="all">{copy.filters.allPlural}</option>
          {departments.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="employees-field">
        <label>{copy.filters.status}</label>
        <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="all">{copy.filters.allStates}</option>
          <option value="active">{copy.status.active}</option>
          <option value="leave">{copy.status.leave}</option>
          <option value="inactive">{copy.status.inactive}</option>
        </select>
      </div>
      <div className="employees-field">
        <label>{copy.filters.location}</label>
        <select value={filters.location} onChange={(event) => updateFilter("location", event.target.value)}>
          <option value="all">{copy.filters.allPlural}</option>
          {locations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
