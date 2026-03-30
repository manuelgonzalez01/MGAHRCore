import { useEffect, useMemo, useState } from "react";
import "../administration.css";
import AdministrationHeader from "../components/AdministrationHeader";
import AdministrationSectionCard from "../components/AdministrationSectionCard";
import AdministrationEmptyState from "../components/AdministrationEmptyState";
import AdministrationQuickActions from "../components/AdministrationQuickActions";
import AdministrationStatsCards from "../components/AdministrationStatsCards";
import ApprovalFlowCard from "../components/ApprovalFlowCard";
import ApprovalRulesTable from "../components/ApprovalRulesTable";
import PermissionBadge from "../components/PermissionBadge";
import useApprovalFlows from "../hooks/useApprovalFlows";
import usePermissionsMatrix from "../hooks/usePermissionsMatrix";
import { approvalFlowSchema } from "../schemas/approvalFlow.schema";
import { getApprovalRequestMeta, getFlowGovernanceMeta } from "../utils/administration.helpers";
import { formatDateTimeBySettings } from "../../../utils/dateTime";

const initialForm = {
  id: "",
  ...approvalFlowSchema,
  module: "Employees",
  levels: 2,
  responsibleChainText: "",
};

function buildFormFromFlow(flow) {
  if (!flow) {
    return initialForm;
  }

  return {
    id: flow.id,
    name: flow.name,
    module: flow.module,
    requestType: flow.requestType,
    ownerRoleId: flow.ownerRoleId || "",
    levels: flow.levels,
    priority: flow.priority,
    status: flow.status,
    responsibleChainText: (flow.responsibleChain || []).join(", "),
  };
}

