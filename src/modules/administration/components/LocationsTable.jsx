import PermissionBadge from "./PermissionBadge";

function getLocationTypeLabel(type = "") {
  const map = {
    hq: "HQ",
    office: "Oficina",
    remote: "Remota",
    "regional-hub": "Hub regional",
  };

  return map[type] || type || "Oficina";
}

function getLocationTypeTone(type = "") {
  if (type === "hq") {
    return "critical";
  }

  if (type === "regional-hub") {
    return "warning";
  }

  if (type === "remote") {
    return "info";
  }

  return "success";
}

export default function LocationsTable({ items = [], selectedId, onSelect, onEdit, onDelete }) {
  return (
    <div className="administration-table-shell">
      <table className="administration-table administration-table-locations">
        <thead>
          <tr>
            <th>Localizacion</th>
            <th>Pais</th>
            <th>Ciudad</th>
            <th>Tipo</th>
            <th>Timezone</th>
            <th>Moneda</th>
            <th>Operacion</th>
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
                  <span className="administration-muted">{item.companyName} · {item.regionState || "Sin region"}</span>
                </div>
              </td>
              <td><span className="administration-badge neutral">{item.country || "-"}</span></td>
              <td>{item.city || "-"}</td>
              <td><span className={`administration-badge ${getLocationTypeTone(item.locationType)}`}>{getLocationTypeLabel(item.locationType)}</span></td>
              <td>{item.timezone}</td>
              <td><span className="administration-badge info">{item.currency || "-"}</span></td>
              <td>
                <div className="administration-position-usage-badges">
                  <span className="administration-badge neutral">{item.employeesCount || 0} empleados</span>
                  <span className="administration-badge neutral">{item.recruitmentCount || 0} vacantes</span>
                  {item.isPrimaryLocation ? <span className="administration-badge critical">Principal</span> : null}
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
