import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../selfService.css";
import SelfServiceEmployeePanel from "../components/SelfServiceEmployeePanel";
import SelfServiceEmptyState from "../components/SelfServiceEmptyState";
import SelfServiceHeader from "../components/SelfServiceHeader";
import SelfServiceQuickActions from "../components/SelfServiceQuickActions";
import SelfServiceRequestTable from "../components/SelfServiceRequestTable";
import SelfServiceStatsCards from "../components/SelfServiceStatsCards";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useSelfServiceDashboard from "../hooks/useSelfServiceDashboard";
import useSelfServiceLocale from "../hooks/useSelfServiceLocale";
import {
  exportSelfServiceWorkspace,
  setSelfServiceEmployeeContext,
} from "../services/selfService.service";
import { triggerJsonDownload } from "../utils/selfService.helpers";

function MissingEmployeeState({ t }) {
  return (
    <SelfServiceEmptyState
      title={t("Sin colaborador activo", "No active employee")}
      description={t(
        "Autoservicio necesita un colaborador real activo para construir solicitudes, permisos, vacaciones y aprobaciones visibles.",
        "Self-Service needs one active real employee to build requests, permissions, leave, and visible approvals.",
      )}
      action={(
        <Link className="suite-button" to="/employees">
          {t("Ir a Employees", "Go to Employees")}
        </Link>
      )}
    />
  );
}

export default function SelfServicePage() {
  const { t, language } = useSelfServiceLocale();
  const { data, loading, error, reload } = useSelfServiceDashboard();

  async function handleEmployeeChange(employeeId) {
    await setSelfServiceEmployeeContext(employeeId);
    reload();
  }

  async function handleExport() {
    const file = await exportSelfServiceWorkspace("dashboard");
    triggerJsonDownload(file.fileName, file.content);
  }

  if (loading) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("Cargando autoservicio", "Loading self-service")}
          description={t(
            "Estamos consolidando solicitudes, vacaciones y aprobaciones.",
            "We are consolidating requests, leave, and approvals.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("No pudimos cargar autoservicio", "Could not load self-service")}
          description={
            error?.message
            || t(
              "El modulo encontro un problema al construir la experiencia del colaborador.",
              "The module found an issue while building the employee experience.",
            )
          }
        />
      </main>
    );
  }

  if (!data.employee) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceHeader
          eyebrow={t("Employee Experience", "Employee Experience")}
          title={t("Autoservicio del colaborador", "Employee self-service")}
          description={t(
            "Un centro operativo para solicitudes personales, vacaciones, permisos y aprobaciones visibles desde la experiencia del colaborador.",
            "An operational hub for personal requests, leave, permissions, and approvals visible from the employee experience.",
          )}
        />
        <MissingEmployeeState t={t} />
      </main>
    );
  }

  return (
    <main className="suite-page self-service-page">
      <SelfServiceHeader
        eyebrow={t("Employee Experience", "Employee Experience")}
        title={t("Autoservicio del colaborador", "Employee self-service")}
        description={t(
          "Un centro operativo para solicitudes personales, vacaciones, permisos y aprobaciones visibles desde la experiencia del colaborador.",
          "An operational hub for personal requests, leave, permissions, and approvals visible from the employee experience.",
        )}
        actions={(
          <>
            <button
              type="button"
              className="suite-button-secondary"
              onClick={handleExport}
            >
              {t("Exportar", "Export")}
            </button>
            <Link className="suite-button" to="/self-service/requests">
              {t("Abrir bandeja", "Open inbox")}
            </Link>
          </>
        )}
      />

      <SelfServiceEmployeePanel
        employee={data.employee}
        options={data.options?.employees || []}
        onChangeEmployee={handleEmployeeChange}
        t={t}
      />

      <SelfServiceStatsCards
        items={[
          {
            label: t("Solicitudes pendientes", "Pending requests"),
            value: data.stats.pendingRequests,
            helper: t(
              "Requieren accion o seguimiento",
              "Require action or follow-up",
            ),
          },
          {
            label: t("Solicitudes aprobadas", "Approved requests"),
            value: data.stats.approvedRequests,
            helper: t("Ya cerradas o consumidas", "Closed or already consumed"),
          },
          {
            label: t("Saldo vacacional", "Vacation balance"),
            value: data.stats.vacationBalance,
            helper: t("Dias disponibles visibles", "Visible available days"),
          },
          {
            label: t("Aprobaciones visibles", "Visible approvals"),
            value: data.stats.approvalsVisible,
            helper: t(
              "Flujos en curso del colaborador",
              "Employee workflows in progress",
            ),
          },
        ]}
      />

      <section className="suite-layout">
        <div className="suite-grid">
          <SelfServiceQuickActions items={data.quickActions} t={t} />
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Bandeja consolidada", "Unified inbox")}</h2>
                <p className="suite-muted">
                  {t(
                    "Vacaciones, permisos y cambios personales con lectura transversal.",
                    "Leave, permissions, and personal changes with a cross-domain readout.",
                  )}
                </p>
              </div>
            </div>
            <SelfServiceRequestTable
              items={data.requests.slice(0, 6)}
              language={language}
            />
          </section>
        </div>

        <div className="suite-rail">
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Aprobaciones visibles", "Visible approvals")}</h2>
                <p className="suite-muted">
                  {t(
                    "Estado actual de las solicitudes que siguen en flujo.",
                    "Current state of the requests still moving through workflow.",
                  )}
                </p>
              </div>
            </div>
            <div className="suite-list">
              {data.approvals.map((item) => (
                <article key={item.id} className="suite-list-item">
                  <span>{item.module}</span>
                  <strong>{item.type}</strong>
                  <p className="suite-muted">
                    {item.currentLevel} | {item.requester}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ModuleConnectionsPanel moduleKey="self-service" language={language} />
    </main>
  );
}
