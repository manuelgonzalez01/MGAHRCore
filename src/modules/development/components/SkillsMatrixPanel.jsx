import SkillLevelBadge from "./SkillLevelBadge";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function SkillsMatrixPanel({ items = [], onEdit, onDelete }) {
  const { t } = useDevelopmentLocale();

  return (
    <div className="development-table-shell">
      <table className="development-table">
        <thead>
          <tr>
            <th>{t("Empleado", "Employee")}</th>
            <th>{t("Posicion", "Position")}</th>
            <th>{t("Habilidad", "Skill")}</th>
            <th>{t("Categoria", "Category")}</th>
            <th>{t("Nivel", "Level")}</th>
            {onEdit || onDelete ? <th>{t("Acciones", "Actions")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.employeeId}-${item.skillName}`}>
              <td>{item.employeeName}</td>
              <td>{item.positionName}</td>
              <td>{item.skillName}</td>
              <td>{item.category}</td>
              <td><SkillLevelBadge level={item.level} /></td>
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
