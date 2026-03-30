import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

function renderSelect({ id, label, value, options = [], onChange }) {
  return (
    <label className="development-filter">
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={`${id}-${option.value || "all"}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function DevelopmentFilters({
  filters,
  options,
  onChange,
  onReset,
  onExport,
  exportState,
  visibleFields = ["companyId", "departmentId", "positionId", "levelId", "status"],
}) {
  const { t } = useDevelopmentLocale();

  const config = {
    companyId: { label: t("Compania", "Company"), options: options.companies },
    departmentId: { label: t("Departamento", "Department"), options: options.departments },
    positionId: { label: t("Posicion", "Position"), options: options.positions },
    levelId: { label: t("Nivel", "Level"), options: options.levels },
    cycleId: { label: t("Ciclo", "Cycle"), options: options.cycles },
    status: { label: t("Estado", "Status"), options: options.statuses },
    category: { label: t("Categoria", "Category"), options: options.categories },
    readiness: { label: t("Readiness", "Readiness"), options: options.readiness },
  };

  return (
    <section className="development-card">
      <div className="development-card__head">
        <div>
          <h2>{t("Filtros transversales", "Cross-functional filters")}</h2>
          <p className="development-muted">
            {t(
              "Aplica el mismo criterio de lectura para skills, evaluaciones, planes, training y readiness.",
              "Apply the same decision lens across skills, evaluations, plans, training, and readiness.",
            )}
          </p>
        </div>
        <div className="development-inline-actions">
          <button type="button" className="suite-button-secondary" onClick={() => onExport("xlsx")}>
            {t("Exportar", "Export")}
          </button>
          <button type="button" className="suite-button-secondary" onClick={onReset}>
            {t("Reiniciar", "Reset")}
          </button>
        </div>
      </div>

      <div className="development-filters-grid">
        {visibleFields.map((field) => renderSelect({
          id: field,
          label: config[field].label,
          value: filters[field] || "",
          options: config[field].options || [],
          onChange: (value) => onChange(field, value),
        }))}
      </div>

      {exportState ? (
        <p className="development-inline-feedback">
          {exportState.message}
        </p>
      ) : null}
    </section>
  );
}
