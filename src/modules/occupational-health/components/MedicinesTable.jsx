import HealthStatusBadge from "./HealthStatusBadge";

export default function MedicinesTable({ items = [], t, onEdit }) {
  return (
    <table className="health-table">
      <thead>
        <tr>
          <th>{t("Empleado", "Employee")}</th>
          <th>{t("Medicamento", "Medicine")}</th>
          <th>{t("Entrega", "Delivered")}</th>
          <th>{t("Cantidad", "Quantity")}</th>
          <th>{t("Estado", "Status")}</th>
          <th>{t("Seguimiento", "Follow-up")}</th>
          {onEdit ? <th>{t("Acciones", "Actions")}</th> : null}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.employeeName}</td>
            <td>{item.medicine}</td>
            <td>{item.deliveredAt}</td>
            <td>{item.quantity}</td>
            <td><HealthStatusBadge status={item.status} /></td>
            <td>{item.notes}</td>
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
