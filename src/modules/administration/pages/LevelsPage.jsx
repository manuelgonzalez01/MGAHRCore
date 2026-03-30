import { useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import LevelsTable from "../components/LevelsTable";
import PermissionBadge from "../components/PermissionBadge";
import useOrganizations from "../hooks/useOrganizations";
import { levelSchema, validateLevelForm } from "../schemas/organization.schema";
import useApprovalFlows from "../hooks/useApprovalFlows";
import { getCurrencyOptions } from "../utils/currency.options";

const LEVEL_TYPE_LABELS = {
  operativo: "Operativo",
  profesional: "Profesional",
  ejecutivo: "Ejecutivo",
};

const PAY_FREQUENCY_LABELS = {
  monthly: "Mensual",
  annual: "Anual",
};

const ACCESS_LEVEL_LABELS = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

function buildLevelForm(level) {
  if (!level) {
    return levelSchema;
  }

  return {
    id: level.id,
    name: level.name || "",
    internalCode: level.internalCode || level.code || "",
    hierarchyOrder: String(level.hierarchyOrder || ""),
    parentLevelId: level.parentLevelId || "",
    levelType: level.levelType || "profesional",
    seniority: level.seniority || "Mid",
    organizationalFamily: level.organizationalFamily || "",
    salaryMin: String(level.salaryMin || ""),
    salaryMax: String(level.salaryMax || ""),
    currency: level.currency || "BOB",
    payFrequency: level.payFrequency || "monthly",
    approvalLevelRequired: String(level.approvalLevelRequired || "2"),
    canApproveRequests: Boolean(level.canApproveRequests),
    systemAccessLevel: level.systemAccessLevel || "medio",
    organizationalImpact: level.organizationalImpact || "medio",
    status: level.status || "active",
    criticalLevel: Boolean(level.criticalLevel),
  };
}

function formatCurrencyRange(level) {
  return `${Number(level.salaryMin || 0).toLocaleString("es-BO")} - ${Number(level.salaryMax || 0).toLocaleString("es-BO")} ${level.currency || "BOB"}`;
}

export default function LevelsPage() {
  const { levels, saveItem, deleteItem } = useOrganizations();
  const { flows } = useApprovalFlows();
  const currencyOptions = getCurrencyOptions();
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [form, setForm] = useState(levelSchema);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = useMemo(() => {
    return [...levels]
      .map((level) => ({
        ...level,
        levelTypeLabel: LEVEL_TYPE_LABELS[level.levelType] || level.levelType || "Profesional",
        payFrequencyLabel: PAY_FREQUENCY_LABELS[level.payFrequency] || "Mensual",
        accessLevelLabel: ACCESS_LEVEL_LABELS[level.systemAccessLevel] || "Medio",
        salaryRangeLabel: formatCurrencyRange(level),
      }))
      .sort((left, right) => Number(left.hierarchyOrder) - Number(right.hierarchyOrder));
  }, [levels]);

  const selectedLevel = items.find((item) => item.id === selectedLevelId) || null;
  const levelCurrencies = new Set(items.map((item) => item.currency).filter(Boolean));
  const salaryMidpointAverage = items.length
    ? Math.round(items.reduce((sum, item) => sum + ((Number(item.salaryMin) + Number(item.salaryMax)) / 2), 0) / items.length)
    : 0;

  const statsItems = [
    {
      key: "total",
      label: "Total de niveles",
      value: items.length,
      trend: "arquitectura jerarquica disponible",
    },
    {
      key: "active",
      label: "Niveles activos",
      value: items.filter((item) => item.status === "active").length,
      trend: "listos para operar en la estructura",
    },
    {
      key: "salary",
      label: "Promedio salarial",
      value: levelCurrencies.size > 1 ? "Multi-moneda" : `${salaryMidpointAverage.toLocaleString("es-BO")} ${items[0]?.currency || "BOB"}`,
      trend: levelCurrencies.size > 1 ? "normaliza por moneda para comparar bandas" : "punto medio de compensacion",
    },
    {
      key: "seniority",
      label: "Seniorities",
      value: new Set(items.map((item) => item.seniority)).size,
      trend: "clasificaciones activas",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo nivel maestro",
      description: "Define jerarquia, banda salarial y autoridad desde un flujo de diseño corporativo.",
      actionLabel: "Crear nivel",
      action: () => {
        setForm(levelSchema);
        setErrors({});
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Revisar niveles criticos",
      description: items.some((item) => item.criticalLevel)
        ? `${items.filter((item) => item.criticalLevel).length} niveles tienen impacto alto sobre gobierno y compensacion.`
        : "Aun no hay niveles marcados como criticos.",
      actionLabel: "Enfocar criticos",
      action: () => {
        const critical = items.find((item) => item.criticalLevel);
        if (critical) {
          setSelectedLevelId(critical.id);
          setFeedback(`Mostrando el nivel ${critical.name} y su lectura ejecutiva.`);
        }
      },
    },
    {
      title: "Conectar con autorizaciones",
      description: "Los niveles deben influir en acceso, aprobacion y gobierno intermodular.",
      actionLabel: "Ver impacto",
      action: () => {
        if (selectedLevel) {
          setFeedback(`El nivel ${selectedLevel.name} exige aprobacion ${selectedLevel.approvalLevelRequired} y acceso ${selectedLevel.accessLevelLabel}.`);
        }
      },
    },
  ];

  function resetForm() {
    setForm(levelSchema);
    setErrors({});
  }

  function handleEdit(level) {
    setSelectedLevelId(level.id);
    setForm(buildLevelForm(level));
    setErrors({});
    setIsDrawerOpen(true);
  }

  async function handleDelete(id) {
    const result = await deleteItem("levels", id);
    setFeedback(result?.ok ? "Nivel eliminado correctamente." : result?.error || "No fue posible eliminar el nivel.");

    if (result?.ok && selectedLevelId === id) {
      setSelectedLevelId("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLevelForm(form, items);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = await saveItem("levels", {
      ...form,
      code: form.internalCode,
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar el nivel.");
      return;
    }

    setFeedback(form.id ? "Nivel actualizado correctamente." : "Nivel creado correctamente.");
    setSelectedLevelId(result.data.id);
    resetForm();
    setIsDrawerOpen(false);
  }

  return (
    <main className="administration-page administration-page-hierarchy">
      <AdministrationHeader
        eyebrow="Hierarchy & Compensation Engine"
        title="Niveles, seniority y bandas salariales"
        description="Controla la jerarquia del negocio, la compensacion base, el seniority y la autoridad operativa que conectan Positions, Employees y gobierno de decisiones."
        actions={(
          <div className="administration-inline-actions">
            <button type="button" className="administration-secondary-button" onClick={() => setSelectedLevelId("")}>
              Limpiar seleccion
            </button>
            <button type="button" className="administration-primary-button" onClick={() => { resetForm(); setIsDrawerOpen(true); }}>
              Nuevo nivel
            </button>
          </div>
        )}
        highlights={[
          { label: "Niveles", value: items.length, trend: "motor jerarquico" },
          { label: "Niveles criticos", value: items.filter((item) => item.criticalLevel).length, trend: "alto impacto" },
          { label: "Flujos asociados", value: flows.filter((item) => item.levels >= 2).length, trend: "gobierno sensible" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-role-workspace administration-hierarchy-workspace">
        <div className="administration-role-main">
          <AdministrationSectionCard
            className="administration-panel-hierarchy-matrix"
            title="Matriz de niveles organizacionales"
            description="Jerarquia maestra para seniority, bandas salariales y autoridad de aprobacion."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {items.length ? (
              <LevelsTable
                items={items}
                selectedId={selectedLevel?.id}
                onSelect={(item) => setSelectedLevelId(item.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <AdministrationEmptyState title="Sin niveles configurados" description="Crea el primer nivel para comenzar a estructurar jerarquia y compensacion." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-role-side">
          <AdministrationSectionCard
            className="administration-panel-hierarchy-summary"
            title="Lectura ejecutiva del nivel"
            description="Resumen del seniority, la banda salarial y la autoridad del nivel seleccionado."
          >
            {selectedLevel ? (
              <div className="administration-list">
                <div className="administration-role-hero">
                  <div>
                    <span className="administration-eyebrow">Level governance</span>
                    <h3>{selectedLevel.name}</h3>
                    <p className="administration-muted">
                      {selectedLevel.levelTypeLabel} · {selectedLevel.seniority} · Orden {selectedLevel.hierarchyOrder}
                    </p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedLevel.status} />
                    <span className={`administration-badge ${selectedLevel.organizationalImpact === "alto" ? "critical" : selectedLevel.organizationalImpact === "medio" ? "warning" : "success"}`}>
                      Impacto {selectedLevel.organizationalImpact}
                    </span>
                    <span className={`administration-badge ${selectedLevel.systemAccessLevel === "alto" ? "critical" : selectedLevel.systemAccessLevel === "medio" ? "warning" : "success"}`}>
                      Acceso {selectedLevel.accessLevelLabel}
                    </span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Rango salarial</span>
                    <strong>{selectedLevel.salaryRangeLabel}</strong>
                    <p className="administration-muted">{selectedLevel.payFrequencyLabel} · {selectedLevel.currency}</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Posiciones vinculadas</span>
                    <strong>{selectedLevel.positionsCount}</strong>
                    <p className="administration-muted">Puestos que heredan esta capa jerarquica.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Empleados vinculados</span>
                    <strong>{selectedLevel.employeesCount}</strong>
                    <p className="administration-muted">Colaboradores bajo esta banda y seniority.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Aprobacion requerida</span>
                    <strong>Nivel {selectedLevel.approvalLevelRequired}</strong>
                    <p className="administration-muted">{selectedLevel.canApproveRequests ? "Puede aprobar solicitudes." : "No aprueba solicitudes."}</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Jerarquia</span>
                  <div className="administration-timeline-list">
                    <div className="administration-timeline-step">
                      <strong>Padre jerarquico</strong>
                      <p className="administration-muted">{selectedLevel.parentLevelName || "Nivel raiz dentro de la estructura"}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Familia organizacional</strong>
                      <p className="administration-muted">{selectedLevel.organizationalFamily || "Sin familia definida"}</p>
                    </div>
                    <div className="administration-timeline-step">
                      <strong>Criticidad</strong>
                      <p className="administration-muted">{selectedLevel.criticalLevel ? "Nivel critico para compensacion y gobierno." : "Nivel operativo sin criticidad elevada."}</p>
                    </div>
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={() => handleEdit(selectedLevel)}>
                    Editar nivel
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Selecciona un nivel" description="Aqui veras seniority, compensacion y autoridad del nivel dentro del negocio." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-hierarchy" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Level Design Studio</span>
                <h2>{form.id ? "Actualizar nivel organizacional" : "Diseñar nuevo nivel"}</h2>
                <p className="administration-muted">
                  Modela jerarquia, seniority, bandas salariales y autoridad de acceso desde una experiencia premium.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            <form className="administration-company-form administration-drawer-shell administration-drawer-shell-hierarchy" onSubmit={handleSubmit}>
              <div className="administration-drawer-rail">
                <article className="administration-drawer-spotlight">
                  <span>Hierarchy layer</span>
                  <strong>{form.id ? "Ajuste de nivel" : "Nuevo nivel de jerarquia"}</strong>
                  <p className="administration-muted">Modela seniority, banda salarial y autoridad desde una capa estructural del negocio.</p>
                </article>
                <article className="administration-drawer-spotlight">
                  <span>Banda actual</span>
                  <strong>{form.salaryMin || "0"} - {form.salaryMax || "0"} {form.currency}</strong>
                  <p className="administration-muted">Frecuencia {form.payFrequency === "annual" ? "anual" : "mensual"} · Acceso {ACCESS_LEVEL_LABELS[form.systemAccessLevel] || "Medio"}.</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Gobierno</span>
                    <strong>Nivel {form.approvalLevelRequired}</strong>
                    <p className="administration-muted">{form.canApproveRequests ? "Puede aprobar solicitudes." : "Sin capacidad de aprobacion."}</p>
                  </article>
                </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Informacion basica</h3>
                    <p className="administration-muted">Identidad del nivel dentro de la jerarquia organizacional.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field administration-field-span">
                    <label>Nombre del nivel</label>
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ejemplo: Senior, Lead, Director" />
                    {errors.name ? <span className="administration-field-error">{errors.name}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Codigo interno</label>
                    <input value={form.internalCode} onChange={(event) => setForm((current) => ({ ...current, internalCode: event.target.value.toUpperCase() }))} placeholder="Opcional para reporting e integraciones" />
                    {errors.internalCode ? <span className="administration-field-error">{errors.internalCode}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Orden jerarquico</label>
                    <input type="number" value={form.hierarchyOrder} onChange={(event) => setForm((current) => ({ ...current, hierarchyOrder: event.target.value }))} />
                    {errors.hierarchyOrder ? <span className="administration-field-error">{errors.hierarchyOrder}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Nivel padre</label>
                    <select value={form.parentLevelId} onChange={(event) => setForm((current) => ({ ...current, parentLevelId: event.target.value }))}>
                      <option value="">Sin nivel padre</option>
                      {items.filter((item) => item.id !== form.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    {errors.parentLevelId ? <span className="administration-field-error">{errors.parentLevelId}</span> : null}
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Seniority y clasificacion</h3>
                    <p className="administration-muted">Ubica el nivel dentro de la madurez y familia organizacional.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Tipo de nivel</label>
                    <select value={form.levelType} onChange={(event) => setForm((current) => ({ ...current, levelType: event.target.value }))}>
                      <option value="operativo">Operativo</option>
                      <option value="profesional">Profesional</option>
                      <option value="ejecutivo">Ejecutivo</option>
                    </select>
                    {errors.levelType ? <span className="administration-field-error">{errors.levelType}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Seniority</label>
                    <select value={form.seniority} onChange={(event) => setForm((current) => ({ ...current, seniority: event.target.value }))}>
                      {["Junior", "Mid", "Senior", "Lead", "Director"].map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    {errors.seniority ? <span className="administration-field-error">{errors.seniority}</span> : null}
                  </div>
                  <div className="administration-field administration-field-span">
                    <label>Familia organizacional</label>
                    <input value={form.organizationalFamily} onChange={(event) => setForm((current) => ({ ...current, organizationalFamily: event.target.value }))} placeholder="Ejemplo: Leadership, Professional, Corporate" />
                  </div>
                </div>
              </section>
              </div>

              <div className="administration-drawer-columns">
              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Bandas salariales</h3>
                    <p className="administration-muted">Define el rango economico esperado para este nivel.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Salario minimo</label>
                    <input type="number" value={form.salaryMin} onChange={(event) => setForm((current) => ({ ...current, salaryMin: event.target.value }))} />
                    {errors.salaryMin ? <span className="administration-field-error">{errors.salaryMin}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Salario maximo</label>
                    <input type="number" value={form.salaryMax} onChange={(event) => setForm((current) => ({ ...current, salaryMax: event.target.value }))} />
                    {errors.salaryMax ? <span className="administration-field-error">{errors.salaryMax}</span> : null}
                  </div>
                  <div className="administration-field">
                    <label>Moneda</label>
                    <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
                      {currencyOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Frecuencia</label>
                    <select value={form.payFrequency} onChange={(event) => setForm((current) => ({ ...current, payFrequency: event.target.value }))}>
                      <option value="monthly">Mensual</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Autoridad y control</h3>
                    <p className="administration-muted">Determina el nivel de aprobacion, acceso e impacto dentro del negocio.</p>
                  </div>
                </header>
                <div className="administration-form-grid administration-form-grid-wide">
                  <div className="administration-field">
                    <label>Nivel de aprobacion requerido</label>
                    <select value={form.approvalLevelRequired} onChange={(event) => setForm((current) => ({ ...current, approvalLevelRequired: event.target.value }))}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <label className="administration-toggle-field">
                    <input type="checkbox" checked={form.canApproveRequests} onChange={(event) => setForm((current) => ({ ...current, canApproveRequests: event.target.checked }))} />
                    <span>Puede aprobar solicitudes</span>
                  </label>
                  <div className="administration-field">
                    <label>Nivel de acceso al sistema</label>
                    <select value={form.systemAccessLevel} onChange={(event) => setForm((current) => ({ ...current, systemAccessLevel: event.target.value }))}>
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                  <div className="administration-field">
                    <label>Impacto organizacional</label>
                    <select value={form.organizationalImpact} onChange={(event) => setForm((current) => ({ ...current, organizationalImpact: event.target.value }))}>
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                </div>
              </section>
              </div>

              <section className="administration-form-block">
                <header className="administration-form-block-head">
                  <div>
                    <h3>Configuracion</h3>
                    <p className="administration-muted">Disponibilidad y criticidad del nivel dentro del sistema.</p>
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
                    <input type="checkbox" checked={form.criticalLevel} onChange={(event) => setForm((current) => ({ ...current, criticalLevel: event.target.checked }))} />
                    <span>Nivel critico</span>
                  </label>
                </div>
              </section>

              <div className="administration-form-actions">
                <button className="administration-primary-button" type="submit">
                  {form.id ? "Actualizar nivel" : "Guardar nivel"}
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
