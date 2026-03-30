import { useMemo, useRef, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import RolesMatrix from "../components/RolesMatrix";
import ApprovalFlowCard from "../components/ApprovalFlowCard";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import PermissionBadge from "../components/PermissionBadge";
import usePermissionsMatrix from "../hooks/usePermissionsMatrix";
import useApprovalFlows from "../hooks/useApprovalFlows";
import { roleSchema } from "../schemas/role.schema";
import { getRoleGovernanceMeta } from "../utils/administration.helpers";

const initialRole = {
  ...roleSchema,
  level: "medium",
  permissions: {
    dashboard: [],
    recruitment: [],
    employees: [],
    vacations: [],
    administration: [],
  },
};

function getRoleLevelLabel(value) {
  const map = {
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  };

  return map[value] || "Medio";
}

export default function RolesPermissionsPage() {
  const { roles, loading, saveRole, togglePermission, deleteRole } = usePermissionsMatrix();
  const { flows } = useApprovalFlows();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [form, setForm] = useState(initialRole);
  const [feedback, setFeedback] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [highlightedActions, setHighlightedActions] = useState([]);
  const matrixRef = useRef(null);
  const roleSummaryRef = useRef(null);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0] || null;
  const selectedRoleGovernance = selectedRole ? getRoleGovernanceMeta(selectedRole, flows) : null;
  const governanceStats = useMemo(() => {
    const totalCritical = roles.reduce((sum, role) => sum + getRoleGovernanceMeta(role, flows).criticalActions, 0);
    return [
      {
        key: "roles",
        label: "Roles activos",
        value: roles.filter((role) => role.status === "active").length,
        trend: `${roles.length} perfiles definidos`,
      },
      {
        key: "critical",
        label: "Privilegios criticos",
        value: totalCritical,
        trend: "acciones approve y admin distribuidas",
      },
      {
        key: "flows",
        label: "Flujos gobernados",
        value: flows.length,
        trend: "circuitos conectados con autoridad",
      },
      {
        key: "users",
        label: "Usuarios asignados",
        value: roles.reduce((sum, role) => sum + role.users, 0),
        trend: "identidades bajo control de rol",
      },
    ];
  }, [flows, roles]);

  function focusMatrix() {
    matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusRoleSummary() {
    roleSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getMostCriticalRole() {
    return [...roles].sort((left, right) => {
      const leftMeta = getRoleGovernanceMeta(left, flows);
      const rightMeta = getRoleGovernanceMeta(right, flows);
      return rightMeta.criticalActions - leftMeta.criticalActions || right.users - left.users;
    })[0] || null;
  }

  const quickActions = [
    {
      title: "Nuevo rol de autoridad",
      description: "Define una nueva autoridad del sistema con alcance, nivel y estado.",
      actionLabel: "Crear rol",
      action: () => {
        setForm(initialRole);
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Aislar privilegios criticos",
      description: "Revisa los permisos de aprobacion y administracion en modulos sensibles.",
      actionLabel: "Revisar criticidad",
      action: () => {
        const criticalRole = getMostCriticalRole();
        if (criticalRole) {
          setSelectedRoleId(criticalRole.id);
          setHighlightedActions(["approve", "admin"]);
          setFeedback(`Se priorizo ${criticalRole.name} y se aislaron visualmente los permisos criticos.`);
          window.setTimeout(() => focusMatrix(), 80);
        }
      },
    },
    {
      title: "Roles con mayor exposicion",
      description: selectedRoleGovernance?.summary || "Selecciona un rol para revisar su exposicion y alcance.",
      actionLabel: "Ver rol actual",
      action: () => {
        const roleToFocus = selectedRole || getMostCriticalRole();
        if (roleToFocus) {
          setSelectedRoleId(roleToFocus.id);
          setHighlightedActions([]);
          setFeedback(`Mostrando el perfil ejecutivo de ${roleToFocus.name}.`);
          window.setTimeout(() => focusRoleSummary(), 80);
        }
      },
    },
  ];

  function startNewRole() {
    setSelectedRoleId("");
    setForm(initialRole);
    setHighlightedActions([]);
  }

  function handleEditRole() {
    if (!selectedRole) {
      return;
    }

    setForm({
      id: selectedRole.id,
      name: selectedRole.name,
      scope: selectedRole.scope,
      status: selectedRole.status,
      level: selectedRole.level || selectedRoleGovernance?.accessLevel?.toLowerCase() || "medium",
      permissions: selectedRole.permissions,
    });
    setIsDrawerOpen(true);
  }

  async function handleDeleteRole() {
    if (!selectedRole) {
      return;
    }

    const result = await deleteRole(selectedRole.id);

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible eliminar el rol.");
      return;
    }

    setFeedback("Rol eliminado correctamente.");
    startNewRole();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveRole(form);
    setFeedback(form.id ? "Rol actualizado correctamente." : "Rol creado correctamente.");
    setIsDrawerOpen(false);
    startNewRole();
  }

  return (
    <main className="administration-page administration-page-governance">
      <AdministrationHeader
        eyebrow="Access Governance Center"
        title="Roles, permisos y autoridad del sistema"
        description="Centro de gobernanza para definir autoridad, criticidad operativa y control de acceso sobre MGAHRCore."
        actions={
          <div className="administration-inline-actions">
            <button type="button" className="administration-secondary-button" onClick={() => setSelectedRoleId("")}>
              Limpiar seleccion
            </button>
            <button type="button" className="administration-primary-button" onClick={() => { startNewRole(); setIsDrawerOpen(true); }}>
              Nuevo rol
            </button>
          </div>
        }
        highlights={[
          { label: "Roles", value: roles.length, trend: "arquitectura de acceso editable" },
          { label: "Flujos conectados", value: flows.length, trend: "gobernanza viva" },
          { label: "Privilegios criticos", value: governanceStats[1].value, trend: "approve y admin visibles" },
        ]}
      />

      <AdministrationStatsCards items={governanceStats} />

      <section className="administration-role-workspace administration-governance-workspace">
        <div className="administration-role-main">
          <div ref={matrixRef}>
          <AdministrationSectionCard
            className="administration-panel-governance-matrix"
            title="Centro de permisos"
            description="Matriz de control por modulo y accion con jerarquia visual segun criticidad."
            actions={
              roles.length ? (
                <select
                  value={selectedRole?.id || ""}
                  onChange={(event) => {
                    setSelectedRoleId(event.target.value);
                    setHighlightedActions([]);
                  }}
                  className="administration-secondary-button"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              ) : null
            }
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {loading ? (
              <AdministrationEmptyState title="Cargando matriz" description="Preparando gobierno de permisos y jerarquia de acceso." />
            ) : !roles.length ? (
              <AdministrationEmptyState title="Sin roles configurados" description="Crea el primer rol para iniciar la gobernanza del acceso." />
            ) : (
              <RolesMatrix
                roles={roles}
                selectedRoleId={selectedRole?.id}
                onTogglePermission={togglePermission}
                highlightedActions={highlightedActions}
              />
            )}
          </AdministrationSectionCard>
          </div>
        </div>

        <aside className="administration-role-side" ref={roleSummaryRef}>
          <AdministrationSectionCard
            className="administration-panel-governance-profile"
            title="Perfil ejecutivo del rol"
            description="Lectura estrategica del poder, alcance y riesgo del rol seleccionado."
          >
            {selectedRole && selectedRoleGovernance ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Role authority</span>
                    <h3>{selectedRole.name}</h3>
                    <p className="administration-muted">{selectedRole.scope}</p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedRole.status} />
                    <span className={`administration-badge ${selectedRoleGovernance.tone}`}>Acceso {selectedRoleGovernance.accessLevel}</span>
                    <span className={`administration-badge ${selectedRoleGovernance.tone}`}>Riesgo {selectedRoleGovernance.riskLevel}</span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Alcance organizacional</span>
                    <strong>{selectedRole.scope}</strong>
                    <p className="administration-muted">Marco funcional y territorio de decision del rol.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Usuarios asignados</span>
                    <strong>{selectedRole.users}</strong>
                    <p className="administration-muted">Identidades actualmente mapeadas a este perfil.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Modulos controlados</span>
                    <strong>{selectedRoleGovernance.modulesControlled}</strong>
                    <p className="administration-muted">Frentes del sistema donde este rol tiene presencia real.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Acciones criticas</span>
                    <strong>{selectedRoleGovernance.criticalActions}</strong>
                    <p className="administration-muted">Permisos de aprobacion o administracion de mayor sensibilidad.</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Resumen ejecutivo</span>
                  <strong>Governance snapshot</strong>
                  <p className="administration-muted">{selectedRoleGovernance.summary}</p>
                </article>

                <article className="administration-list-item">
                  <span>Flujos asociados</span>
                  <div className="administration-list">
                    {selectedRoleGovernance.associatedFlows.length ? selectedRoleGovernance.associatedFlows.map((flow) => (
                      <ApprovalFlowCard key={flow.id} flow={flow} />
                    )) : (
                      <p className="administration-muted">Este rol aun no gobierna flujos de aprobacion propios.</p>
                    )}
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={handleEditRole}>
                    Editar rol
                  </button>
                  <button className="administration-secondary-button" type="button" onClick={handleDeleteRole}>
                    Eliminar rol
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Sin rol seleccionado" description="Selecciona un rol para revisar su nivel de control y exposicion." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-governance" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Role Design</span>
                <h2>{form.id ? "Actualizar autoridad" : "Crear nuevo rol de acceso"}</h2>
                <p className="administration-muted">
                  Define identidad, alcance, nivel de control y estado de una autoridad dentro del sistema.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-governance" onSubmit={handleSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Authority design</span>
                  <strong>{form.id ? "Edicion de autoridad" : "Nueva autoridad del sistema"}</strong>
                  <p className="administration-muted">Define el nivel de control, el alcance y la exposicion del rol dentro de MGAHRCore.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Nivel declarado</span>
                  <strong>{getRoleLevelLabel(form.level)}</strong>
                  <p className="administration-muted">{form.status === "active" ? "Disponible para asignacion inmediata." : "Rol en pausa o fuera de uso."}</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Enfoque del rol</span>
                  <strong>{form.scope ? "Alcance definido" : "Pendiente de alcance"}</strong>
                  <p className="administration-muted">Este frente concentra autoridad, exposicion y gobierno del acceso.</p>
                </article>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Identidad del rol</h3>
                    <p className="administration-muted">Nombre visible y descripcion del rol dentro del modelo de acceso.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre del rol</label>
                    <input
                      placeholder="Ejemplo: HR Governance Lead"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Descripcion / alcance</label>
                    <textarea
                      placeholder="Describe que gobierna este rol, donde opera y que autoridad representa."
                      value={form.scope}
                      onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}
                      required
                    />
                  </div>
                </div>
              </section>
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Gobernanza y estado</h3>
                    <p className="administration-muted">Clasifica el rol segun autoridad, exposicion y disponibilidad.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Nivel de acceso</label>
                    <select value={form.level || "medium"} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Estado</label>
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Resumen de autoridad</h3>
                    <p className="administration-muted">Lectura resumida del nivel declarado para este rol.</p>
                  </div>
                </header>
                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Nivel declarado</span>
                    <strong>{getRoleLevelLabel(form.level)}</strong>
                    <p className="administration-muted">Clasificacion administrativa base del rol.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Estado actual</span>
                    <strong>{form.status === "active" ? "Activo" : "Inactivo"}</strong>
                    <p className="administration-muted">Disponibilidad del rol para ser asignado a usuarios.</p>
                  </article>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar rol" : "Guardar rol"}
                </button>
                <button className="administration-secondary-button" type="button" onClick={startNewRole}>
                  Limpiar
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
