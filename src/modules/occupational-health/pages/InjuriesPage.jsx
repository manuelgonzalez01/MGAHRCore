import { useState } from "react";
import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthCaseCard from "../components/HealthCaseCard";
import HealthHeader from "../components/HealthHeader";
import HealthFilters from "../components/HealthFilters";
import InjuriesTable from "../components/InjuriesTable";
import useHealthLocale from "../hooks/useHealthLocale";
import useInjuries from "../hooks/useInjuries";
import { exportOccupationalHealthSection, saveInjuryRecord } from "../services/occupationalHealth.service";
import { triggerTextDownload } from "../utils/download.helpers";

function createInitialForm() {
  return {
    id: "",
    employeeId: "",
    incidentType: "",
    severity: "low",
    occurredAt: "",
    location: "",
    cause: "",
    correctiveAction: "",
    status: "open",
    lostDays: 0,
  };
}

export default function InjuriesPage() {
  const { t } = useHealthLocale();
  const { data, loading, error, reload } = useInjuries();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }));
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      employeeId: item.employeeId,
      incidentType: item.incidentType,
      severity: item.severity,
      occurredAt: item.occurredAt,
      location: item.location,
      cause: item.cause,
      correctiveAction: item.correctiveAction,
      status: item.status,
      lostDays: item.lostDays,
    });
    setFeedback(t("Editando incidente seleccionado.", "Editing selected incident."));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await saveInjuryRecord(form);
      setFeedback(form.id ? t("Incidente actualizado.", "Incident updated.") : t("Incidente registrado.", "Incident created."));
      setForm(createInitialForm());
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const exported = await exportOccupationalHealthSection("injuries");
    triggerTextDownload(exported.fileName, exported.content);
  };

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando incidentes", "Loading injuries")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar incidentes", "Could not load injuries")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader
        eyebrow={t("Incidents", "Incidents")}
        title={t("Incidentes y lesiones", "Injuries and incidents")}
        description={t("Control de severidad, causa, accion correctiva y seguimiento.", "Control severity, cause, corrective action, and follow-up.")}
        actions={<button type="button" className="suite-button" onClick={handleExport}>{t("Exportar incidentes", "Export injuries")}</button>}
      />
      <HealthFilters options={data.options} t={t} />
      <section className="suite-card health-form-card">
        <div className="suite-head">
          <div>
            <h2>{form.id ? t("Editar incidente", "Edit incident") : t("Registrar incidente", "Register incident")}</h2>
            <p className="suite-muted">{t("Captura operativa de incidentes, severidad y accion correctiva.", "Operational capture of incidents, severity, and corrective action.")}</p>
          </div>
        </div>
        <form className="health-form-grid" onSubmit={handleSubmit}>
          <label><span>{t("Empleado", "Employee")}</span><select name="employeeId" value={form.employeeId} onChange={handleChange}><option value="">{t("Selecciona", "Select")}</option>{data.options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>{t("Tipo", "Type")}</span><input name="incidentType" value={form.incidentType} onChange={handleChange} /></label>
          <label><span>{t("Severidad", "Severity")}</span><select name="severity" value={form.severity} onChange={handleChange}><option value="low">{t("Baja", "Low")}</option><option value="moderate">{t("Moderada", "Moderate")}</option><option value="high">{t("Alta", "High")}</option></select></label>
          <label><span>{t("Fecha", "Date")}</span><input name="occurredAt" type="date" value={form.occurredAt} onChange={handleChange} /></label>
          <label><span>{t("Ubicacion", "Location")}</span><input name="location" value={form.location} onChange={handleChange} /></label>
          <label><span>{t("Estado", "Status")}</span><select name="status" value={form.status} onChange={handleChange}><option value="open">{t("Abierto", "Open")}</option><option value="monitoring">{t("Seguimiento", "Monitoring")}</option><option value="closed">{t("Cerrado", "Closed")}</option></select></label>
          <label className="health-form-span-2"><span>{t("Causa", "Cause")}</span><input name="cause" value={form.cause} onChange={handleChange} /></label>
          <label className="health-form-span-2"><span>{t("Accion correctiva", "Corrective action")}</span><textarea name="correctiveAction" value={form.correctiveAction} onChange={handleChange} rows="3" /></label>
          <label><span>{t("Dias perdidos", "Lost days")}</span><input name="lostDays" type="number" min="0" value={form.lostDays} onChange={handleChange} /></label>
          <div className="health-form-actions">
            <button type="submit" className="suite-button" disabled={saving}>{saving ? t("Guardando...", "Saving...") : form.id ? t("Actualizar", "Update") : t("Registrar", "Register")}</button>
            <button type="button" className="suite-button-secondary" onClick={() => setForm(createInitialForm())}>{t("Limpiar", "Clear")}</button>
          </div>
          {feedback ? <p className="health-form-feedback">{feedback}</p> : null}
        </form>
      </section>
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <InjuriesTable items={data.items} t={t} onEdit={handleEdit} />
          </section>
          <section className="suite-card">
            <h2>{t("Casos de incidentes", "Incident cases")}</h2>
            <div className="health-case-grid">
              {data.cases.map((item) => <HealthCaseCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
