import { getTrainingStatusTone } from "../utils/development.helpers";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function TrainingProgramsTable({ items = [], onEdit, onDelete }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Programa", "Program")}</th>
            <th>{t("Categoria", "Category")}</th>
            <th>{t("Audiencia", "Audience")}</th>
            <th>{t("Cumplimiento", "Completion")}</th>
            <th>{t("Estado", "Status")}</th>
            {onEdit || onDelete ? <th>{t("Acciones", "Actions")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.audience}</td>
              <td>{item.completionRate}%</td>
              <td><span className={`development-badge ${getTrainingStatusTone(item.status)}`}>{item.status}</span></td>
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
