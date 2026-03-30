import HealthStatusBadge from "./HealthStatusBadge";

export default function MedicalVisitsTable({ items = [], t, onEdit }) {
  return (
    <table className="health-table">
      <thead>
        <tr>
          <th>{t("Empleado", "Employee")}</th>
          <th>{t("Tipo", "Type")}</th>
          <th>{t("Fecha", "Date")}</th>
          <th>{t("Resultado", "Result")}</th>
          <th>{t("Restricciones", "Restrictions")}</th>
          <th>{t("Seguimiento", "Follow-up")}</th>
          {onEdit ? <th>{t("Acciones", "Actions")}</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.employeeName}</td>
            <td>{item.visitType}</td>
            <td>{item.occurredAt}</td>
            <td><HealthStatusBadge status={item.result} /></td>
            <td>{item.restrictions || "-"}</td>
            <td>{item.followUpDate || "-"}</td>
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
