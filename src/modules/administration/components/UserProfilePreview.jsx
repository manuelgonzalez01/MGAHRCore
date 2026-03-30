import PermissionBadge from "./PermissionBadge";
import useI18n from "../../../app/providers/useI18n";
import { formatDateTimeBySettings } from "../../../utils/dateTime";
import { getAccessMeta, getInitials, getLanguageMeta, getUserExecutiveSummary } from "../utils/administration.helpers";

function buildKeyPermissions(role) {
  if (!role?.permissions) {
    return [];
  }

  return Object.entries(role.permissions)
    .filter(([, actions]) => actions?.length)
    .slice(0, 4)
    .map(([moduleKey, actions]) => ({
      module: moduleKey,
      actions: actions.slice(0, 3).join(" / "),
    }));
}

export default function UserProfilePreview({ user, role, onEdit, onToggleStatus, onOpenRole }) {
  const { language } = useI18n();

  if (!user) {
    return null;
  }

  const access = getAccessMeta(user, role ? [role] : []);
  const languageMeta = getLanguageMeta(user.language);
  const keyPermissions = buildKeyPermissions(role);

  return (
    <div className="administration-user-preview">
      <header className="administration-user-hero">
        <div className="administration-person">
          <span className="administration-avatar administration-avatar-lg">{getInitials(user.name)}</span>
          <div>
            <h3>{user.name}</h3>
            <p className="administration-muted">{user.email}</p>
          </div>
        </div>
        <div className="administration-user-badges">
          <PermissionBadge value={user.status} />
          <span className={`administration-badge ${languageMeta.tone}`}>{languageMeta.label}</span>
          <span className={`administration-badge ${access.tone}`}>Acceso {access.label}</span>
        </div>
      </header>

      <section className="administration-preview-grid">
        <article className="administration-list-item">
          <span>Rol y compania</span>
          <strong>{user.roleName}</strong>
          <p className="administration-muted">{user.companyName}</p>
        </article>
        <article className="administration-list-item">
          <span>Ultimo acceso</span>
          <strong>{formatDateTimeBySettings(user.lastAccess, language)}</strong>
          <p className="administration-muted">Actividad reciente sobre la plataforma.</p>
        </article>
        <article className="administration-list-item">
          <span>Nivel de riesgo</span>
          <strong>{access.risk}</strong>
          <p className="administration-muted">{access.summary}</p>
        </article>
        <article className="administration-list-item">
          <span>Resumen ejecutivo</span>
          <strong>Identity snapshot</strong>
          <p className="administration-muted">{getUserExecutiveSummary(user, role ? [role] : [])}</p>
        </article>
      </section>

      <section className="administration-list-item">
        <span>Permisos clave</span>
        <div className="administration-preview-permissions">
          {keyPermissions.length ? keyPermissions.map((item) => (
            <article key={`${user.id}-${item.module}`} className="administration-permission-chip-card">
              <strong>{item.module}</strong>
              <p className="administration-muted">{item.actions}</p>
            </article>
          )) : (
            <p className="administration-muted">El rol seleccionado aun no expone permisos configurados.</p>
          )}
        </div>
      </section>

      <section className="administration-list-item">
        <span>Acciones rapidas</span>
        <div className="administration-inline-actions">
          <button type="button" className="administration-primary-button" onClick={() => onEdit?.(user)}>
            Editar usuario
          </button>
          <button type="button" className="administration-secondary-button" onClick={() => onToggleStatus?.(user)}>
            {user.status === "active" ? "Desactivar cuenta" : "Reactivar cuenta"}
          </button>
          <button type="button" className="administration-secondary-button" onClick={() => onOpenRole?.(role)}>
            Revisar rol
          </button>
        </div>
      </section>
    </div>
  );
}
