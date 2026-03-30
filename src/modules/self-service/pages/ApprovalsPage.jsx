import { useState } from "react";
import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../selfService.css";
import SelfServiceApprovalTimeline from "../components/SelfServiceApprovalTimeline";
import SelfServiceEmployeePanel from "../components/SelfServiceEmployeePanel";
import SelfServiceEmptyState from "../components/SelfServiceEmptyState";
import SelfServiceHeader from "../components/SelfServiceHeader";
import SelfServiceRequestTable from "../components/SelfServiceRequestTable";
import useSelfServiceApprovals from "../hooks/useSelfServiceApprovals";
import useSelfServiceLocale from "../hooks/useSelfServiceLocale";
import {
  setSelfServiceEmployeeContext,
  transitionPermissionRequest,
} from "../services/selfService.service";

export default function ApprovalsPage() {
  const { t, language } = useSelfServiceLocale();
  const { data, loading, error, reload } = useSelfServiceApprovals();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState("");

  async function handleEmployeeChange(employeeId) {
    await setSelfServiceEmployeeContext(employeeId);
    reload();
  }

  async function handleAction(action) {
    const target =
      selectedRequest || data.requests.find((item) => item.requestType === "permission");
    if (!target || target.requestType !== "permission") {
      setFeedback(
        t(
          "Selecciona una solicitud de permiso para operar el workflow visible del colaborador.",
          "Select a permission request to operate the employee-facing workflow.",
        ),
      );
      return;
    }

    try {
      await transitionPermissionRequest(target.id, action, {
        note: t(
          "Accion ejecutada desde approvals.",
          "Action performed from approvals.",
        ),
      });
      setFeedback(t("Workflow actualizado.", "Workflow updated."));
      reload();
    } catch (transitionError) {
      setFeedback(transitionError.message);
    }
  }

  if (loading) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("Cargando aprobaciones", "Loading approvals")}
          description={t(
            "Preparando workflow visible del colaborador.",
            "Preparing visible employee workflow.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("No pudimos cargar aprobaciones", "Could not load approvals")}
          description={error?.message || ""}
        />
      </main>
    );
  }

  if (!data.employee) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceHeader
          eyebrow={t("Approvals & Workflow", "Approvals & Workflow")}
          title={t("Aprobaciones visibles", "Visible approvals")}
          description={t(
            "Trazabilidad de las solicitudes del colaborador y sus estados de decision.",
            "Traceability of employee requests and their decision states.",
          )}
        />
        <SelfServiceEmptyState
          title={t("Sin colaborador activo", "No active employee")}
          description={t(
            "Necesitas un colaborador activo para revisar aprobaciones visibles y flujo.",
            "You need an active employee to review visible approvals and workflow.",
          )}
          action={(
            <Link className="suite-button" to="/employees">
              {t("Ir a Employees", "Go to Employees")}
            </Link>
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page self-service-page">
      <SelfServiceHeader
        eyebrow={t("Approvals & Workflow", "Approvals & Workflow")}
        title={t("Aprobaciones visibles", "Visible approvals")}
        description={t(
          "Trazabilidad de las solicitudes del colaborador y sus estados de decision.",
          "Traceability of employee requests and their decision states.",
        )}
      />
      <SelfServiceEmployeePanel
        employee={data.employee}
        options={data.options?.employees || []}
        onChangeEmployee={handleEmployeeChange}
        t={t}
      />

      {feedback ? (
        <section className="suite-card">
          <p className="self-service-feedback">{feedback}</p>
        </section>
      ) : null}

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Solicitudes en flujo", "Requests in workflow")}</h2>
              </div>
            </div>
            <SelfServiceRequestTable
              items={data.requests.filter(
                (item) =>
                  !["approved", "rejected", "cancelled", "consumed"].includes(item.status),
              )}
              language={language}
            />
            <div className="self-service-form-actions">
              <button
                type="button"
                className="suite-button-secondary"
                onClick={() => handleAction("queue_manager")}
              >
                {t("Enviar a manager", "Queue manager review")}
              </button>
              <button
                type="button"
                className="suite-button-secondary"
                onClick={() => handleAction("approve_manager")}
              >
                {t("Aprobar manager", "Approve manager")}
              </button>
              <button
                type="button"
                className="suite-button-secondary"
                onClick={() => handleAction("approve_hr")}
              >
                {t("Aprobar HR", "Approve HR")}
              </button>
              <button
                type="button"
                className="suite-button-secondary"
                onClick={() => handleAction("return")}
              >
                {t("Devolver", "Return")}
              </button>
              <button
                type="button"
                className="suite-button-secondary"
                onClick={() => handleAction("reject")}
              >
                {t("Rechazar", "Reject")}
              </button>
            </div>
          </section>
          <SelfServiceApprovalTimeline
            request={selectedRequest || data.requests[0]}
            language={language}
            t={t}
          />
        </div>
      </section>

      <section className="suite-card">
        <div className="suite-list">
          {data.requests.map((item) => (
            <article
              key={item.id}
              className="suite-list-item"
              onClick={() => setSelectedRequest(item)}
            >
              <span>{item.requestType}</span>
              <strong>{item.title}</strong>
              <p className="suite-muted">{item.currentApprover || "-"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
