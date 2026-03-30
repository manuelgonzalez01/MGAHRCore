import { Link } from "react-router-dom";
import PersonnelActionStatusBadge from "./PersonnelActionStatusBadge";
import PersonnelActionTypeBadge from "./PersonnelActionTypeBadge";

export default function PersonnelActionsTable({ items = [], t, actionLabel = null, actionTo = null }) {
  return (
    <table className="personnel-actions-table">
      <thead>
        <tr>
          <th>{t("Tipo", "Type")}</th>
          <th>{t("Colaborador", "Employee")}</th>
          <th>{t("Estado", "Status")}</th>
          <th>{t("Impacto", "Impact")}</th>
          <th>{t("Fecha efectiva", "Effective date")}</th>
          <th>{t("Responsable", "Owner")}</th>
          <th>{t("Accion", "Action")}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td><PersonnelActionTypeBadge label={item.typeLabel} /></td>
            <td>
              <strong>{item.employeeName}</strong>
              <div className="suite-muted">{item.beforeSnapshot.positionName}</div>
            </td>
            <td><PersonnelActionStatusBadge status={item.status} label={item.statusLabel} /></td>
            <td>{item.impactSummary}</td>
            <td>{item.effectiveDate}</td>
            <td>{item.requestedBy}</td>
            <td>
              {actionTo ? <Link className="suite-button-secondary" to={actionTo(item)}>{actionLabel || t("Ver", "View")}</Link> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
