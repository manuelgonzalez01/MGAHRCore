export default function SelfServiceEmployeePanel({ employee, options = [], onChangeEmployee, t }) {
  if (!employee) {
    return null;
  }

  return (
    <section className="suite-card self-service-employee-panel">
      <div>
        <span className="suite-eyebrow">{t("Colaborador en foco", "Employee in focus")}</span>
        <h2>{employee.name}</h2>
        <p className="suite-muted">{employee.position} | {employee.department}</p>
      </div>
      <div className="self-service-employee-meta">
        <article><span>{t("Compania", "Company")}</span><strong>{employee.company}</strong></article>
        <article><span>{t("Manager", "Manager")}</span><strong>{employee.manager || "-"}</strong></article>
        <article><span>{t("Correo", "Email")}</span><strong>{employee.email || "-"}</strong></article>
      </div>
      <label className="self-service-employee-selector">
        <span>{t("Cambiar colaborador", "Change employee")}</span>
        <select value={employee.id} onChange={(event) => onChangeEmployee(event.target.value)}>
          {options.filter((item) => item.value).map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