export default function AuthorizationFlowsPage() {
  const { flows, queue, loading, saveFlow, deleteFlow, updateRequestStatus } = useApprovalFlows();
  const { roles } = usePermissionsMatrix();
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selectedFlow = flows.find((flow) => flow.id === selectedFlowId) || null;
  const selectedRequest = queue.find((item) => item.id === selectedRequestId) || null;
  const activeRole = roles.find((role) => role.id === (form.ownerRoleId || selectedFlow?.ownerRoleId));
  const selectedFlowMeta = getFlowGovernanceMeta(selectedFlow, roles, queue);
  const selectedRequestMeta = getApprovalRequestMeta(selectedRequest);

  const queueSummary = useMemo(() => ({
    pending: queue.filter((item) => item.status === "pending").length,
    approved: queue.filter((item) => item.status === "approved").length,
    rejected: queue.filter((item) => item.status === "rejected").length,
    critical: queue.filter((item) => item.priority === "Critica" && item.status === "pending").length,
    atFinalLevel: queue.filter((item) => item.status === "pending" && item.currentStep === item.totalLevels).length,
  }), [queue]);

  const statsItems = [
    {
      key: "active",
      label: "Flujos activos",
      value: flows.filter((flow) => flow.status === "active").length,
      trend: `${flows.length} circuitos de decision configurados`,
    },
    {
      key: "pending",
      label: "Solicitudes pendientes",
      value: queueSummary.pending,
      trend: "decisiones vivas bajo seguimiento",
    },
    {
      key: "critical",
      label: "Criticas en curso",
      value: queueSummary.critical,
      trend: "impacto alto o resolucion inmediata",
    },
    {
      key: "final",
      label: "En ultimo nivel",
      value: queueSummary.atFinalLevel,
      trend: "listas para aprobacion final o rechazo",
    },
  ];

  const quickActions = [
    {
      title: "Nuevo circuito de aprobacion",
      description: "Disena ownership, niveles y responsables desde un flujo premium guiado.",
      actionLabel: "Crear flujo",
      action: () => {
        setSelectedFlowId("");
        setForm(initialForm);
        setIsDrawerOpen(true);
      },
    },
    {
      title: "Resolver criticidad",
      description: queueSummary.critical
        ? `${queueSummary.critical} solicitudes criticas requieren definicion inmediata.`
        : "No hay solicitudes criticas activas en este momento.",
      actionLabel: "Ir a criticas",
      action: () => {
        const criticalRequest = queue.find((item) => item.status === "pending" && item.priority === "Critica") || queue[0];
        if (criticalRequest) {
          setSelectedRequestId(criticalRequest.id);
          setSelectedFlowId(criticalRequest.flowId);
          setFeedback(`Priorizando ${criticalRequest.type} para revision ejecutiva inmediata.`);
        }
      },
    },
    {
      title: "Ver ownership actual",
      description: selectedFlowMeta.summary,
      actionLabel: "Enfocar flujo",
      action: () => {
        const flowToFocus = selectedFlow || flows[0];
        if (flowToFocus) {
          setSelectedFlowId(flowToFocus.id);
          setFeedback(`Mostrando el control ejecutivo de ${flowToFocus.name}.`);
        }
      },
    },
  ];

  useEffect(() => {
    setForm(buildFormFromFlow(selectedFlow));
  }, [selectedFlow]);

  async function handleSubmit(event) {
    event.preventDefault();

    const responsibleChain = form.responsibleChainText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const result = await saveFlow({
      id: form.id || undefined,
      name: form.name,
      module: form.module,
      requestType: form.requestType,
      ownerRoleId: form.ownerRoleId,
      levels: Number(form.levels),
      priority: form.priority,
      status: form.status,
      responsibleChain,
    });

    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible guardar el flujo.");
      return;
    }

    setFeedback(form.id ? "Flujo actualizado correctamente." : "Flujo creado correctamente.");
    setSelectedFlowId(result?.data?.id || "");
    setForm(initialForm);
    setIsDrawerOpen(false);
  }

  async function handleDeleteSelectedFlow() {
    if (!selectedFlow) {
      return;
    }

    const result = await deleteFlow(selectedFlow.id);
    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible eliminar el flujo.");
      return;
    }

    setFeedback("Flujo eliminado correctamente.");
    setSelectedFlowId("");
    setForm(initialForm);
  }

  async function handleQueueDecision(requestId, status) {
    const result = await updateRequestStatus(requestId, status);
    if (!result?.ok) {
      setFeedback(result?.error || "No fue posible actualizar la solicitud.");
      return;
    }

    setFeedback(
      status === "approved"
        ? "La solicitud avanzo correctamente dentro del flujo."
        : "La solicitud fue rechazada y cerrada.",
    );
    setSelectedRequestId(requestId);
  }

  function openFlowForEdit() {
    if (!selectedFlow) {
      return;
    }

    setForm(buildFormFromFlow(selectedFlow));
    setIsDrawerOpen(true);
  }

  return (
    <main className="administration-page administration-page-approval">
      <AdministrationHeader
        eyebrow="Approval Governance Command Center"
        title="Flujos de autorizacion y orquestacion de decisiones"
        description="Control tower para modelar circuitos, ownership, niveles de escalamiento y cola viva de aprobaciones entre modulos sensibles del ecosistema MGAHRCore."
        actions={(
          <div className="administration-inline-actions">
            <button
              type="button"
              className="administration-secondary-button"
              onClick={() => {
                setSelectedFlowId("");
                setSelectedRequestId("");
              }}
            >
              Limpiar foco
            </button>
            <button
              type="button"
              className="administration-primary-button"
              onClick={() => {
                setSelectedFlowId("");
                setForm(initialForm);
                setIsDrawerOpen(true);
              }}
            >
              Nuevo flujo
            </button>
          </div>
        )}
        highlights={[
          { label: "Flujos activos", value: flows.filter((flow) => flow.status === "active").length, trend: "gobierno vivo" },
          { label: "Pendientes", value: queueSummary.pending, trend: "cola de decision abierta" },
          { label: "Criticas", value: queueSummary.critical, trend: "impacto maximo en seguimiento" },
        ]}
      />

      <AdministrationStatsCards items={statsItems} />

      <section className="administration-approval-workspace administration-command-workspace">
        <div className="administration-approval-main">
          <AdministrationSectionCard
            className="administration-panel-command-catalog"
            title="Catalogo de circuitos de aprobacion"
            description="Portafolio de flujos con criticidad, ownership y carga operativa en tiempo real."
          >
            <AdministrationQuickActions items={quickActions} />
            {feedback ? <p className="administration-feedback administration-feedback-info">{feedback}</p> : null}
            {loading ? (
              <AdministrationEmptyState title="Cargando flujos" description="Preparando circuitos y dependencias de gobierno." />
            ) : flows.length ? (
              <div className="administration-approval-flow-grid">
                {flows.map((flow) => (
                  <ApprovalFlowCard
                    key={flow.id}
                    flow={flow}
                    roles={roles}
                    queue={queue}
                    selected={selectedFlow?.id === flow.id}
                    onSelect={(flowItem) => {
                      setSelectedFlowId(flowItem.id);
                      const relatedRequest = queue.find((item) => item.flowId === flowItem.id);
                      if (relatedRequest) {
                        setSelectedRequestId(relatedRequest.id);
                      }
                      setFeedback(`Mostrando el control ejecutivo de ${flowItem.name}.`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <AdministrationEmptyState title="Sin flujos configurados" description="Crea el primer circuito para empezar a gobernar decisiones intermodulares." />
            )}
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-command-queue"
            title="Cola viva de aprobaciones"
            description="Workspace operativo para resolver solicitudes, vigilar SLA y seguir la ruta actual de decision."
            actions={(
              <div className="administration-inline-actions">
                <span className="administration-muted">{queue.length} solicitudes visibles</span>
              </div>
            )}
          >
            <div className="administration-kpi-grid">
              <article className="administration-stat-card">
                <span>Pendientes</span>
                <strong>{queueSummary.pending}</strong>
                <p className="administration-muted">Requieren accion humana inmediata.</p>
              </article>
              <article className="administration-stat-card">
                <span>Aprobadas</span>
                <strong>{queueSummary.approved}</strong>
                <p className="administration-muted">Circuitos ya resueltos dentro del SLA.</p>
              </article>
              <article className="administration-stat-card">
                <span>Rechazadas</span>
                <strong>{queueSummary.rejected}</strong>
                <p className="administration-muted">Solicitudes cerradas con bloqueo formal.</p>
              </article>
            </div>

            {queue.length ? (
              <ApprovalRulesTable
                items={queue}
                onStatusChange={handleQueueDecision}
                selectedRequestId={selectedRequest?.id}
                onSelect={(request) => {
                  setSelectedRequestId(request.id);
                  setSelectedFlowId(request.flowId);
                }}
              />
            ) : (
              <AdministrationEmptyState title="Sin solicitudes en cola" description="Las nuevas aprobaciones apareceran aqui con SLA, nivel actual y responsable activo." />
            )}
          </AdministrationSectionCard>
        </div>

        <aside className="administration-approval-side">
          <AdministrationSectionCard
            className="administration-panel-command-executive"
            title="Control ejecutivo del flujo"
            description="Lectura estrategica del circuito seleccionado, su exposure y ownership sobre el negocio."
          >
            {selectedFlow ? (
              <div className="administration-list">
                <div className={`administration-flow-hero administration-flow-hero-${selectedFlowMeta.tone}`}>
                  <div>
                    <span className="administration-eyebrow">Flow authority</span>
                    <h3>{selectedFlow.name}</h3>
                    <p className="administration-muted">{selectedFlow.requestType}</p>
                  </div>
                  <div className="administration-user-badges">
                    <PermissionBadge value={selectedFlow.status} />
                    <span className={`administration-badge ${selectedFlowMeta.tone}`}>{selectedFlow.priority}</span>
                    <span className={`administration-badge ${selectedFlowMeta.tone}`}>{selectedFlowMeta.riskLevel}</span>
                  </div>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Modulo gobernado</span>
                    <strong>{selectedFlow.module}</strong>
                    <p className="administration-muted">Dominio del sistema impactado por este circuito.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Niveles de aprobacion</span>
                    <strong>{selectedFlow.levels}</strong>
                    <p className="administration-muted">Capas de control antes del cierre formal.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Solicitudes pendientes</span>
                    <strong>{selectedFlowMeta.pendingItems}</strong>
                    <p className="administration-muted">Carga activa bajo este flujo en tiempo real.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Solicitudes resueltas</span>
                    <strong>{selectedFlowMeta.resolvedItems}</strong>
                    <p className="administration-muted">Decisiones cerradas o finalizadas.</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Modulo</span>
                    <strong>{form.module}</strong>
                    <p className="administration-muted">El circuito nacera conectado al dominio funcional que estas gobernando.</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Ownership del circuito</span>
                  <strong>{selectedFlowMeta.ownerRoleName}</strong>
                  <p className="administration-muted">{selectedFlowMeta.ownerScope}</p>
                </article>

                <article className="administration-list-item">
                  <span>Resumen ejecutivo</span>
                  <strong>{selectedFlowMeta.criticalityLabel}</strong>
                  <p className="administration-muted">{selectedFlowMeta.summary}</p>
                </article>

                <article className="administration-list-item">
                  <span>Cadena de decision</span>
                  <div className="administration-timeline-list">
                    {selectedFlow.responsibleChain.map((step, index) => (
                      <div key={`${selectedFlow.id}-${step}`} className="administration-timeline-step">
                        <strong>Nivel {index + 1}</strong>
                        <p className="administration-muted">{step}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="administration-inline-actions">
                  <button className="administration-primary-button" type="button" onClick={openFlowForEdit}>
                    Editar flujo
                  </button>
                  <button className="administration-secondary-button" type="button" onClick={handleDeleteSelectedFlow}>
                    Eliminar flujo
                  </button>
                </div>
              </div>
            ) : (
              <AdministrationEmptyState title="Sin flujo seleccionado" description="Elige un flujo para revisar su autoridad y su recorrido de aprobacion." />
            )}
          </AdministrationSectionCard>

          <AdministrationSectionCard
            className="administration-panel-command-request"
            title="Solicitud enfocada"
            description="Detalle de la aprobacion activa, su posicion en el circuito y su trazabilidad reciente."
          >
            {selectedRequest ? (
              <div className="administration-list">
                <div className={`administration-flow-owner-card administration-flow-owner-card-${selectedRequestMeta.tone}`}>
                  <span>{selectedRequest.type}</span>
                  <strong>{selectedRequestMeta.levelLabel}</strong>
                  <p className="administration-muted">{selectedRequestMeta.summary}</p>
                </div>

                <div className="administration-preview-grid">
                  <article className="administration-list-item">
                    <span>Solicitante</span>
                    <strong>{selectedRequest.requester}</strong>
                    <p className="administration-muted">Origen formal de la solicitud.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Responsable actual</span>
                    <strong>{selectedRequest.currentLevel}</strong>
                    <p className="administration-muted">Propietario de la siguiente decision.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>Riesgo operativo</span>
                    <strong>{selectedRequestMeta.riskLabel}</strong>
                    <p className="administration-muted">Lectura consolidada de prioridad y momento del flujo.</p>
                  </article>
                  <article className="administration-list-item">
                    <span>SLA</span>
                    <strong>{selectedRequestMeta.slaLabel}</strong>
                    <p className="administration-muted">Tiempo comprometido para resolucion.</p>
                  </article>
                </div>

                <article className="administration-list-item">
                  <span>Historial de decisiones</span>
                  <div className="administration-timeline-list">
                    {selectedRequest.history?.length ? selectedRequest.history.map((entry) => (
                      <div key={`${selectedRequest.id}-${entry.level}-${entry.actedAt}`} className="administration-timeline-step">
                        <strong>Nivel {entry.level} - {entry.actor}</strong>
                        <p className="administration-muted">
                          {entry.decision === "approved" ? "Aprobado" : "Rechazado"} el {formatDateTimeBySettings(entry.actedAt)}
                        </p>
                      </div>
                    )) : (
                      <div className="administration-timeline-step">
                        <strong>Sin decisiones previas</strong>
                        <p className="administration-muted">La solicitud aun no registra actuaciones dentro del circuito.</p>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            ) : (
              <AdministrationEmptyState title="Sin solicitud enfocada" description="Selecciona una aprobacion para revisar su SLA, responsable y trazabilidad." />
            )}
          </AdministrationSectionCard>
        </aside>
      </section>

      {isDrawerOpen ? (
        <div className="administration-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <aside className="administration-drawer administration-drawer-approval" onClick={(event) => event.stopPropagation()}>
            <header className="administration-drawer-head">
              <div>
                <span className="administration-eyebrow">Flow Design Studio</span>
                <h2>{form.id ? "Actualizar circuito de aprobacion" : "Disenar nuevo flujo de autorizacion"}</h2>
                <p className="administration-muted">
                  Modela ownership, niveles, tipo de solicitud y responsables reales desde una experiencia de gobierno premium.
                </p>
              </div>
              <button type="button" className="administration-secondary-button" onClick={() => setIsDrawerOpen(false)}>
                Cerrar
              </button>
            </header>

            {!roles.length ? (
              <AdministrationEmptyState title="No hay roles disponibles" description="Primero configura roles y permisos para asignar ownership real a cada flujo." />
            ) : (
              <form className="administration-company-form administration-drawer-shell administration-drawer-shell-approval" onSubmit={handleSubmit}>
                <div className="administration-drawer-rail">
                  <article className="administration-drawer-spotlight">
                    <span>Decision circuit</span>
                    <strong>{form.id ? "Circuito en actualizacion" : "Nuevo circuito de aprobacion"}</strong>
                    <p className="administration-muted">Este flujo definira ownership, criticidad y cadena de resolucion en decisiones sensibles.</p>
                  </article>
                  <article className="administration-drawer-spotlight">
                    <span>Ownership activo</span>
                    <strong>{activeRole?.name || "Sin rol propietario"}</strong>
                    <p className="administration-muted">Niveles {form.levels} · Prioridad {form.priority} · Estado {form.status === "active" ? "Activo" : "Inactivo"}.</p>
                  </article>
                </div>

                <div className="administration-drawer-columns">
                <section className="administration-form-block">
                  <header className="administration-form-block-head">
                    <div>
                      <h3>Identidad del circuito</h3>
                      <p className="administration-muted">Define el nombre del flujo y el tipo de decision que gobernara.</p>
                    </div>
                  </header>
                  <div className="administration-form-grid administration-form-grid-wide">
                    <div className="administration-field administration-field-span">
                      <label>Nombre del flujo</label>
                      <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Ejemplo: Cambios salariales extraordinarios"
                        required
                      />
                    </div>
                    <div className="administration-field administration-field-span">
                      <label>Tipo de solicitud</label>
                      <input
                        value={form.requestType}
                        onChange={(event) => setForm((current) => ({ ...current, requestType: event.target.value }))}
                        placeholder="Ejemplo: Ajuste salarial, alta critica o acceso sensible"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="administration-form-block">
                  <header className="administration-form-block-head">
                    <div>
                      <h3>Gobierno y criticidad</h3>
                      <p className="administration-muted">Asigna ownership real, prioridad operativa y vigencia del flujo.</p>
                    </div>
                  </header>
                  <div className="administration-form-grid administration-form-grid-wide">
                    <div className="administration-field">
                      <label>Modulo</label>
                      <select
                        value={form.module}
                        onChange={(event) => setForm((current) => ({ ...current, module: event.target.value }))}
                      >
                        <option value="Administration">Administration</option>
                        <option value="Recruitment">Recruitment</option>
                        <option value="Employees">Employees</option>
                        <option value="Vacations">Vacations</option>
                        <option value="Personnel Actions">Personnel Actions</option>
                      </select>
                    </div>
                    <div className="administration-field">
                      <label>Rol propietario</label>
                      <select
                        value={form.ownerRoleId}
                        onChange={(event) => setForm((current) => ({ ...current, ownerRoleId: event.target.value }))}
                        required
                      >
                        <option value="">Selecciona rol</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="administration-field">
                      <label>Niveles</label>
                      <select
                        value={form.levels}
                        onChange={(event) => setForm((current) => ({ ...current, levels: event.target.value }))}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div className="administration-field">
                      <label>Prioridad</label>
                      <select
                        value={form.priority}
                        onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                      >
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Critica">Critica</option>
                      </select>
                    </div>
                    <div className="administration-field">
                      <label>Estado</label>
                      <select
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </section>
                </div>

                <section className="administration-form-block">
                  <header className="administration-form-block-head">
                    <div>
                      <h3>Cadena de aprobacion</h3>
                      <p className="administration-muted">Define la secuencia de responsables que tomaran la decision.</p>
                    </div>
                  </header>
                  <div className="administration-form-grid administration-form-grid-wide">
                    <div className="administration-field administration-field-span">
                      <label>Responsables del circuito</label>
                      <textarea
                        value={form.responsibleChainText}
                        onChange={(event) => setForm((current) => ({ ...current, responsibleChainText: event.target.value }))}
                        placeholder="Ejemplo: Lider directo, HR Director, Platform Administrator"
                        required
                      />
                    </div>
                    <div className="administration-field administration-field-span">
                      <div className="administration-flow-owner-card">
                        <span>Ownership del flujo</span>
                        <strong>{activeRole?.name || "Selecciona un rol propietario"}</strong>
                        <p className="administration-muted">
                          {activeRole?.scope || "El rol propietario define gobierno, visibilidad y responsabilidad primaria sobre el circuito."}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="administration-form-actions">
                  <button className="administration-primary-button" type="submit">
                    {form.id ? "Actualizar flujo" : "Guardar flujo"}
                  </button>
                  <button
                    className="administration-secondary-button"
                    type="button"
                    onClick={() => {
                      setSelectedFlowId("");
                      setForm(initialForm);
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
