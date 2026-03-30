import PlanStatusBadge from "./PlanStatusBadge";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentPlansTable({ items = [], onEdit, onDelete }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Empleado", "Employee")}</th>
            <th>{t("Responsable", "Owner")}</th>
            <th>{t("Estado", "Status")}</th>
            <th>{t("Responsable de etapa", "Stage owner")}</th>
            <th>{t("Avance", "Progress")}</th>
            <th>{t("Objetivo", "Target")}</th>
            {onEdit || onDelete ? <th>{t("Acciones", "Actions")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.employeeName}</td>
              <td>{item.owner}</td>
              <td><PlanStatusBadge status={item.workflowStatus || item.status} /></td>
              <td>{item.currentStageOwner || item.owner}</td>
              <td>{item.progress}%</td>
              <td>{item.targetDate}</td>
              {onEdit || onDelete ? (
                <td>
                  <div className="development-row-actions">
                    {onEdit ? <button type="button" className="suite-button-secondary" onClick={() => onEdit(item)}>{t("Editar", "Edit")}</button> : null}
                    {onDelete ? <button type="button" className="suite-button-secondary" onClick={() => onDelete(item)}>{t("Eliminar", "Delete")}</button> : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
