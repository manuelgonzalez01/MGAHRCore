import { getReportFilterFields } from "../schemas/reportsFilters.schema";
import useReportsLocale from "../hooks/useReportsLocale";

const optionsMap = {
  companyId: "companies",
  locationId: "locations",
  departmentId: "departments",
  positionId: "positions",
  levelId: "levels",
  period: "periods",
  status: "statuses",
  employeeType: "employeeTypes",
  module: "modules",
};

export default function ReportsFilters({
  filters,
  options,
  onChange,
  onReset,
  visibleFields,
}) {
  const { language, t } = useReportsLocale();
  const fields = getReportFilterFields(language);
  const activeFields = visibleFields || fields.map((field) => field.key);

  return (
    <section className="reports-filter-panel">
      <div className="reports-card__head">
        <div>
          <h2>{t("Filtros transversales", "Cross-report filters")}</h2>
          <p className="reports-muted">{t("Mismo lenguaje de filtrado para toda la capa analitica.", "One consistent filtering layer across the whole analytics subsystem.")}</p>
        </div>
        <div className="reports-filter-panel__actions">
          <button type="button" className="reports-button--secondary" onClick={onReset}>{t("Restablecer", "Reset")}</button>
        </div>
      </div>
      <div className="reports-filter-grid">
        {fields.filter((field) => activeFields.includes(field.key)).map((field) => (
          <label key={field.key}>
            {field.label}
            <select value={filters[field.key] || ""} onChange={(event) => onChange(field.key, event.target.value)}>
              {(options[optionsMap[field.key]] || []).map((option) => (
                <option key={`${field.key}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
