import PermissionBadge from "./PermissionBadge";

export default function CompaniesTable({ items = [], onDelete, onEdit }) {
  return (
    <div className="administration-table-shell">
      <table className="administration-table">
        <thead>
          <tr>
            <th>Compania</th>
            <th>Fiscal</th>
            <th>Pais</th>
            <th>Industria</th>
            <th>Estructura</th>
            <th>Empleados</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.tradeName || item.name || item.legalName}</strong>
                <p className="administration-muted">{item.legalName || item.name}</p>
              </td>
              <td>
                <strong>{item.taxId || "-"}</strong>
                <p className="administration-muted">{item.corporateEmail || "Sin correo"}</p>
              </td>
              <td>{item.country || "-"}</td>
              <td>{item.industry || "-"}</td>
              <td>{item.structureType || "-"}</td>
              <td>{item.estimatedEmployees ?? item.workforce ?? 0}</td>
              <td><PermissionBadge value={item.status} /></td>
              <td>
                <div className="administration-inline-actions">
                  <button type="button" className="administration-secondary-button" onClick={() => onEdit?.(item)}>Editar</button>
                  <button type="button" className="administration-secondary-button" onClick={() => onDelete?.(item.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
