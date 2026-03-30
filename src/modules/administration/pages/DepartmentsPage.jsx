import { useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import DepartmentsTable from "../components/DepartmentsTable";
import PermissionBadge from "../components/PermissionBadge";
import useOrganizations from "../hooks/useOrganizations";
import { departmentSchema, validateDepartmentForm } from "../schemas/organization.schema";

const DEPARTMENT_TYPE_LABELS = {
  operativo: "Operativo",
  estrategico: "Estrategico",
  soporte: "Soporte",
};

function buildDepartmentForm(item) {
  if (!item) {
    return departmentSchema;
  }

  return {
    id: item.id,
    name: item.name || "",
    internalCode: item.internalCode || item.code || "",
    companyId: item.companyId || "",
    parentDepartmentId: item.parentDepartmentId || "",
    departmentHead: item.departmentHead || item.head || "",
    departmentType: item.departmentType || "soporte",
    levelId: item.levelId || "",
    locationId: item.locationId || "",
    costCenter: item.costCenter || "",
    budget: String(item.budget || ""),
    estimatedTeamSize: String(item.estimatedTeamSize || ""),
    description: item.description || "",
    status: item.status || "active",
    criticalDepartment: Boolean(item.criticalDepartment),
    visibleInRecruitment: item.visibleInRecruitment !== false,
    visibleInEmployees: item.visibleInEmployees !== false,
  };
}

function getHierarchyDepth(department, allDepartments) {
  let depth = 0;
  let current = department;
  const visited = new Set();

  while (current?.parentDepartmentId && !visited.has(current.parentDepartmentId)) {
    visited.add(current.parentDepartmentId);
    current = allDepartments.find((item) => item.id === current.parentDepartmentId);
    depth += 1;
  }

  return depth;
}

export default function DepartmentsPage() {
  const { departments, companies, levels, locations, saveItem, deleteItem } = useOrganizations();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [form, setForm] = useState(departmentSchema);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = useMemo(() => {
    return departments.map((department) => ({
      ...department,
      departmentTypeLabel: DEPARTMENT_TYPE_LABELS[department.departmentType] || department.departmentType || "Soporte",
      hierarchyDepth: getHierarchyDepth(department, departments),
    }));
  }, [departments]);

  const selectedDepartment = items.find((item) => item.id === selectedDepartmentId) || null;
  const employeesTotal = items.reduce((sum, item) => sum + Number(item.employeesCount || 0), 0);
  const typeDistribution = items.reduce((acc, item) => {
    acc[item.departmentType] = (acc[item.departmentType] || 0) + 1;
    return acc;
  }, {});

  const statsItems = [
    {
      key: "total",
      label: "Departamentos",
      value: items.length,
      trend: "mapa funcional disponible",
    },
    {
      key: "active",
      label: "Activos",
      value: items.filter((item) => item.status === "active").length,
      trend: "areas habilitadas para operar",
    },
    {
      key: "types",
      label: "Distribucion por tipo",
      value: Object.keys(typeDistribution).length,
      trend: "clasificaciones funcionales activas",
    },
    {
      key: "employees",
      label: "Empleados vinculados",
      value: employeesTotal,
      trend: "headcount distribuido por area",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo departamento funcional",
      description: "Disena una unidad con ownership, jerarquia y adopcion intermodular.",
      actionLabel: "Crear departamento",
      action: () => {
        setForm(departmentSchema);
        setErrors({});
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Revisar departamentos criticos",
      description: items.some((item) => item.criticalDepartment)
        ? `${items.filter((item) => item.criticalDepartment).length} departamentos tienen impacto alto sobre continuidad y staffing.`
        : "Aun no hay departamentos marcados como criticos.",
      actionLabel: "Enfocar criticos",
      action: () => {
        const critical = items.find((item) => item.criticalDepartment);
        if (critical) {
          setSelectedDepartmentId(critical.id);
          setFeedback(`Mostrando el mapa funcional de ${critical.name}.`);
        }
      },
    },
    {
      title: "Impacto en posiciones y vacantes",
      description: "Positions, Employees y Recruitment deben leer estos departamentos como estructura viva.",
      actionLabel: "Ver departamento",
      action: () => {
        if (selectedDepartment) {
          setFeedback(`${selectedDepartment.name} sostiene ${selectedDepartment.positionsCount} posiciones y ${selectedDepartment.recruitmentCount} vacantes.`);
        }
      },
    },
  ];

  function resetForm() {
    setForm(departmentSchema);
    setErrors({});
  }

  function handleEdit(item) {
    setSelectedDepartmentId(item.id);
    setForm(buildDepartmentForm(item));
    setErrors({});
    setIsDrawerOpen(true);
  }

  async function handleDelete(id) {
    const result = await deleteItem("departments", id);
    setFeedback(result?.ok ? "Departamento eliminado correctamente." : result?.error || "No fue posible eliminar el departamento.");

    if (result?.ok && selectedDepartmentId === id) {
      setSelectedDepartmentId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateDepartmentForm(form, items);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = await saveItem("departments", {
      ...form,
      code: form.internalCode,
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar el departamento.");
      return;
    }

    setFeedback(form.id ? "Departamento actualizado correctamente." : "Departamento creado correctamente.");
    setSelectedDepartmentId(result.data.id);
    resetForm();
    setIsDrawerOpen(false);
  }

  return (
    <main className="administration-page administration-page-functional">
      <AdministrationHeader
        eyebrow="Functional Organization Map"
        title="Departamentos y estructura funcional"
        description="Mapa funcional del negocio para agrupar posiciones, colaboradores, vacantes y analitica organizacional."
        actions={(
          <div className="administration-inline-actions">
            <button type="button" className="administration-secondary-button" onClick={() => setSelectedDepartmentId("")}>
              Limpiar seleccion
            </button>
            <button type="button" className="administration-primary-button" onClick={() => { resetForm(); setIsDrawerOpen(true); }}>
              Nuevo departamento
            </button>
          </div>
        )}
        highlights={[
          { label: "Departamentos", value: items.length, trend: "base funcional del negocio" },
          { label: "Criticos", value: items.filter((item) => item.criticalDepartment).length, trend: "impacto alto" },
          { label: "Vacantes activas", value: items.reduce((sum, item) => sum + Number(item.recruitmentCount || 0), 0), trend: "Recruitment" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-role-workspace administration-functional-workspace">
        <div className="administration-role-main">
          <AdministrationSectionCard
            className="administration-panel-functional-map"
            title="Mapa maestro de departamentos"
            description="Portafolio funcional con jerarquia, ownership y adopcion real en otros modulos."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {items.length ? (
              <DepartmentsTable
                items={items}
                selectedId={selectedDepartment?.id}
                onSelect={(item) => setSelectedDepartmentId(item.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <AdministrationEmptyState title="No hay departamentos registrados" description="Crea el primer departamento para empezar a estructurar el mapa funcional de la organizacion." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-role-side">
          <AdministrationSectionCard
            className="administration-panel-functional-summary"
            title="Lectura ejecutiva del departamento"
            description="Resumen del ownership, criticidad y adopcion funcional del area seleccionada."
          >
            {selectedDepartment ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Department governance</span>
                    <h3>{selectedDepartment.name}</h3>
                    <p className="administration-muted">
                      {selectedDepartment.companyName} · {selectedDepartment.departmentTypeLabel} · {selectedDepartment.locationName}
                    </p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedDepartment.status} />
                    <span className={`administration-badge ${selectedDepartment.criticalDepartment ? "critical" : "info"}`}>
                      {selectedDepartment.criticalDepartment ? "Critico" : "Estable"}
                    </span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Responsable</span>
                    <strong>{selectedDepartment.departmentHead || "Sin responsable"}</strong>
                    <p className="administration-muted">Ownership visible del frente funcional.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Centro de costo</span>
                    <strong>{selectedDepartment.costCenter || "Sin centro de costo"}</strong>
                    <p className="administration-muted">Trazabilidad presupuestaria del area.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Posiciones</span>
                    <strong>{selectedDepartment.positionsCount}</strong>
                    <p className="administration-muted">Puestos agrupados bajo este departamento.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Empleados</span>
                    <strong>{selectedDepartment.employeesCount}</strong>
                    <p className="administration-muted">Colaboradores actualmente vinculados.</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Descripcion funcional</span>
                  <strong>{selectedDepartment.departmentTypeLabel}</strong>
                  <p className="administration-muted">{selectedDepartment.description || "Sin descripcion funcional registrada."}</p>
                </article>

                <article className="administration-list-item">
                  <span>Jerarquia organizacional</span>
                  <div className="administration-timeline-list">
                    <div className="administration-timeline-step">
                      <strong>Departamento padre</strong>
                      <p className="administration-muted">{selectedDepartment.parentDepartmentName || "Departamento raiz dentro de la estructura"}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Nivel asociado</strong>
                      <p className="administration-muted">{selectedDepartment.levelName || "Sin nivel asociado"}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Adopcion intermodular</strong>
                      <p className="administration-muted">{selectedDepartment.recruitmentCount} vacantes · {selectedDepartment.pendingRequestsCount} solicitudes Employees</p>
                    </div>
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={() => handleEdit(selectedDepartment)}>
                    Editar departamento
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Selecciona un departamento" description="Aqui veras ownership, jerarquia y adopcion funcional del area." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-functional" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Department Design Studio</span>
                <h2>{form.id ? "Actualizar departamento funcional" : "Diseñar nuevo departamento"}</h2>
                <p className="administration-muted">
                  Construye un area funcional con ownership, metadata de negocio y visibilidad sobre otros modulos.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-functional" onSubmit={handleSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Functional map</span>
                  <strong>{form.id ? "Reconfiguracion de area" : "Nuevo departamento funcional"}</strong>
                  <p className="administration-muted">Organiza ownership, estructura y visibilidad del area dentro de la operacion del negocio.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Visibilidad sistémica</span>
                  <strong>{form.visibleInRecruitment ? "Recruitment" : "Sin Recruitment"} · {form.visibleInEmployees ? "Employees" : "Sin Employees"}</strong>
                  <p className="administration-muted">{form.criticalDepartment ? "Departamento critico bajo seguimiento reforzado." : "Departamento operativo sin criticidad elevada."}</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Ownership</span>
                    <strong>{form.departmentHead || "Sin responsable"}</strong>
                    <p className="administration-muted">{companies.find((item) => item.id === form.companyId)?.tradeName || companies.find((item) => item.id === form.companyId)?.name || "Empresa pendiente"}</p>
                  </article>
                </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion basica</h3>
                    <p className="administration-muted">Identidad del departamento y su pertenencia corporativa.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre del departamento</label>
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ejemplo: People Operations" />
                    {errors.name ? <span className="administration-field-error">{errors.name}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Codigo interno</label>
                    <input value={form.internalCode} onChange={(event) => setForm((current) => ({ ...current, internalCode: event.target.value.toUpperCase() }))} placeholder="Opcional para reporting e integraciones" />
                    {errors.internalCode ? <span className="administration-field-error">{errors.internalCode}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Empresa</label>
                    <select value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))}>
                      <option value="">Selecciona empresa</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.tradeName || company.name}</option>)}
                    </select>
                    {errors.companyId ? <span className="administration-field-error">{errors.companyId}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Departamento padre</label>
                    <select value={form.parentDepartmentId} onChange={(event) => setForm((current) => ({ ...current, parentDepartmentId: event.target.value }))}>
                      <option value="">Sin departamento padre</option>
                      {items.filter((item) => item.id !== form.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    {errors.parentDepartmentId ? <span className="administration-field-error">{errors.parentDepartmentId}</span> : null}
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Estructura organizacional</h3>
                    <p className="administration-muted">Define ownership, tipo funcional y ubicacion del departamento.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Responsable del departamento</label>
                    <input value={form.departmentHead} onChange={(event) => setForm((current) => ({ ...current, departmentHead: event.target.value }))} placeholder="Ejemplo: Head of People" />
                  </div>
                  <div className="administration-field">
                    <label>Tipo de departamento</label>
                    <select value={form.departmentType} onChange={(event) => setForm((current) => ({ ...current, departmentType: event.target.value }))}>
                      <option value="operativo">Operativo</option>
                      <option value="estrategico">Estrategico</option>
                      <option value="soporte">Soporte</option>
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Nivel organizacional</label>
                    <select value={form.levelId} onChange={(event) => setForm((current) => ({ ...current, levelId: event.target.value }))}>
                      <option value="">Sin nivel asociado</option>
                      {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Ubicacion</label>
                    <select value={form.locationId} onChange={(event) => setForm((current) => ({ ...current, locationId: event.target.value }))}>
                      <option value="">Selecciona ubicacion</option>
                      {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                    </select>
                  </div>
                </div>
              </section>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion de negocio</h3>
                    <p className="administration-muted">Ancla presupuestaria y contexto funcional del area.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Centro de costo</label>
                    <input value={form.costCenter} onChange={(event) => setForm((current) => ({ ...current, costCenter: event.target.value.toUpperCase() }))} placeholder="Ejemplo: CC-PC-100" />
                  </div>
                  <div className="administration-field">
                    <label>Presupuesto</label>
                    <input type="number" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} placeholder="Ejemplo: 420000" />
                  </div>
                  <div className="administration-field">
                    <label>Tamano del equipo</label>
                    <input type="number" value={form.estimatedTeamSize} onChange={(event) => setForm((current) => ({ ...current, estimatedTeamSize: event.target.value }))} placeholder="Ejemplo: 18" />
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Descripcion</label>
                    <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Describe el rol funcional, alcance y aporte del departamento." />
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion</h3>
                    <p className="administration-muted">Criticidad y visibilidad del departamento dentro de la plataforma.</p>
                  </div>
                </header>
                <div className="administration-preview-grid">
                  <div className="administration-field">
                    <label>Estado</label>
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.criticalDepartment} onChange={(event) => setForm((current) => ({ ...current, criticalDepartment: event.target.checked }))} />
                    <span>Departamento critico</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.visibleInRecruitment} onChange={(event) => setForm((current) => ({ ...current, visibleInRecruitment: event.target.checked }))} />
                    <span>Visible en Recruitment</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.visibleInEmployees} onChange={(event) => setForm((current) => ({ ...current, visibleInEmployees: event.target.checked }))} />
                    <span>Visible en Employees</span>
                  </label>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar departamento" : "Guardar departamento"}
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
