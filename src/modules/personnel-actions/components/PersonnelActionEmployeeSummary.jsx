export default function PersonnelActionEmployeeSummary({ employee, t }) {
  if (!employee) {
    return null;
  }

  return (
    <section className="suite-card">
      <h2>{t("Resumen del colaborador", "Employee summary")}</h2>
      <div className="personnel-impact-grid">
        {[
          [t("Posicion", "Position"), employee.position],
          [t("Departamento", "Department"), employee.department],
          [t("Nivel", "Level"), employee.levelName],
          [t("Compania", "Company"), employee.company],
          [t("Supervisor", "Supervisor"), employee.manager],
          [t("Estatus", "Status"), employee.status],
        ].map(([label, value]) => (
          <article key={label} className="personnel-impact-card">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
