import { useState } from "react";
import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../selfService.css";
import SelfServiceEmployeePanel from "../components/SelfServiceEmployeePanel";
import SelfServiceEmptyState from "../components/SelfServiceEmptyState";
import SelfServiceHeader from "../components/SelfServiceHeader";
import SelfServiceRequestTable from "../components/SelfServiceRequestTable";
import useSelfServiceLocale from "../hooks/useSelfServiceLocale";
import useSelfServiceVacationRequests from "../hooks/useSelfServiceVacationRequests";
import {
  createVacationSelfServiceRequest,
  setSelfServiceEmployeeContext,
  simulateSelfServiceVacationRequest,
} from "../services/selfService.service";

function createInitialForm() {
  return {
    employeeId: "",
    startDate: "",
    endDate: "",
    note: "",
    accumulatedPeriods: 1,
  };
}

export default function VacationRequestsPage() {
  const { t, language } = useSelfServiceLocale();
  const { data, loading, error, reload } = useSelfServiceVacationRequests();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleEmployeeChange(employeeId) {
    await setSelfServiceEmployeeContext(employeeId);
    setForm((current) => ({ ...current, employeeId }));
    reload();
  }

  function handleChange({ target }) {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  }

  async function handlePreview() {
    try {
      const simulated = await simulateSelfServiceVacationRequest({
        ...form,
        employeeId: form.employeeId || data.employee?.id,
      });
      setPreview(simulated);
      setFeedback("");
    } catch (simulationError) {
      setFeedback(simulationError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await createVacationSelfServiceRequest({
        ...form,
        employeeId: form.employeeId || data.employee?.id,
        requestedBy: data.employee?.name,
      });
      setForm((current) => ({
        ...createInitialForm(),
        employeeId: current.employeeId || data.employee?.id || "",
      }));
      setPreview(null);
      setFeedback(
        t(
          "Solicitud vacacional enviada al workflow.",
          "Vacation request submitted to workflow.",
        ),
      );
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("Cargando vacaciones", "Loading leave requests")}
          description={t(
            "Preparando balance, solicitudes e impacto.",
            "Preparing balances, requests, and impact.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("No pudimos cargar vacaciones", "Could not load leave requests")}
          description={error?.message || ""}
        />
      </main>
    );
  }

  if (!data.employee) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceHeader
          eyebrow={t("Vacation Requests", "Vacation Requests")}
          title={t("Solicitudes de vacaciones", "Vacation requests")}
          description={t(
            "Registro de solicitud, impacto sobre balance y trazabilidad del flujo.",
            "Request registration, balance impact, and workflow traceability.",
          )}
        />
        <SelfServiceEmptyState
          title={t("Sin colaborador activo", "No active employee")}
          description={t(
            "Debes activar un colaborador real en Employees antes de registrar solicitudes vacacionales.",
            "You need one real active employee in Employees before registering leave requests.",
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

  const employeeId = form.employeeId || data.employee.id;

  return (
    <main className="suite-page self-service-page">
      <SelfServiceHeader
        eyebrow={t("Vacation Requests", "Vacation Requests")}
        title={t("Solicitudes de vacaciones", "Vacation requests")}
        description={t(
          "Registro de solicitud, impacto sobre balance y trazabilidad del flujo.",
          "Request registration, balance impact, and workflow traceability.",
        )}
      />
      <SelfServiceEmployeePanel
        employee={data.employee}
        options={data.options?.employees || []}
        onChangeEmployee={handleEmployeeChange}
        t={t}
      />

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Nueva solicitud", "New request")}</h2>
                <p className="suite-muted">
                  {t(
                    "Genera la solicitud desde autoservicio y enrutala al flujo de aprobacion.",
                    "Generate the request from self-service and route it into approval.",
                  )}
                </p>
              </div>
            </div>
            <form className="self-service-form-grid" onSubmit={handleSubmit}>
              <label>
                <span>{t("Colaborador", "Employee")}</span>
                <select name="employeeId" value={employeeId} onChange={handleChange}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.options.employees
                    .filter((item) => item.value)
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>{t("Inicio", "Start date")}</span>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>{t("Fin", "End date")}</span>
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>{t("Periodos acumulados", "Accumulated periods")}</span>
                <input
                  name="accumulatedPeriods"
                  type="number"
                  min="1"
                  value={form.accumulatedPeriods}
                  onChange={handleChange}
                />
              </label>
              <label className="self-service-form-span-2">
                <span>{t("Justificacion", "Justification")}</span>
                <textarea
                  name="note"
                  rows="3"
                  value={form.note}
                  onChange={handleChange}
                />
              </label>
              <div className="self-service-form-actions">
                <button
                  type="button"
                  className="suite-button-secondary"
                  onClick={handlePreview}
                >
                  {t("Simular impacto", "Simulate impact")}
                </button>
                <button type="submit" className="suite-button" disabled={saving}>
                  {saving ? t("Enviando...", "Submitting...") : t("Enviar solicitud", "Submit request")}
                </button>
              </div>
              {feedback ? <p className="self-service-feedback">{feedback}</p> : null}
            </form>
          </section>

          <section className="suite-card">
            <div className="suite-head">
              <div>
                <h2>{t("Impacto visible", "Visible impact")}</h2>
                <p className="suite-muted">
                  {t(
                    "Simulacion de balance y alertas antes de enviar.",
                    "Balance simulation and alerts before submission.",
                  )}
                </p>
              </div>
            </div>
            {preview ? (
              <div className="suite-list">
                <article className="suite-list-item">
                  <span>{t("Dias solicitados", "Requested days")}</span>
                  <strong>
                    {preview.request?.chargeableDays || preview.request?.balanceImpactDays || 0}
                  </strong>
                </article>
                <article className="suite-list-item">
                  <span>{t("Saldo restante", "Remaining balance")}</span>
                  <strong>{preview.preview?.remainingBalance ?? "-"}</strong>
                </article>
                <article className="suite-list-item">
                  <span>{t("Cobertura", "Coverage")}</span>
                  <strong>{preview.validation?.coverageRatio ?? "-"}</strong>
                </article>
              </div>
            ) : (
              <SelfServiceEmptyState
                title={t("Sin simulacion", "No simulation yet")}
                description={t(
                  "Completa fechas y simula el impacto antes de enviar.",
                  "Complete the dates and simulate the impact before submitting.",
                )}
              />
            )}
          </section>
        </div>
      </section>

      <section className="suite-card">
        <div className="suite-head">
          <div>
            <h2>{t("Solicitudes vacacionales", "Vacation requests")}</h2>
            <p className="suite-muted">
              {t(
                "Historico del colaborador dentro del flujo vacacional.",
                "Employee history inside the vacation workflow.",
              )}
            </p>
          </div>
        </div>
        <SelfServiceRequestTable items={data.requests} language={language} />
      </section>
    </main>
  );
}
