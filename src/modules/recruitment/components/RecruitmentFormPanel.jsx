export default function RecruitmentFormPanel({
  title,
  description = "",
  fields,
  values,
  errors = {},
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  variant = "inline",
}) {
  const panelClassName =
    variant === "inline"
      ? "recruitment-panel recruitment-form-panel"
      : `recruitment-panel recruitment-form-panel recruitment-form-panel--${variant}`;

  return (
    <section className={panelClassName}>
      <div className="recruitment-panel-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {variant !== "inline" ? (
          <button type="button" className="recruitment-modal-close" onClick={onCancel} aria-label="Cerrar">
            x
          </button>
        ) : null}
      </div>

      <form className="recruitment-form-grid" onSubmit={onSubmit}>
        {fields.map((field) => (
          <div
            key={field.name}
            className={`recruitment-field${errors[field.name] ? " has-error" : ""}`}
          >
            <label>{field.label}</label>
            {field.type === "select" ? (
              <select
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                rows="4"
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            ) : (
              <input
                type={field.type || "text"}
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}
            {errors[field.name] ? (
              <span className="recruitment-field-error">{errors[field.name]}</span>
            ) : null}
          </div>
        ))}

        <div className="recruitment-form-actions">
          <button type="submit" className="recruitment-primary-button">
            {submitLabel}
          </button>
          <button type="button" className="recruitment-secondary-button" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
