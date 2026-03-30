import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionForm from "../components/PersonnelActionForm";
import PersonnelActionAuditTimeline from "../components/PersonnelActionAuditTimeline";
import PersonnelActionsFilters from "../components/PersonnelActionsFilters";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import PersonnelActionsTable from "../components/PersonnelActionsTable";
import usePersonnelActionsList from "../hooks/usePersonnelActionsList";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";
import { savePersonnelAction } from "../services/personnelActions.service";

function createInitialForm() {
  return {
    employeeId: "",
    actionType: "",
    effectiveDate: "",
    status: "draft",
    reason: "",
    businessJustification: "",
    targetCompanyId: "",
    targetDepartmentId: "",
    targetLocationId: "",
    targetPositionId: "",
    targetLevelId: "",
    targetSupervisor: "",
    targetSalary: "",
    targetStatus: "",
    notes: "",
  };
}

export default function PersonnelActionsListPage() {
  const { t } = usePersonnelActionsLocale();
  const [searchParams] = useSearchParams();
  const { data, loading, error, filters, setFilter, resetFilters, reload } = usePersonnelActionsList();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const employeeParam = searchParams.get("employee") || "";

  useEffect(() => {
    if (employeeParam) {
      setForm((current) => ({ ...current, employeeId: employeeParam }));
      setFilter("employeeId", employeeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeParam]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setSubmitError("");
    try {
      await savePersonnelAction(form);
      setFeedback(t("Accion guardada correctamente.", "Action saved successfully."));
      setForm(createInitialForm());
      reload();
    } catch (failure) {
      setSubmitError(failure.message);
    }
  }

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando bandeja de acciones", "Loading action queue")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar el listado", "Could not load action list")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader
        eyebrow={t("Action Requests", "Action Requests")}
        title={t("Bandeja general de acciones", "General action queue")}
        description={t("Gestiona solicitudes, filtros operativos, captura de impacto y trazabilidad completa.", "Manage requests, operational filters, impact capture, and full traceability.")}
      />
      <PersonnelActionsFilters filters={filters} options={data.options} onChange={setFilter} onReset={resetFilters} t={t} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Listado operativo", "Operational list")}</h2>
            <PersonnelActionsTable items={data.actions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
          </section>
          <PersonnelActionAuditTimeline items={data.auditLog.slice(0, 15)} t={t} />
        </div>
        <PersonnelActionForm form={form} setForm={setForm} options={data.options} onSubmit={handleSubmit} t={t} feedback={feedback} error={submitError} />
      </section>
    </main>
  );
}
