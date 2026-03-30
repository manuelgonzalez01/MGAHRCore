import HealthStatusBadge from "./HealthStatusBadge";

export default function InjuriesTable({ items = [], t, onEdit }) {
  return (
    <table className="health-table">
      <thead>
        <tr>
          <th>{t("Empleado", "Employee")}</th>
          <th>{t("Tipo", "Type")}</th>
          <th>{t("Severidad", "Severity")}</th>
          <th>{t("Fecha", "Date")}</th>
          <th>{t("Ubicacion", "Location")}</th>
          <th>{t("Estado", "Status")}</th>
          {onEdit ? <th>{t("Acciones", "Actions")}</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.employeeName}</td>
            <td>{item.incidentType}</td>
            <td>{item.severity}</td>
            <td>{item.occurredAt}</td>
            <td>{item.location}</td>
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
