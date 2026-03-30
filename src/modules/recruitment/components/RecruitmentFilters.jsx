export default function RecruitmentFilters({
  copy,
  query,
  onQueryChange,
  status,
  onStatusChange,
  stage = "all",
  onStageChange,
  statusOptions,
  stageOptions,
}) {
  return (
    <section className="recruitment-panel">
      <div className="recruitment-filters">
        <div className="recruitment-field">
          <label>{copy.filters.search}</label>
          <input
            type="text"
            value={query}
            placeholder={copy.filters.searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="recruitment-field">
          <label>{copy.filters.status}</label>
          <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">{copy.filters.all}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {stageOptions ? (
          <div className="recruitment-field">
            <label>{copy.filters.stage}</label>
            <select value={stage} onChange={(event) => onStageChange(event.target.value)}>
              <option value="all">{copy.filters.all}</option>
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </section>
  );
}
