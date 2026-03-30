import PermissionBadge from "./PermissionBadge";
import { getApprovalRequestMeta } from "../utils/administration.helpers";

export default function ApprovalRulesTable({ items = [], onStatusChange, selectedRequestId, onSelect }) {
  return (
    <div className="administration-table-shell administration-table-shell-approval">
      <table className="administration-table administration-table-approval">
        <thead>
          <tr>
            <th>Solicitud</th>
            <th>Modulo</th>
            <th>Solicitante</th>
            <th>Responsable actual</th>
            <th>Nivel</th>
            <th>Prioridad</th>
            <th>SLA</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const meta = getApprovalRequestMeta(item);
            const isSelected = selectedRequestId === item.id;

            return (
              <tr
                key={item.id}
                className={isSelected ? "administration-table-row-active" : ""}
                onClick={() => onSelect?.(item)}
              >
                <td>
                  <div className="administration-table-primary administration-table-primary-approval">
                    <strong>{item.type}</strong>
                    <span
                      className={`administration-muted ${isSelected ? "administration-table-summary-expanded" : "administration-table-summary-clamp"}`}
                      title={meta.summary}
                    >
                      {meta.summary}
                    </span>
                    {!isSelected ? (
                      <button
                        type="button"
                        className="administration-inline-link"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect?.(item);
                        }}
                      >
                        Ver detalle
                      </button>
                    ) : null}
                  </div>
                </td>
                <td><span className="administration-table-compact-text">{item.module}</span></td>
                <td><span className="administration-table-compact-text">{item.requester}</span></td>
                <td><span className="administration-table-compact-text">{item.currentLevel}</span></td>
                <td>
                  <span className={`administration-badge ${meta.tone}`}>{item.currentStep}/{item.totalLevels}</span>
                </td>
                <td>
                  <span className={`administration-badge ${meta.tone}`}>{item.priority}</span>
                </td>
                <td>
                  <span className={`administration-badge ${meta.tone}`}>{meta.slaLabel}</span>
                </td>
                <td><PermissionBadge value={item.status} /></td>
                <td>
                  <div className="administration-inline-actions administration-inline-actions-compact">
                    {item.status === "pending" && onStatusChange ? (
                      <>
                        <button
                          type="button"
                          className="administration-secondary-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onStatusChange?.(item.id, "approved");
                          }}
                        >
                          {item.currentStep < item.totalLevels ? "Avanzar nivel" : "Aprobar"}
                        </button>
                        <button
                          type="button"
                          className="administration-secondary-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onStatusChange?.(item.id, "rejected");
                          }}
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span className="administration-muted">{item.status === "pending" ? "En seguimiento" : "Resuelta"}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
