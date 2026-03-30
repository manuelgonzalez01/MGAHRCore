import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../selfService.css";
import SelfServiceEmployeePanel from "../components/SelfServiceEmployeePanel";
import SelfServiceEmptyState from "../components/SelfServiceEmptyState";
import SelfServiceHeader from "../components/SelfServiceHeader";
import SelfServiceRequestTable from "../components/SelfServiceRequestTable";
import useSelfServiceLocale from "../hooks/useSelfServiceLocale";
import useSelfServiceRequests from "../hooks/useSelfServiceRequests";
import { setSelfServiceEmployeeContext } from "../services/selfService.service";

export default function RequestsPage() {
  const { t, language } = useSelfServiceLocale();
  const { data, loading, error, reload } = useSelfServiceRequests();

  async function handleEmployeeChange(employeeId) {
    await setSelfServiceEmployeeContext(employeeId);
    reload();
  }

  if (loading) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("Cargando bandeja", "Loading inbox")}
          description={t(
            "Preparando solicitudes del colaborador.",
            "Preparing employee requests.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("No pudimos cargar la bandeja", "Could not load inbox")}
          description={error?.message || ""}
        />
      </main>
    );
  }

  if (!data.employee) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceHeader
          eyebrow={t("Requests Workspace", "Requests Workspace")}
          title={t("Bandeja de solicitudes", "Requests inbox")}
          description={t(
            "Lectura consolidada de vacaciones, permisos y cambios personales.",
            "Consolidated readout of leave, permissions, and personal changes.",
          )}
        />
        <SelfServiceEmptyState
          title={t("Sin colaborador activo", "No active employee")}
          description={t(
            "Activa un colaborador en Employees para consultar su bandeja de solicitudes.",
            "Activate an employee in Employees to review the request inbox.",
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
        eyebrow={t("Requests Workspace", "Requests Workspace")}
        title={t("Bandeja de solicitudes", "Requests inbox")}
        description={t(
          "Lectura consolidada de vacaciones, permisos y cambios personales.",
          "Consolidated readout of leave, permissions, and personal changes.",
        )}
      />
      <SelfServiceEmployeePanel
        employee={data.employee}
        options={data.options?.employees || []}
        onChangeEmployee={handleEmployeeChange}
        t={t}
      />
      <section className="suite-card">
        <SelfServiceRequestTable items={data.requests} language={language} />
      </section>
    </main>
  );
}
