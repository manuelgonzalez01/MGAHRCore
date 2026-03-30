import PermissionBadge from "./PermissionBadge";
import { getFlowGovernanceMeta } from "../utils/administration.helpers";

export default function ApprovalFlowCard({ flow, roles = [], queue = [], onSelect, selected }) {
  const meta = getFlowGovernanceMeta(flow, roles, queue);

  return (
    <article
      className={`administration-flow-card administration-flow-card-${meta.tone}${selected ? " administration-flow-card-selected" : ""}`}
    >
      <div className="administration-flow-card-top">
        <div>
          <span>{flow.module}</span>
          <strong>{flow.name}</strong>
          <p className="administration-muted">{flow.requestType}</p>
        </div>
        <PermissionBadge value={flow.status} />
      </div>

      <div className="administration-flow-card-metrics">
        <div>
          <span>Criticidad</span>
          <strong>{meta.criticalityLabel}</strong>
        </div>
        <div>
          <span>Pendientes</span>
          <strong>{meta.pendingItems}</strong>
        </div>
        <div>
          <span>Niveles</span>
          <strong>{flow.levels}</strong>
        </div>
      </div>

      <p className="administration-muted">
        Ownership: <strong>{meta.ownerRoleName}</strong>
      </p>
      <p className="administration-muted">
        {flow.responsibleChain.join(" -> ")}
      </p>

      <div className="administration-inline-actions">
        <span className={`administration-badge ${meta.tone}`}>{flow.priority}</span>
        {onSelect ? (
          <button type="button" className="administration-secondary-button" onClick={() => onSelect(flow)}>
            {selected ? "Detalle abierto" : "Ver detalle"}
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="administration-flow-card-expanded">
          <article className="administration-list-item">
            <span>Lectura operativa</span>
            <strong>{meta.escalationSignal}</strong>
            <p className="administration-muted">
              Vista rapida del comportamiento actual del circuito para entender su carga y tension operativa sin salir del catalogo.
            </p>
          </article>

          <article className="administration-list-item">
            <span>Lo que controla este flujo</span>
            <strong>{flow.requestType}</strong>
            <p className="administration-muted">
              Este circuito interviene sobre el modulo {flow.module} y coordina {flow.levels} niveles antes del cierre.
            </p>
          </article>

          <article className="administration-list-item">
            <span>Ruta de aprobacion</span>
            <div className="administration-timeline-list">
              {flow.responsibleChain.map((step, index) => (
                <div key={`${flow.id}-expanded-${step}`} className="administration-timeline-step">
                  <strong>Nivel {index + 1}</strong>
                  <p className="administration-muted">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </article>
  );
}
