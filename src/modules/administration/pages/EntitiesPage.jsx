import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../administration.css";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import EntitiesTable from "../components/EntitiesTable";
import PermissionBadge from "../components/PermissionBadge";
import useOrganizations from "../hooks/useOrganizations";
import { entitySchema, validateCatalogValue, validateEntityForm } from "../schemas/organization.schema";

const MODULE_OPTIONS = ["Administration", "Employees", "Recruitment", "Permissions", "Vacations"];

const PLATFORM_LINKS = [
  { to: "/administration", label: "Administration", detail: "Estructura, permisos y parametros base." },
  { to: "/employees", label: "Employees", detail: "Expediente, ciclo del colaborador y datos maestros." },
  { to: "/recruitment", label: "Recruitment", detail: "Vacantes, pipeline y evaluaciones conectadas." },
  { to: "/vacations", label: "Vacations", detail: "Politicas, balances, solicitudes y aprobaciones." },
  { to: "/development", label: "Development", detail: "Skills, planes, readiness y talento." },
  { to: "/insurance", label: "Insurance", detail: "Planes, afiliaciones, dependientes y costos." },
  { to: "/personnel-actions", label: "Personnel Actions", detail: "Cambios del colaborador con workflow y trazabilidad." },
  { to: "/occupational-health", label: "Occupational Health", detail: "Incidentes, visitas, casos y cumplimiento." },
  { to: "/reports", label: "Reports", detail: "Analitica transversal para RRHH y gerencia." },
  { to: "/self-service", label: "Self-Service", detail: "Solicitudes, bandeja y operacion del colaborador." },
];

const MODULE_INTEGRATION_ROUTES = {
  Administration: [
    { to: "/administration", label: "Abrir Administration", detail: "Gobierno general y estructura base." },
    { to: "/administration/positions", label: "Ver posiciones", detail: "Relacion con niveles y jerarquias." },
    { to: "/reports/headcount", label: "Abrir Headcount", detail: "Impacto del catalogo en lectura organizacional." },
  ],
  Employees: [
    { to: "/employees", label: "Abrir Employees", detail: "Expediente y ciclo del colaborador." },
    { to: "/employees/profile", label: "Ver perfil 360", detail: "Lectura integral del empleado." },
    { to: "/reports/headcount", label: "Ver en Reports", detail: "Uso del catalogo sobre workforce y estatus." },
  ],
  Recruitment: [
    { to: "/recruitment", label: "Abrir Recruitment", detail: "Vacantes, candidatos y pipeline." },
    { to: "/recruitment/job-requests", label: "Ver vacantes", detail: "Consumo del catalogo en solicitudes." },
    { to: "/reports/recruitment", label: "Abrir analitica", detail: "Lectura de funnel y conversion." },
  ],
  Permissions: [
    { to: "/employees/permissions", label: "Abrir permisos", detail: "Solicitudes y ausencias relacionadas." },
    { to: "/self-service/permission-requests", label: "Autoservicio", detail: "Experiencia del colaborador final." },
    { to: "/reports/self-service", label: "Ver en Reports", detail: "Trazabilidad de solicitudes y tiempos." },
  ],
  Vacations: [
    { to: "/vacations", label: "Abrir Vacations", detail: "Politicas, balances y aprobaciones." },
    { to: "/vacations/requests", label: "Ver solicitudes", detail: "Operacion viva del dominio." },
    { to: "/reports/vacations", label: "Abrir analitica", detail: "Consumo, balances y riesgo operativo." },
  ],
};

function buildEntityForm(entity) {
  if (!entity) {
    return entitySchema;
  }

  return {
    id: entity.id,
    name: entity.name || "",
    internalCode: entity.internalCode || entity.code || "",
    description: entity.description || "",
    relatedModule: entity.relatedModule || "Employees",
    catalogType: entity.catalogType || "simple",
    userEditable: Boolean(entity.userEditable),
    requiresApproval: Boolean(entity.requiresApproval),
    status: entity.status || "active",
    criticalCatalog: Boolean(entity.criticalCatalog),
    values: entity.values || [],
  };
}

