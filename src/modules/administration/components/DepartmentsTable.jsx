import PermissionBadge from "./PermissionBadge";

function getDepartmentTypeTone(type = "") {
  if (type === "estrategico") {
    return "critical";
  }

  if (type === "soporte") {
    return "warning";
  }

  return "info";
}

export default function DepartmentsTable({ items = [], selectedId, onSelect, onEdit, onDelete }) {
  return (
    <div className="administration-table-shell">
      <table className="administration-table administration-table-departments">
        <thead>
          <tr>
            <th>Departamento</th>
            <th>Empresa</th>
            <th>Responsable</th>
            <th>Tipo</th>
            <th>Tamano</th>
            <th>Jerarquia</th>
            <th>Adopcion</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={selectedId === item.id ? "administration-table-row-active" : ""}
              onClick={() => onSelect?.(item)}
            >
              <td>
                <div
                  className="administration-table-primary administration-position-table-primary"
                  style={{ paddingLeft: `${Math.min(item.hierarchyDepth, 4) * 18}px` }}
                >
                  <strong>{item.name}</strong>
                  <span className="administration-muted">{item.internalCode || "Sin codigo"} · {item.costCenter || "Sin cost center"}</span>
                </div>
              </td>
              <td>{item.companyName}</td>
              <td>
                <div className="administration-table-primary">
                  <strong>{item.departmentHead || item.head || "Sin responsable"}</strong>
                  <span className="administration-muted">{item.locationName}</span>
                </div>
              </td>
              <td><span className={`administration-badge ${getDepartmentTypeTone(item.departmentType)}`}>{item.departmentTypeLabel}</span></td>
              <td>{item.estimatedTeamSize || 0}</td>
              <td>
                <div className="administration-position-hierarchy-cell">
                  <strong>{item.parentDepartmentName || "Departamento raiz"}</strong>
                  <span className="administration-muted">{item.levelName}</span>
                </div>
              </td>
              <td>
                <div className="administration-position-usage-badges">
                  <span className="administration-badge neutral">{item.positionsCount} posiciones</span>
                  <span className="administration-badge neutral">{item.employeesCount} empleados</span>
                  <span className="administration-badge neutral">{item.recruitmentCount} vacantes</span>
                  {item.criticalDepartment ? <span className="administration-badge critical">Critico</span> : null}
                </div>
              </td>
              <td><PermissionBadge value={item.status} /></td>
              <td>
                <div className="administration-inline-actions administration-inline-actions-compact">
                  <button
                    type="button"
                    className="administration-secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(item);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="administration-secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.(item.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
