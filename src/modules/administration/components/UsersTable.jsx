import { getAccessMeta, getInitials, getLanguageMeta, getRoleTone } from "../utils/administration.helpers";
import PermissionBadge from "./PermissionBadge";
import useI18n from "../../../app/providers/useI18n";
import { formatDateTimeBySettings } from "../../../utils/dateTime";

export default function UsersTable({ users = [], onSelect, onDelete, onEdit, selectedUserId, roles = [] }) {
  const { language } = useI18n();

  return (
    <div className="administration-table-shell">
      <table className="administration-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Compania</th>
            <th>Idioma</th>
            <th>Ultimo acceso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const access = getAccessMeta(user, roles);
            const languageMeta = getLanguageMeta(user.language);

            return (
            <tr
              key={user.id}
              onClick={() => onSelect?.(user)}
              className={selectedUserId === user.id ? "administration-table-row-active" : ""}
            >
              <td>
                <div className="administration-person">
                  <span className="administration-avatar">{getInitials(user.name)}</span>
                  <div>
                    <strong>{user.name}</strong>
                    <p className="administration-muted">{user.email}</p>
                  </div>
                </div>
              </td>
              <td>
                <span className={`administration-badge ${getRoleTone(user.roleName)}`}>{user.roleName}</span>
              </td>
              <td>{user.companyName}</td>
              <td>
                <div className="administration-user-badges">
                  <span className={`administration-badge ${languageMeta.tone}`}>{languageMeta.label}</span>
                  <span className={`administration-badge ${access.tone}`}>{access.label}</span>
                </div>
              </td>
              <td>{formatDateTimeBySettings(user.lastAccess, language)}</td>
              <td><PermissionBadge value={user.status} /></td>
              <td>
                <div className="administration-inline-actions">
                  <button
                    type="button"
                    className="administration-secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(user);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="administration-secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.(user.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}