function buildValueForm(value) {
  return value
    ? {
        id: value.id,
        label: value.label || "",
        value: value.value || "",
        description: value.description || "",
        status: value.status || "active",
        isDefault: Boolean(value.isDefault),
      }
    : { label: "", value: "", description: "", status: "active", isDefault: false };
}

function getCatalogTypeLabel(type = "") {
  return type === "hierarchical" ? "Jerarquico" : "Simple";
}

function getModuleImpactText(module = "") {
  const map = {
    Administration: "Gobierna parametrizacion y reglas base del sistema.",
    Employees: "Alimenta alta, ciclo de vida y configuracion del colaborador.",
    Recruitment: "Estandariza vacantes, pipeline y decisiones de atraccion.",
    Permissions: "Define accesos y categorias sensibles para seguridad.",
    Vacations: "Normaliza causales, ausencias y aprobaciones operativas.",
  };

  return map[module] || "Catalogo disponible para reutilizacion intermodular.";
}

function getModuleIntegrationLinks(module = "") {
  return MODULE_INTEGRATION_ROUTES[module] || [
    { to: "/administration/entities", label: "Abrir catalogos", detail: "Gestion central de listas maestras." },
    { to: "/reports", label: "Abrir Reports", detail: "Lectura transversal del impacto operativo." },
  ];
}

