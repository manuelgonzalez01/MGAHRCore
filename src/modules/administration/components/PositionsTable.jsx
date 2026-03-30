import PermissionBadge from "./PermissionBadge";

function getImpactTone(value = "") {
  if (value === "alto") {
    return "critical";
  }

  if (value === "medio") {
    return "warning";
  }

  return "success";
}

export default function PositionsTable({
  items = [],
  selectedId,
  onSelect,
  onDelete,
  onEdit,
}) {
  return (
    <div className="administration-table-shell administration-table-shell-positions">
      <table className="administration-table administration-table-positions">
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Departamento</th>
            <th>Nivel</th>
            <th>Tipo</th>
            <th>Impacto</th>
            <th>Jerarquia</th>
            <th>Uso</th>
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
                  <span className="administration-muted">
                    {item.internalCode} · {item.jobFamily}
                  </span>
                </div>
              </td>
              <td>{item.departmentName}</td>
              <td>{item.levelName}</td>
              <td>
                <span className="administration-badge info">{item.positionTypeLabel}</span>
              </td>
              <td>
                <span className={`administration-badge ${getImpactTone(item.impact)}`}>{item.impactLabel}</span>
              </td>
              <td>
                <div className="administration-position-hierarchy-cell">
                  <strong>{item.hierarchyLabel}</strong>
                  <span className="administration-muted">
                    {item.reportsToName ? `Reporta a ${item.reportsToName}` : "Posicion raiz"}
                  </span>
                </div>
              </td>
              <td>
                <div className="administration-position-usage-badges">
                  {item.useInRecruitment ? <span className="administration-badge neutral">Recruitment</span> : null}
                  {item.useInEmployees ? <span className="administration-badge neutral">Employees</span> : null}
                  {item.criticalPosition ? <span className="administration-badge critical">Critica</span> : null}
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
