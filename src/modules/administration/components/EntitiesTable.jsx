import PermissionBadge from "./PermissionBadge";

function getCatalogTypeTone(type = "") {
  return type === "hierarchical" ? "warning" : "info";
}

function getModuleTone(module = "") {
  if (module === "Administration") {
    return "critical";
  }

  if (module === "Employees") {
    return "warning";
  }

  return "neutral";
}

export default function EntitiesTable({ items = [], selectedId, onSelect, onEdit, onDelete }) {
  return (
    <div className="administration-table-shell administration-table-shell-entities">
      <table className="administration-table administration-table-entities">
        <colgroup>
          <col className="administration-table-col-catalog" />
          <col className="administration-table-col-module" />
          <col className="administration-table-col-values" />
          <col className="administration-table-col-type" />
          <col className="administration-table-col-control" />
          <col className="administration-table-col-status" />
          <col className="administration-table-col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Catalogo</th>
            <th>Modulo</th>
            <th>Valores</th>
            <th>Tipo</th>
            <th>Control</th>
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
                <div className="administration-table-primary administration-table-primary-entity">
                  <strong>{item.name}</strong>
                  <div className="administration-table-meta">
                    <span className="administration-table-code">{item.internalCode || "Sin codigo"}</span>
                    <span className="administration-muted">{item.defaultValueName || "Sin valor por defecto"}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`administration-badge ${getModuleTone(item.relatedModule)}`}>{item.relatedModule}</span>
              </td>
              <td>
                <div className="administration-position-hierarchy-cell administration-entity-metrics">
                  <strong>{item.valuesCount} valores</strong>
                  <div className="administration-table-meta administration-table-meta-inline">
                    <span className="administration-muted">{item.activeValuesCount} activos</span>
                    <span className="administration-muted">{item.usageCount} usos</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`administration-badge ${getCatalogTypeTone(item.catalogType)}`}>
                  {item.catalogType === "hierarchical" ? "Jerarquico" : "Simple"}
                </span>
              </td>
              <td>
                <div className="administration-position-usage-badges administration-position-usage-badges-fluid">
                  {item.userEditable ? <span className="administration-badge success">Editable</span> : <span className="administration-badge neutral">Bloqueado</span>}
                  {item.requiresApproval ? <span className="administration-badge warning">Aprobacion</span> : null}
                  {item.criticalCatalog ? <span className="administration-badge critical">Critico</span> : null}
                </div>
              </td>
              <td>
                <PermissionBadge value={item.status} />
              </td>
              <td>
                <div className="administration-inline-actions administration-inline-actions-compact administration-inline-actions-table">
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
