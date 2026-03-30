import { useEffect, useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import PermissionBadge from "../components/PermissionBadge";
import PositionsTable from "../components/PositionsTable";
import useOrganizations from "../hooks/useOrganizations";
import { positionSchema, validatePositionForm } from "../schemas/organization.schema";
import employeesService from "../../employees/services/employees.service";
import recruitmentService from "../../recruitment/services/recruitment.service";

const POSITION_TYPE_LABELS = {
  operativa: "Operativa",
  tactica: "Tactica",
  estrategica: "Estrategica",
};

const IMPACT_LABELS = {
  alto: "Alto",
  medio: "Medio",
  bajo: "Bajo",
};

const HIRING_TYPE_OPTIONS = ["Indefinido", "Plazo fijo", "Temporal", "Consultoria"];
const JOB_FAMILY_OPTIONS = ["IT", "Finanzas", "RRHH", "Operaciones", "Comercial", "Legal"];

function buildPositionForm(position) {
  if (!position) {
    return positionSchema;
  }

  return {
    id: position.id,
    name: position.name || "",
    internalCode: position.internalCode || position.code || "",
    departmentId: position.departmentId || "",
    levelId: position.levelId || "",
    reportsToPositionId: position.reportsToPositionId || "",
    positionType: position.positionType || "operativa",
    jobFamily: position.jobFamily || "",
    locationId: position.locationId || "",
    businessRole: position.businessRole || "",
    description: position.description || "",
    impact: position.impact || "medio",
    hiringType: position.hiringType || "",
    status: position.status || "active",
    criticalPosition: Boolean(position.criticalPosition),
    useInRecruitment: position.useInRecruitment !== false,
    useInEmployees: position.useInEmployees !== false,
  };
}

function getHierarchyDepth(position, allPositions) {
  let depth = 0;
  let current = position;
  const visited = new Set();

  while (current?.reportsToPositionId && !visited.has(current.reportsToPositionId)) {
    visited.add(current.reportsToPositionId);
    current = allPositions.find((item) => item.id === current.reportsToPositionId);
    depth += 1;
  }

  return depth;
}

export default function PositionsPage() {
  const { positions, departments, levels, locations, saveItem, deleteItem } = useOrganizations();
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [form, setForm] = useState(positionSchema);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [positionUsage, setPositionUsage] = useState({ employees: [], jobRequests: [] });

  useEffect(() => {
    Promise.all([employeesService.getEmployees(), recruitmentService.getJobRequests()]).then(
      ([employees, jobRequests]) => {
        setPositionUsage({ employees, jobRequests });
      },
    );
  }, [positions]);

  const items = useMemo(() => {
    return positions.map((position) => {
      const employeeCount = positionUsage.employees.filter((employee) => employee.positionId === position.id).length;
      const openVacancyCount = positionUsage.jobRequests.filter(
        (request) =>
          request.positionId === position.id &&
          (request.status === "open" || request.status === "in_progress" || request.status === "approved"),
      ).length;
      const hierarchyDepth = getHierarchyDepth(position, positions);

      return {
        ...position,
        positionTypeLabel: POSITION_TYPE_LABELS[position.positionType] || position.positionType || "Operativa",
        impactLabel: IMPACT_LABELS[position.impact] || "Medio",
        hierarchyDepth,
        hierarchyLabel: hierarchyDepth ? `Nivel jerarquico ${hierarchyDepth + 1}` : "Nivel raiz",
        employeeCount,
        openVacancyCount,
      };
    });
  }, [positions, positionUsage]);

  const selectedPosition = items.find((item) => item.id === selectedPositionId) || null;

  const statsItems = [
    {
      key: "positions",
      label: "Posiciones totales",
      value: items.length,
      trend: "arquitectura estructural disponible",
    },
    {
      key: "active",
      label: "Posiciones activas",
      value: items.filter((item) => item.status === "active").length,
      trend: "listas para ser ocupadas o reclutadas",
    },
    {
      key: "critical",
      label: "Posiciones criticas",
      value: items.filter((item) => item.criticalPosition).length,
      trend: "impacto alto sobre continuidad del negocio",
    },
    {
      key: "levels",
      label: "Distribucion por nivel",
      value: new Set(items.map((item) => item.levelId).filter(Boolean)).size,
      trend: "capas organizacionales cubiertas",
    },
  ];

  const quickActions = [
    {
      title: "Crear posicion estructural",
      description: "Disena un puesto con contexto organizacional, jerarquia y uso intermodular.",
      actionLabel: "Nueva posicion",
      action: () => {
        setForm(positionSchema);
        setErrors({});
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Revisar posiciones criticas",
      description: items.some((item) => item.criticalPosition)
        ? `${items.filter((item) => item.criticalPosition).length} posiciones exigen cobertura y vigilancia reforzada.`
        : "Todavia no hay posiciones marcadas como criticas.",
      actionLabel: "Enfocar criticas",
      action: () => {
        const critical = items.find((item) => item.criticalPosition);
        if (critical) {
          setSelectedPositionId(critical.id);
          setFeedback(`Mostrando la lectura ejecutiva de ${critical.name}.`);
        }
      },
    },
    {
      title: "Impacto intermodular",
      description: "Recruitment y Employees deben consumir esta arquitectura como fuente maestra del puesto.",
      actionLabel: "Ver posicion activa",
      action: () => {
        if (selectedPosition) {
          setFeedback(`La posicion ${selectedPosition.name} ya impacta estructura, coverage y staffing.`);
        }
      },
    },
  ];

  function resetForm() {
    setForm(positionSchema);
    setErrors({});
  }

  function handleEdit(item) {
    setSelectedPositionId(item.id);
    setForm(buildPositionForm(item));
    setErrors({});
    setIsDrawerOpen(true);
  }

  async function handleDelete(id) {
    const result = await deleteItem("positions", id);
    setFeedback(result?.ok ? "Posicion eliminada correctamente." : result?.error || "No fue posible eliminar la posicion.");

    if (result?.ok && selectedPositionId === id) {
      setSelectedPositionId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validatePositionForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = await saveItem("positions", {
      ...form,
      code: form.internalCode,
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar la posicion.");
      return;
    }

    setFeedback(form.id ? "Posicion actualizada correctamente." : "Posicion creada correctamente.");
    setSelectedPositionId(result.data.id);
    resetForm();
    setIsDrawerOpen(false);
  }

  return (
    <main className="administration-page administration-page-architecture">
      <AdministrationHeader
        eyebrow="Organization Architecture Studio"
        title="Posiciones y arquitectura estructural"
        description="Disena la columna vertebral de puestos que conecta Employees, Recruitment, jerarquia, niveles y cobertura organizacional."
        actions={(
          <div className="administration-inline-actions">
            <button type="button" className="administration-secondary-button" onClick={() => setSelectedPositionId("")}>
              Limpiar seleccion
            </button>
            <button type="button" className="administration-primary-button" onClick={() => { resetForm(); setIsDrawerOpen(true); }}>
              Nueva posicion
            </button>
          </div>
        )}
        highlights={[
          { label: "Posiciones", value: items.length, trend: "source of truth organizacional" },
          { label: "Criticas", value: items.filter((item) => item.criticalPosition).length, trend: "continuidad operativa" },
          { label: "Vacantes conectadas", value: items.reduce((sum, item) => sum + item.openVacancyCount, 0), trend: "Recruitment" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-role-workspace administration-architecture-workspace">
        <div className="administration-role-main">
          <AdministrationSectionCard
            className="administration-panel-architecture-map"
            title="Mapa maestro de posiciones"
            description="Portafolio estructural de puestos con jerarquia, impacto y uso dentro del ecosistema."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {items.length ? (
              <PositionsTable
                items={items}
                selectedId={selectedPosition?.id}
                onSelect={(item) => setSelectedPositionId(item.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <AdministrationEmptyState title="No hay posiciones registradas" description="Crea la primera posicion para empezar a modelar la arquitectura organizacional." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-role-side">
          <AdministrationSectionCard
            className="administration-panel-architecture-executive"
            title="Lectura ejecutiva de la posicion"
            description="Resumen del puesto seleccionado, su jerarquia y su impacto sobre Recruitment y Employees."
          >
            {selectedPosition ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Position architecture</span>
                    <h3>{selectedPosition.name}</h3>
                    <p className="administration-muted">
                      {selectedPosition.departmentName} · {selectedPosition.levelName} · {selectedPosition.locationName}
                    </p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedPosition.status} />
                    <span className="administration-badge info">{selectedPosition.positionTypeLabel}</span>
                    <span className={`administration-badge ${selectedPosition.impact === "alto" ? "critical" : selectedPosition.impact === "medio" ? "warning" : "success"}`}>
                      Impacto {selectedPosition.impactLabel}
                    </span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Codigo interno</span>
                    <strong>{selectedPosition.internalCode}</strong>
                    <p className="administration-muted">Identificador corto para reporting, integraciones y estructura.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Familia de puesto</span>
                    <strong>{selectedPosition.jobFamily || "Sin familia"}</strong>
                    <p className="administration-muted">Cluster funcional para mapear talento y compensacion.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Empleados vinculados</span>
                    <strong>{selectedPosition.employeeCount}</strong>
                    <p className="administration-muted">Colaboradores actuales que ocupan esta posicion.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Vacantes abiertas</span>
                    <strong>{selectedPosition.openVacancyCount}</strong>
                    <p className="administration-muted">Solicitudes de Recruitment que usan esta arquitectura.</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Jerarquia</span>
                    <strong>{departments.find((item) => item.id === form.departmentId)?.name || "Sin departamento"}</strong>
                    <p className="administration-muted">{levels.find((item) => item.id === form.levelId)?.name || "Sin nivel"} · {locations.find((item) => item.id === form.locationId)?.name || "Sin ubicacion"}</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Rol dentro de la empresa</span>
                  <strong>{selectedPosition.businessRole}</strong>
                  <p className="administration-muted">{selectedPosition.description || "Sin descripcion ejecutiva."}</p>
                </article>

                <article className="administration-list-item">
                  <span>Jerarquia organizacional</span>
                  <div className="administration-timeline-list">
                    <div className="administration-timeline-step">
                      <strong>Posicion superior</strong>
                      <p className="administration-muted">{selectedPosition.reportsToName || "No reporta a una posicion superior registrada"}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Tipo de posicion</strong>
                      <p className="administration-muted">{selectedPosition.positionTypeLabel}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Uso sistémico</strong>
                      <p className="administration-muted">
                        {selectedPosition.useInRecruitment ? "Recruitment" : "Sin Recruitment"} · {selectedPosition.useInEmployees ? "Employees" : "Sin Employees"}
                      </p>
                    </div>
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={() => handleEdit(selectedPosition)}>
                    Editar posicion
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Selecciona una posicion" description="Aqui veras impacto, jerarquia y adopcion intermodular del puesto." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-architecture" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Position Design Studio</span>
                <h2>{form.id ? "Actualizar posicion organizacional" : "Diseñar nueva posicion"}</h2>
                <p className="administration-muted">
                  Define la arquitectura del puesto, su jerarquia y su integracion con Recruitment y Employees.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-architecture" onSubmit={handleSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Position architecture</span>
                  <strong>{form.id ? "Redisenando una posicion" : "Nueva posicion estructural"}</strong>
                  <p className="administration-muted">Crea un puesto como pieza base de jerarquia, staffing y cobertura intermodular.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Integracion esperada</span>
                  <strong>{form.useInRecruitment ? "Recruitment activo" : "Sin Recruitment"} · {form.useInEmployees ? "Employees activo" : "Sin Employees"}</strong>
                  <p className="administration-muted">La posicion puede vivir en reclutamiento, estructura interna o ambos frentes.</p>
                </article>
              </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion basica</h3>
                    <p className="administration-muted">Identidad del puesto dentro del modelo organizacional.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre del puesto</label>
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ejemplo: Senior Financial Planning Analyst" />
                    {errors.name ? <span className="administration-field-error">{errors.name}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Codigo interno</label>
                    <input value={form.internalCode} onChange={(event) => setForm((current) => ({ ...current, internalCode: event.target.value.toUpperCase() }))} placeholder="Ejemplo: FIN-PLAN-SR" />
                    <small>Identificador corto para reportes, integraciones y trazabilidad organizacional.</small>
                    {errors.internalCode ? <span className="administration-field-error">{errors.internalCode}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Departamento</label>
                    <select value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}>
                      <option value="">Selecciona departamento</option>
                      {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    {errors.departmentId ? <span className="administration-field-error">{errors.departmentId}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Nivel organizacional</label>
                    <select value={form.levelId} onChange={(event) => setForm((current) => ({ ...current, levelId: event.target.value }))}>
                      <option value="">Selecciona nivel</option>
                      {levels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    {errors.levelId ? <span className="administration-field-error">{errors.levelId}</span> : null}
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Estructura organizacional</h3>
                    <p className="administration-muted">Ubica la posicion dentro de la jerarquia y familia funcional.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Posicion superior</label>
                    <select value={form.reportsToPositionId} onChange={(event) => setForm((current) => ({ ...current, reportsToPositionId: event.target.value }))}>
                      <option value="">No reporta a una posicion superior</option>
                      {items.filter((item) => item.id !== form.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Tipo de posicion</label>
                    <select value={form.positionType} onChange={(event) => setForm((current) => ({ ...current, positionType: event.target.value }))}>
                      {Object.entries(POSITION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Familia de puesto</label>
                    <select value={form.jobFamily} onChange={(event) => setForm((current) => ({ ...current, jobFamily: event.target.value }))}>
                      <option value="">Selecciona familia</option>
                      {JOB_FAMILY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    {errors.jobFamily ? <span className="administration-field-error">{errors.jobFamily}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Ubicacion organizacional</label>
                    <select value={form.locationId} onChange={(event) => setForm((current) => ({ ...current, locationId: event.target.value }))}>
                      <option value="">Selecciona ubicacion</option>
                      {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    {errors.locationId ? <span className="administration-field-error">{errors.locationId}</span> : null}
                  </div>
                </div>
              </section>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Contexto de negocio</h3>
                    <p className="administration-muted">Explica para que existe el puesto y cual es su impacto.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Rol dentro de la empresa</label>
                    <input value={form.businessRole} onChange={(event) => setForm((current) => ({ ...current, businessRole: event.target.value }))} placeholder="Ejemplo: Conecta planeacion financiera con decisiones ejecutivas." />
                    {errors.businessRole ? <span className="administration-field-error">{errors.businessRole}</span> : null}
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Descripcion breve</label>
                    <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Describe responsabilidades, foco funcional y aporte del puesto." />
                  </div>
                  <div className="administration-field">
                    <label>Impacto del puesto</label>
                    <select value={form.impact} onChange={(event) => setForm((current) => ({ ...current, impact: event.target.value }))}>
                      {Object.entries(IMPACT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Tipo de contratacion</label>
                    <select value={form.hiringType} onChange={(event) => setForm((current) => ({ ...current, hiringType: event.target.value }))}>
                      <option value="">Selecciona tipo</option>
                      {HIRING_TYPE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion</h3>
                    <p className="administration-muted">Determina disponibilidad, criticidad y uso dentro del ecosistema.</p>
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
                    <input type="checkbox" checked={form.criticalPosition} onChange={(event) => setForm((current) => ({ ...current, criticalPosition: event.target.checked }))} />
                    <span>Posicion critica</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.useInRecruitment} onChange={(event) => setForm((current) => ({ ...current, useInRecruitment: event.target.checked }))} />
                    <span>Uso en Recruitment</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.useInEmployees} onChange={(event) => setForm((current) => ({ ...current, useInEmployees: event.target.checked }))} />
                    <span>Uso en Employees</span>
                  </label>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar posicion" : "Guardar posicion"}
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
