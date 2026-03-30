import { getEvaluationStatusTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function EvaluationCyclesTable({ items = [], onEdit }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Ciclo", "Cycle")}</th>
            <th>{t("Estado", "Status")}</th>
            <th>{t("Fecha objetivo", "Due date")}</th>
            <th>{t("Poblacion", "Population")}</th>
            <th>{t("Completadas", "Completed")}</th>
            {onEdit ? <th>{t("Acciones", "Actions")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td><span className={`development-badge ${getEvaluationStatusTone(item.status)}`}>{item.status}</span></td>
              <td>{item.dueDate}</td>
              <td>{item.employeesIncluded}</td>
              <td>{item.completedCount}</td>
              {onEdit ? <td><button type="button" className="suite-button-secondary" onClick={() => onEdit(item)}>{t("Editar", "Edit")}</button></td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