export default function EntitiesPage() {
  const { entities, saveItem, deleteItem } = useOrganizations();
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(entitySchema);
  const [formErrors, setFormErrors] = useState({});
  const [valueForm, setValueForm] = useState(buildValueForm());
  const [valueErrors, setValueErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = useMemo(() => [...entities].sort((left, right) => left.name.localeCompare(right.name)), [entities]);
  const selectedEntity = items.find((item) => item.id === selectedEntityId) || null;
  const selectedValues = useMemo(
    () => [...(selectedEntity?.values || [])].sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder)),
    [selectedEntity],
  );
  const selectedEntityLinks = useMemo(
    () => (selectedEntity ? getModuleIntegrationLinks(selectedEntity.relatedModule) : []),
    [selectedEntity],
  );

  const statsItems = [
    { key: "catalogs", label: "Catalogos activos", value: items.length, trend: "motor de parametrizacion central" },
    {
      key: "values",
      label: "Valores configurados",
      value: items.reduce((sum, item) => sum + Number(item.valuesCount || 0), 0),
      trend: "estandarizacion reusable",
    },
    {
      key: "critical",
      label: "Catalogos criticos",
      value: items.filter((item) => item.criticalCatalog).length,
      trend: "requieren gobierno reforzado",
    },
    {
      key: "modules",
      label: "Modulos cubiertos",
      value: new Set(items.map((item) => item.relatedModule)).size,
      trend: "integracion intermodular",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo catalogo configurable",
      description: "Define listas maestras reutilizables con control, aprobacion y gobierno central.",
      actionLabel: "Crear catalogo",
      action: () => {
        setForm(entitySchema);
        setFormErrors({});
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Revisar catalogos criticos",
      description: items.some((item) => item.criticalCatalog)
        ? `${items.filter((item) => item.criticalCatalog).length} catalogos gobiernan decisiones sensibles.`
        : "Aun no hay catalogos marcados como criticos.",
      actionLabel: "Enfocar criticos",
      action: () => {
        const critical = items.find((item) => item.criticalCatalog);
        if (critical) {
          setSelectedEntityId(critical.id);
          setFeedback(`Mostrando el catalogo ${critical.name} y su configuracion dinamica.`);
        }
      },
    },
    {
      title: "Auditar configuracion viva",
      description: "Revisa valores por defecto, editabilidad y aprobacion antes de escalar cambios a otros modulos.",
      actionLabel: "Validar gobierno",
      action: () => {
        if (selectedEntity) {
          setFeedback(`El catalogo ${selectedEntity.name} mantiene ${selectedEntity.valuesCount} valores y ${selectedEntity.usageCount} usos activos.`);
        }
      },
    },
  ];

  function resetCatalogForm() {
    setForm(entitySchema);
    setFormErrors({});
  }

  function resetValueForm() {
    setValueForm(buildValueForm());
    setValueErrors({});
  }

  function handleEditCatalog(entity) {
    setSelectedEntityId(entity.id);
    setForm(buildEntityForm(entity));
    setFormErrors({});
    setIsDrawerOpen(true);
  }

  async function handleDeleteCatalog(entityId) {
    const result = await deleteItem("entities", entityId);
    setFeedback(result?.ok ? "Catalogo eliminado correctamente." : result?.error || "No fue posible eliminar el catalogo.");

    if (result?.ok && selectedEntityId === entityId) {
      setSelectedEntityId("");
      resetValueForm();
    }
  }

  async function handleCatalogSubmit(event) {
    event.preventDefault();
    const nextErrors = validateEntityForm(form, items);

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    const result = await saveItem("entities", {
      ...form,
      code: form.internalCode,
      values: form.id ? items.find((item) => item.id === form.id)?.values || [] : [],
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar el catalogo.");
      return;
    }

    setFeedback(form.id ? "Catalogo actualizado correctamente." : "Catalogo creado correctamente.");
    setSelectedEntityId(result.data.id);
    resetCatalogForm();
    setIsDrawerOpen(false);
  }

  async function persistEntityValues(nextValues, successMessage) {
    if (!selectedEntity) {
      return;
    }

    const result = await saveItem("entities", {
      ...selectedEntity,
      values: nextValues,
      code: selectedEntity.internalCode || selectedEntity.code,
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar los valores del catalogo.");
      return;
    }

    setFeedback(successMessage);
  }

  async function handleValueSubmit(event) {
    event.preventDefault();
    if (!selectedEntity) {
      return;
    }

    if (!selectedEntity.userEditable) {
      setFeedback("Este catalogo esta bloqueado para edicion manual por politica administrativa.");
      return;
    }

    const nextErrors = validateCatalogValue(valueForm, selectedEntity);
    if (Object.keys(nextErrors).length) {
      setValueErrors(nextErrors);
      return;
    }

    const currentValues = [...selectedValues];
    const nextValues = valueForm.id
      ? currentValues.map((item) => (item.id === valueForm.id ? { ...item, ...valueForm } : item))
      : [...currentValues, { ...valueForm, id: `CATV-${Date.now()}`, sortOrder: currentValues.length + 1 }];

    const focusId = valueForm.id || nextValues[nextValues.length - 1].id;
    const valuesWithDefault = nextValues.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
      isDefault: valueForm.isDefault ? item.id === focusId : item.isDefault,
    }));

    await persistEntityValues(valuesWithDefault, valueForm.id ? "Valor actualizado correctamente." : "Valor agregado correctamente.");
    resetValueForm();
  }

  async function handleSetDefault(valueId) {
    if (!selectedEntity || !selectedEntity.userEditable) {
      return;
    }

    const nextValues = selectedValues.map((item) => ({
      ...item,
      isDefault: item.id === valueId,
      status: item.id === valueId ? "active" : item.status,
    }));

    await persistEntityValues(nextValues, "Valor por defecto actualizado.");
  }

  async function handleToggleValueStatus(valueId) {
    if (!selectedEntity || !selectedEntity.userEditable) {
      return;
    }

    const currentValue = selectedValues.find((item) => item.id === valueId);
    if (!currentValue) {
      return;
    }

    const nextValues = selectedValues.map((item) => (
      item.id !== valueId
        ? item
        : {
            ...item,
            status: item.status === "active" ? "inactive" : "active",
            isDefault: item.status === "active" ? false : item.isDefault,
          }
    ));

    await persistEntityValues(
      nextValues,
      currentValue.status === "active" ? "Valor desactivado correctamente." : "Valor reactivado correctamente.",
    );
  }

  async function handleDeleteValue(valueId) {
    if (!selectedEntity || !selectedEntity.userEditable) {
      return;
    }

    const currentValue = selectedValues.find((item) => item.id === valueId);
    if (!currentValue) {
      return;
    }

    if (Number(currentValue.usageCount) > 0) {
      setFeedback("No se puede eliminar un valor que sigue en uso dentro del sistema.");
      return;
    }

    const nextValues = selectedValues
      .filter((item) => item.id !== valueId)
      .map((item, index) => ({ ...item, sortOrder: index + 1 }));

    if (!nextValues.some((item) => item.isDefault) && nextValues.length) {
      nextValues[0] = { ...nextValues[0], isDefault: true };
    }

    await persistEntityValues(nextValues, "Valor eliminado correctamente.");
    if (valueForm.id === valueId) {
      resetValueForm();
    }
  }

  async function handleMoveValue(valueId, direction) {
    if (!selectedEntity || !selectedEntity.userEditable) {
      return;
    }

    const currentIndex = selectedValues.findIndex((item) => item.id === valueId);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedValues.length) {
      return;
    }

    const reordered = [...selectedValues];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

    await persistEntityValues(
      reordered.map((item, index) => ({ ...item, sortOrder: index + 1 })),
      "Orden del catalogo actualizado.",
    );
  }

  return (
    <main className="administration-page administration-page-catalogs">
      <AdministrationHeader
        eyebrow="Dynamic Catalog Engine"
        title="Entidades y catalogos base"
        description="Centro de parametrizacion avanzada para listas maestras, estandarizacion de datos y configuracion reutilizable entre Administration, Employees y Recruitment."
        actions={(
          <div className="administration-inline-actions">
            <button
              type="button"
              className="administration-secondary-button"
              onClick={() => {
                setSelectedEntityId("");
                resetValueForm();
              }}
            >
              Limpiar seleccion
            </button>
            <button
              type="button"
              className="administration-primary-button"
              onClick={() => {
                resetCatalogForm();
                setIsDrawerOpen(true);
              }}
            >
              Nuevo catalogo
            </button>
          </div>
        )}
        highlights={[
          { label: "Catalogos", value: items.length, trend: "configuracion viva" },
          { label: "Valores", value: items.reduce((sum, item) => sum + Number(item.valuesCount || 0), 0), trend: "motor reusable" },
          { label: "Criticos", value: items.filter((item) => item.criticalCatalog).length, trend: "alto control" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <AdministrationSectionCard
        className="administration-panel-catalogs-ecosystem"
        title="Ecosistema conectado de MGAHRCore"
        description="Los catalogos base alimentan dominios operativos de toda la plataforma. Desde aqui puedes saltar a cada modulo y validar su uso real."
      >
        <div className="administration-link-grid">
          {PLATFORM_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="administration-link-card">
              <strong>{item.label}</strong>
              <p className="administration-muted">{item.detail}</p>
            </Link>
          ))}
        </div>
      </AdministrationSectionCard>

      <section className="administration-role-workspace administration-catalog-command-workspace">
        <div className="administration-role-main">
          <AdministrationSectionCard
            className="administration-panel-catalogs-library"
            title="Catalogos configurables del sistema"
            description="Portafolio central de listas maestras con gobierno, tipo de catalogo y huella operativa sobre los modulos."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {items.length ? (
              <EntitiesTable
                items={items}
                selectedId={selectedEntity?.id}
                onSelect={(item) => {
                  setSelectedEntityId(item.id);
                  resetValueForm();
                }}
                onEdit={handleEditCatalog}
                onDelete={handleDeleteCatalog}
              />
            ) : (
              <AdministrationEmptyState title="Sin catalogos configurados" description="Crea el primer catalogo para comenzar a parametrizar el sistema con valores reutilizables." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-role-side">
          <AdministrationSectionCard
            className="administration-panel-catalogs-summary"
            title="Control ejecutivo del catalogo"
            description="Resumen del alcance, gobierno, valores activos y exposicion del catalogo seleccionado."
          >
            {selectedEntity ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Catalog authority</span>
                    <h3>{selectedEntity.name}</h3>
                    <p className="administration-muted">
                      {selectedEntity.relatedModule} - {getCatalogTypeLabel(selectedEntity.catalogType)} - {selectedEntity.internalCode || "Sin codigo"}
                    </p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedEntity.status} />
                    {selectedEntity.criticalCatalog ? <span className="administration-badge critical">Critico</span> : <span className="administration-badge success">Controlado</span>}
                    {selectedEntity.requiresApproval ? <span className="administration-badge warning">Con aprobacion</span> : <span className="administration-badge neutral">Sin aprobacion</span>}
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Valores activos</span>
                    <strong>{selectedEntity.activeValuesCount}</strong>
                    <p className="administration-muted">{selectedEntity.valuesCount} configurados en total.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Valor por defecto</span>
                    <strong>{selectedEntity.defaultValueName}</strong>
                    <p className="administration-muted">Preferencia inicial del catalogo.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Usos detectados</span>
                    <strong>{selectedEntity.usageCount}</strong>
                    <p className="administration-muted">Dependencias activas sobre este catalogo.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Gobierno</span>
                    <strong>{selectedEntity.userEditable ? "Editable" : "Restringido"}</strong>
                    <p className="administration-muted">{selectedEntity.requiresApproval ? "Cambios bajo control de aprobacion." : "Cambios operativos directos."}</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Contexto de negocio</span>
                  <strong>{selectedEntity.description || "Sin descripcion ejecutiva"}</strong>
                  <p className="administration-muted">{getModuleImpactText(selectedEntity.relatedModule)}</p>
                </article>

                <article className="administration-list-item administration-link-stack">
                  <span>Integracion operativa</span>
                  <strong>Dominios conectados desde este catalogo</strong>
                  <p className="administration-muted">Accesos directos al modulo relacionado, su lectura analitica y la operacion donde este catalogo tiene impacto.</p>
                  <div className="administration-link-inline">
                    {selectedEntityLinks.map((item) => (
                      <Link key={item.to} to={item.to} className="administration-secondary-button">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={() => handleEditCatalog(selectedEntity)}>
                    Editar catalogo
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Selecciona un catalogo" description="Aqui veras su gobierno, valores activos, valor por defecto y exposicion intermodular." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      <section className="administration-grid administration-catalogs-shell">
        <AdministrationSectionCard
          className="administration-panel-catalogs-designer"
          title="Disenador de valores del catalogo"
          description="Administra valores, defaults, orden y estado operativo del catalogo seleccionado sin salir del workspace."
        >
          {selectedEntity ? (
            <div className="administration-catalog-workspace">
              <div className="administration-catalog-values">
                <div className="administration-catalog-values-head">
                  <div>
                    <span className="administration-eyebrow">Catalog values</span>
                    <h3>{selectedEntity.name}</h3>
                    <p className="administration-muted">
                      {selectedEntity.valuesCount} valores - {selectedEntity.relatedModule} - {selectedEntity.userEditable ? "Editable por usuario" : "Administrado por gobierno"}
                    </p>
                  </div>
                </div>

                {selectedValues.length ? (
                  <div className="administration-catalog-values-list">
                    {selectedValues.map((value, index) => (
                      <article key={value.id} className="administration-catalog-value-card">
                        <div className="administration-catalog-value-main">
                          <div>
                            <div className="administration-user-badges">
                              <strong>{value.label}</strong>
                              {value.isDefault ? <span className="administration-badge success">Default</span> : null}
                              <PermissionBadge value={value.status} />
                            </div>
                            <p className="administration-muted">{value.value || "Sin valor interno"} - Orden {value.sortOrder}</p>
                            <p className="administration-muted">{value.description || "Sin descripcion adicional."}</p>
                          </div>
                          <div className="administration-position-usage-badges">
                            <span className="administration-badge neutral">{value.usageCount || 0} usos</span>
                          </div>
                        </div>
                        <div className="administration-inline-actions administration-inline-actions-compact">
                          <button type="button" className="administration-secondary-button" onClick={() => setValueForm(buildValueForm(value))} disabled={!selectedEntity.userEditable}>
                            Editar
                          </button>
                          <button type="button" className="administration-secondary-button" onClick={() => handleMoveValue(value.id, "up")} disabled={!selectedEntity.userEditable || index === 0}>
                            Subir
                          </button>
                          <button type="button" className="administration-secondary-button" onClick={() => handleMoveValue(value.id, "down")} disabled={!selectedEntity.userEditable || index === selectedValues.length - 1}>
                            Bajar
                          </button>
                          <button type="button" className="administration-secondary-button" onClick={() => handleSetDefault(value.id)} disabled={!selectedEntity.userEditable}>
                            Default
                          </button>
                          <button type="button" className="administration-secondary-button" onClick={() => handleToggleValueStatus(value.id)} disabled={!selectedEntity.userEditable}>
                            {value.status === "active" ? "Desactivar" : "Reactivar"}
                          </button>
                          <button type="button" className="administration-secondary-button" onClick={() => handleDeleteValue(value.id)} disabled={!selectedEntity.userEditable}>
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <AdministrationEmptyState title="Sin valores configurados" description="Agrega el primer valor para activar este catalogo dentro del sistema." />
                )}
              </div>

              <div className="administration-catalog-editor">
                <div className="administration-form-block-head">
                  <div>
                    <h3>{valueForm.id ? "Editar valor" : "Nuevo valor de catalogo"}</h3>
                    <p className="administration-muted">Configura etiqueta, valor interno, default y estado operativo del elemento seleccionado.</p>
                  </div>
                </div>

                {!selectedEntity.userEditable ? (
                  <p className="administration-feedback administration-feedback-info">
                    Este catalogo no admite edicion manual por usuario. Su gobierno esta restringido por politica administrativa.
                  </p>
                ) : null}

                <form className="administration-form-grid administration-form-grid-wide" onSubmit={handleValueSubmit}>
                  <div className="administration-field administration-field-span">
                    <label>Valor visible</label>
                    <input value={valueForm.label} onChange={(event) => setValueForm((current) => ({ ...current, label: event.target.value }))} placeholder="Ejemplo: Indefinido" disabled={!selectedEntity.userEditable} />
                    {valueErrors.label ? <span className="administration-field-error">{valueErrors.label}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Valor interno</label>
                    <input value={valueForm.value} onChange={(event) => setValueForm((current) => ({ ...current, value: event.target.value.toUpperCase() }))} placeholder="CONTRACT_INDEFINITE" disabled={!selectedEntity.userEditable} />
                    {valueErrors.value ? <span className="administration-field-error">{valueErrors.value}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Estado</label>
                    <select value={valueForm.status} onChange={(event) => setValueForm((current) => ({ ...current, status: event.target.value }))} disabled={!selectedEntity.userEditable}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Descripcion</label>
                    <textarea rows="3" value={valueForm.description} onChange={(event) => setValueForm((current) => ({ ...current, description: event.target.value }))} placeholder="Aporta contexto sobre cuando debe usarse este valor." disabled={!selectedEntity.userEditable} />
                  </div>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={valueForm.isDefault} onChange={(event) => setValueForm((current) => ({ ...current, isDefault: event.target.checked }))} disabled={!selectedEntity.userEditable} />
                    <span>Marcar como valor por defecto</span>
                  </label>
                  <div className="administration-form-actions">
                    <button className="administration-primary-button" type="submit" disabled={!selectedEntity.userEditable}>
                      {valueForm.id ? "Actualizar valor" : "Agregar valor"}
                    </button>
                    <button className="administration-secondary-button" type="button" onClick={resetValueForm}>
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <AdministrationEmptyState title="Selecciona un catalogo para gestionar valores" description="El motor de catalogos se activa al elegir una entidad y trabajar sus valores, defaults y orden operativo." />
          )}
        </AdministrationSectionCard>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-catalogs" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Catalog Design Studio</span>
                <h2>{form.id ? "Actualizar catalogo dinamico" : "Crear nuevo catalogo dinamico"}</h2>
                <p className="administration-muted">
                  Disena catalogos reutilizables con control de edicion, aprobacion y criticidad para toda la plataforma.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-catalogs" onSubmit={handleCatalogSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Catalog engine</span>
                  <strong>{form.id ? "Catalogo en configuracion" : "Nuevo catalogo dinamico"}</strong>
                  <p className="administration-muted">Construye una pieza reusable de parametrizacion que impacta multiples modulos del sistema.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Gobierno del catalogo</span>
                  <strong>{form.relatedModule || "Sin modulo"} · {form.catalogType === "hierarchical" ? "Jerarquico" : "Simple"}</strong>
                  <p className="administration-muted">{form.userEditable ? "Editable por usuario" : "Administrado por gobierno"} · {form.requiresApproval ? "Con aprobacion" : "Sin aprobacion"}</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Estado</span>
                  <strong>{form.status === "active" ? "Activo" : "Inactivo"}</strong>
                  <p className="administration-muted">{form.criticalCatalog ? "Catalogo critico" : "Catalogo controlado"} dentro del motor de configuracion.</p>
                </article>
              </div>
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion del catalogo</h3>
                    <p className="administration-muted">Define identidad, codigo interno y lectura de negocio del catalogo.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre del catalogo</label>
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ejemplo: Tipos de contrato, Estados de empleado" />
                    {formErrors.name ? <span className="administration-field-error">{formErrors.name}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Codigo interno</label>
                    <input value={form.internalCode} onChange={(event) => setForm((current) => ({ ...current, internalCode: event.target.value.toUpperCase() }))} placeholder="Opcional para integraciones y reporting" />
                    {formErrors.internalCode ? <span className="administration-field-error">{formErrors.internalCode}</span> : null}
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Descripcion</label>
                    <textarea rows="3" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explica el uso del catalogo y que tipo de decisiones estandariza." />
                  </div>
                </div>
              </section>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion</h3>
                    <p className="administration-muted">Relacion con modulos, tipo de estructura y autonomia del usuario.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Modulo relacionado</label>
                    <select value={form.relatedModule} onChange={(event) => setForm((current) => ({ ...current, relatedModule: event.target.value }))}>
                      {MODULE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    {formErrors.relatedModule ? <span className="administration-field-error">{formErrors.relatedModule}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Tipo de catalogo</label>
                    <select value={form.catalogType} onChange={(event) => setForm((current) => ({ ...current, catalogType: event.target.value }))}>
                      <option value="simple">Simple</option>
                      <option value="hierarchical">Jerarquico</option>
                    </select>
                  </div>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.userEditable} onChange={(event) => setForm((current) => ({ ...current, userEditable: event.target.checked }))} />
                    <span>Editable por usuario</span>
                  </label>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.requiresApproval} onChange={(event) => setForm((current) => ({ ...current, requiresApproval: event.target.checked }))} />
                    <span>Requiere aprobacion</span>
                  </label>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Control</h3>
                    <p className="administration-muted">Estado operativo y criticidad del catalogo dentro del sistema.</p>
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
                    <input type="checkbox" checked={form.criticalCatalog} onChange={(event) => setForm((current) => ({ ...current, criticalCatalog: event.target.checked }))} />
                    <span>Catalogo critico</span>
                  </label>
                </div>
              </section>
              </div>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar catalogo" : "Guardar catalogo"}
                </button>
                <button className="administration-secondary-button" type="button" onClick={resetCatalogForm}>
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
