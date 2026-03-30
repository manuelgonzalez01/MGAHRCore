import HealthStatusBadge from "./HealthStatusBadge";

export default function LaboratoryTestsTable({ items = [], t, onEdit }) {
  return (
    <table className="health-table">
      <thead>
        <tr>
          <th>{t("Empleado", "Employee")}</th>
          <th>{t("Panel", "Panel")}</th>
          <th>{t("Fecha", "Date")}</th>
          <th>{t("Resultado", "Result")}</th>
          <th>{t("Estado", "Status")}</th>
          {onEdit ? <th>{t("Acciones", "Actions")}</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.employeeName}</td>
            <td>{item.testType}</td>
            <td>{item.scheduledAt}</td>
            <td>{item.result}</td>
            <td><HealthStatusBadge status={item.status} /></td>
            {onEdit ? (
              <td>
                <button type="button" className="suite-button-secondary" onClick={() => onEdit(item)}>
                  {t("Editar", "Edit")}
                </button>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
