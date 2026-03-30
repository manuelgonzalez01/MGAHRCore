import PermissionBadge from "./PermissionBadge";

function getTone(value = "") {
  if (value === "alto") {
    return "critical";
  }

  if (value === "medio") {
    return "warning";
  }

  return "success";
}

export default function LevelsTable({ items = [], selectedId, onSelect, onEdit, onDelete }) {
  return (
    <div className="administration-table-shell">
      <table className="administration-table administration-table-levels">
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Seniority</th>
            <th>Tipo</th>
            <th>Rango salarial</th>
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
                <div className="administration-table-primary">
                  <strong>{item.name}</strong>
                  <span className="administration-muted">{item.internalCode || "Sin codigo"} · {item.organizationalFamily || "Sin familia"}</span>
                </div>
              </td>
              <td><span className={`administration-badge ${getTone(item.organizationalImpact)}`}>{item.seniority}</span></td>
              <td><span className="administration-badge info">{item.levelTypeLabel}</span></td>
              <td>
                <div className="administration-table-primary">
                  <strong>{item.salaryRangeLabel}</strong>
                  <span className="administration-muted">{item.payFrequencyLabel}</span>
                </div>
              </td>
              <td>
                <div className="administration-position-hierarchy-cell">
                  <strong>Orden {item.hierarchyOrder}</strong>
                  <span className="administration-muted">{item.parentLevelName ? `Reporta a ${item.parentLevelName}` : "Nivel raiz"}</span>
                </div>
              </td>
              <td>
                <div className="administration-position-usage-badges">
                  <span className="administration-badge neutral">{item.positionsCount} posiciones</span>
                  <span className="administration-badge neutral">{item.employeesCount} empleados</span>
                  {item.canApproveRequests ? <span className="administration-badge warning">Aprueba</span> : null}
                  {item.criticalLevel ? <span className="administration-badge critical">Critico</span> : null}
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
