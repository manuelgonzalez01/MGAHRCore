import { getPermissionLevelMeta } from "../utils/administration.helpers";

const modules = [
  { key: "dashboard", label: "Dashboard", description: "Visibilidad ejecutiva de la plataforma." },
  { key: "recruitment", label: "Recruitment", description: "Pipeline, candidatos y requisiciones." },
  { key: "employees", label: "Employees", description: "Ciclo del colaborador y expediente." },
  { key: "vacations", label: "Vacations", description: "Solicitudes, aprobaciones y control." },
  { key: "administration", label: "Administration", description: "Gobierno, configuracion y seguridad." },
];

const actions = ["view", "create", "edit", "approve", "admin"];

export default function RolesMatrix({ roles = [], selectedRoleId, onTogglePermission, highlightedActions = [] }) {
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  return (
    <div className="administration-matrix">
      <div className="administration-matrix-grid">
        <div className="administration-matrix-header administration-matrix-header-strong">
          <div>Modulo</div>
          {actions.map((action) => {
            const meta = getPermissionLevelMeta(action);
            return (
              <div key={action}>
                <strong>{action}</strong>
                <span className={`administration-badge ${meta.tone}`}>{meta.label}</span>
              </div>
            );
          })}
        </div>

        {modules.map((module) => (
          <div key={module.key} className="administration-matrix-row administration-matrix-row-strong">
            <div className="administration-matrix-module">
              <strong>{module.label}</strong>
              <p className="administration-muted">{module.description}</p>
            </div>
            {actions.map((action) => {
              const enabled = selectedRole?.permissions?.[module.key]?.includes(action);
              const meta = getPermissionLevelMeta(action);
              const isHighlighted = !highlightedActions.length || highlightedActions.includes(action);

              return (
                <label
                  key={action}
                  className={`administration-permission-tile ${enabled ? "enabled" : "disabled"} administration-permission-tile-${meta.emphasis} ${isHighlighted ? "administration-permission-tile-focus" : "administration-permission-tile-muted"}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(enabled)}
                    onChange={(event) => onTogglePermission?.(selectedRole.id, module.key, action, event.target.checked)}
                  />
                  <div>
                    <strong>{enabled ? "Activo" : "Inactivo"}</strong>
                    <p>{meta.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
