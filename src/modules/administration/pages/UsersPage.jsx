import { useEffect, useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationFilters from "../components/AdministrationFilters";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import UsersTable from "../components/UsersTable";
import UserProfilePreview from "../components/UserProfilePreview";
import useUsers from "../hooks/useUsers";
import useOrganizations from "../hooks/useOrganizations";
import administrationService from "../services/administration.service";
import { userSchema } from "../schemas/user.schema";

function buildAccessInsights(users = []) {
  const activeUsers = users.filter((item) => item.status === "active");
  const inactiveUsers = users.filter((item) => item.status === "inactive");
  const recentAccess = users.filter((item) => {
    const lastAccess = new Date(item.lastAccess).getTime();
    return Number.isFinite(lastAccess) && Date.now() - lastAccess <= 1000 * 60 * 60 * 24;
  }).length;
  const byRole = [...users].reduce((acc, user) => {
    acc[user.roleName] = (acc[user.roleName] || 0) + 1;
    return acc;
  }, {});
  const topRole = Object.entries(byRole).sort((left, right) => right[1] - left[1])[0];
  const byCompany = [...users].reduce((acc, user) => {
    acc[user.companyName] = (acc[user.companyName] || 0) + 1;
    return acc;
  }, {});
  const topCompany = Object.entries(byCompany).sort((left, right) => right[1] - left[1])[0];

  return {
    activeUsers,
    inactiveUsers,
    recentAccess,
    topRole,
    topCompany,
  };
}

export default function UsersPage() {
  const { users, filteredUsers, loading, filters, updateFilter, saveUser, deleteUser } = useUsers();
  const organizations = useOrganizations();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [form, setForm] = useState(userSchema);
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    administrationService.getRoles().then(setRoles);
  }, []);

  const accessInsights = useMemo(() => buildAccessInsights(users), [users]);
  const selectedUser = useMemo(
    () => users.find((item) => item.id === selectedUserId) || null,
    [selectedUserId, users],
  );
  const selectedRole = roles.find((role) => role.id === selectedUser?.roleId) || null;
  const statsItems = [
    {
      key: "active",
      label: "Usuarios activos",
      value: accessInsights.activeUsers.length,
      trend: "identidades habilitadas para operar",
    },
    {
      key: "inactive",
      label: "Usuarios inactivos",
      value: accessInsights.inactiveUsers.length,
      trend: "cuentas restringidas o fuera de uso",
    },
    {
      key: "role",
      label: "Rol dominante",
      value: accessInsights.topRole?.[0] || "Sin datos",
      trend: accessInsights.topRole ? `${accessInsights.topRole[1]} usuarios` : "sin distribucion aun",
    },
    {
      key: "recent",
      label: "Accesos recientes",
      value: accessInsights.recentAccess,
      trend: "actividad en las ultimas 24 horas",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo administrador",
      description: "Crea una identidad nueva con rol, compania e idioma en un flujo guiado.",
      actionLabel: "Crear usuario",
      action: () => {
        setForm(userSchema);
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Reforzar gobierno",
      description: accessInsights.topCompany
        ? `${accessInsights.topCompany[0]} concentra ${accessInsights.topCompany[1]} accesos visibles.`
        : "Revisa distribucion por compania y estado para equilibrar el acceso.",
      actionLabel: "Auditar accesos",
      action: () => updateFilter("status", "active"),
    },
    {
      title: "Revisar roles",
      description: accessInsights.topRole
        ? `${accessInsights.topRole[0]} es el perfil con mayor presencia en el sistema.`
        : "Configura roles para elevar la gobernanza del acceso.",
      actionLabel: "Filtrar por rol",
      action: () => updateFilter("query", accessInsights.topRole?.[0] || ""),
    },
  ];

  function resetForm() {
    setForm(userSchema);
  }

  async function refreshRoles() {
    const data = await administrationService.getRoles();
    setRoles(data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveUser(form);
    setFeedback(form.id ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
    resetForm();
    setSelectedUserId("");
    setIsDrawerOpen(false);
    refreshRoles();
  }

  function handleEditUser(user) {
    setSelectedUserId(user.id);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      companyId: user.companyId,
      status: user.status,
      language: user.language,
    });
    setIsDrawerOpen(true);
  }

  async function handleDeleteUser(userId) {
    await deleteUser(userId);
    if (selectedUserId === userId) {
      setSelectedUserId("");
      resetForm();
    }
    setFeedback("Usuario eliminado correctamente.");
  }

  async function handleToggleStatus(user) {
    await saveUser({
      ...user,
      status: user.status === "active" ? "inactive" : "active",
    });
    setFeedback(user.status === "active" ? "Cuenta desactivada correctamente." : "Cuenta reactivada correctamente.");
  }

  return (
    <main className="administration-page administration-page-identity">
      <AdministrationHeader
        eyebrow="Identity & Access Workspace"
        title="Gobierno de usuarios y control de acceso"
        description="Centro de control para identidades, roles, companias, nivel de acceso y salud operativa del sistema."
        actions={
            <div className="administration-inline-actions">
              <button type="button" className="administration-secondary-button" onClick={() => setSelectedUserId("")}>
                Limpiar seleccion
              </button>
            <button type="button" className="administration-primary-button" onClick={() => { resetForm(); setIsDrawerOpen(true); }}>
              Nuevo usuario
            </button>
          </div>
        }
        highlights={[
          { label: "Usuarios visibles", value: filteredUsers.length, trend: "scope filtrado del workspace" },
          { label: "Activos", value: accessInsights.activeUsers.length, trend: "identidades habilitadas" },
          { label: "Accesos recientes", value: accessInsights.recentAccess, trend: "actividad en 24h" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-user-workspace administration-identity-workspace">
        <div className="administration-user-main">
          <AdministrationSectionCard
            className="administration-panel-identity-table"
            title="Centro de acceso"
            description="Tabla principal de identidades con filtros, seleccion activa y foco en control operativo."
            actions={
              <div className="administration-user-table-actions">
                <span className="administration-muted">
                  {filteredUsers.length} registros en vista
                </span>
              </div>
            }
          >
            <AdministrationQuickActions items={quickActions} />
            <div className="administration-user-table-zone">
              <AdministrationFilters filters={filters} onChange={updateFilter} companies={organizations.companies} />
              {feedback ? <p className="administration-feedback administration-feedback-success">{feedback}</p> : null}
              {loading ? (
                <AdministrationEmptyState title="Cargando usuarios" description="Preparando identidad, roles y estado operativo." />
              ) : (
                <UsersTable
                  users={filteredUsers}
                  onSelect={(user) => setSelectedUserId(user.id)}
                  onDelete={handleDeleteUser}
                  onEdit={handleEditUser}
                  selectedUserId={selectedUser?.id}
                  roles={roles}
                />
              )}
            </div>
          </AdministrationSectionCard>
        </div>

        <aside className="administration-user-side">
          <AdministrationSectionCard
            className="administration-panel-identity-preview"
            title="User preview"
            description="Resumen ejecutivo del usuario seleccionado, su nivel de acceso y acciones de gobierno."
          >
            {selectedUser ? (
              <UserProfilePreview
                user={selectedUser}
                role={selectedRole}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
                onOpenRole={() => updateFilter("query", selectedUser.roleName)}
              />
            ) : (
              <div className="administration-user-empty">
                <div className="administration-user-empty-mark">IAM</div>
                <h3>Selecciona una identidad para revisar su contexto de acceso</h3>
                <p className="administration-muted">
                  Aqui veras nivel de acceso, permisos clave, actividad reciente y acciones ejecutivas sobre la cuenta.
                </p>
                <button type="button" className="administration-primary-button" onClick={() => setIsDrawerOpen(true)}>
                  Crear primer usuario
                </button>
              </div>
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-identity" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">User Provisioning</span>
                <h2>{form.id ? "Actualizar identidad" : "Alta administrativa de usuario"}</h2>
                <p className="administration-muted">
                  Configura la cuenta, compania, rol y estado operativo desde un flujo de alta guiado.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-identity" onSubmit={handleSubmit}>
              <div className="administration-drawer-intro">
                <article className="administration-drawer-spotlight">
                  <span>Provisioning</span>
                  <strong>{form.id ? "Actualizacion de identidad" : "Nueva identidad administrativa"}</strong>
                  <p className="administration-muted">Gestiona acceso, compania, idioma y operatividad de una cuenta corporativa.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Rol proyectado</span>
                  <strong>{roles.find((role) => role.id === form.roleId)?.name || "Pendiente de definir"}</strong>
                  <p className="administration-muted">La autoridad final del usuario se resuelve desde el rol asignado y su compania.</p>
                </article>
              </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Identidad base</h3>
                    <p className="administration-muted">Datos principales del usuario que vivira dentro del sistema.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre completo</label>
                    <input
                      placeholder="Ejemplo: Mariana Salvatierra"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Correo corporativo</label>
                    <input
                      placeholder="usuario@compania.com"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Gobierno de acceso</h3>
                    <p className="administration-muted">Relaciona la identidad con el rol, compania y estado de la cuenta.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Rol asignado</label>
                    <select value={form.roleId} onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))} required>
                      <option value="">Selecciona rol</option>
                      {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Compania</label>
                    <select value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))} required>
                      <option value="">Selecciona compania</option>
                      {organizations.companies.map((company) => <option key={company.id} value={company.id}>{company.tradeName || company.name}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Estado de cuenta</label>
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Idioma predeterminado</label>
                    <select value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}>
                      <option value="es">Espanol</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </section>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Contexto de provisionamiento</h3>
                    <p className="administration-muted">El rol define nivel de acceso, riesgo y capacidad de operacion dentro de MGAHRCore.</p>
                  </div>
                </header>
                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Rol seleccionado</span>
                    <strong>{roles.find((role) => role.id === form.roleId)?.name || "Pendiente"}</strong>
                    <p className="administration-muted">{roles.find((role) => role.id === form.roleId)?.scope || "Selecciona un rol para ver su alcance."}</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Compania destino</span>
                    <strong>{organizations.companies.find((company) => company.id === form.companyId)?.tradeName || organizations.companies.find((company) => company.id === form.companyId)?.name || "Pendiente"}</strong>
                    <p className="administration-muted">La identidad heredara el contexto organizacional de esta entidad.</p>
                  </article>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar usuario" : "Provisionar usuario"}
                </button>
                <button className="administration-secondary-button" type="button" onClick={resetForm}>
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
