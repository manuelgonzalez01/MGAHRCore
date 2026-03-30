import { useState } from "react";
import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthCaseCard from "../components/HealthCaseCard";
import HealthHeader from "../components/HealthHeader";
import HealthFilters from "../components/HealthFilters";
import MedicalVisitsTable from "../components/MedicalVisitsTable";
import useHealthLocale from "../hooks/useHealthLocale";
import useMedicalVisits from "../hooks/useMedicalVisits";
import { exportOccupationalHealthSection, saveMedicalVisitRecord } from "../services/occupationalHealth.service";
import { triggerTextDownload } from "../utils/download.helpers";

function createInitialForm() {
  return {
    id: "",
    employeeId: "",
    visitType: "",
    occurredAt: "",
    result: "fit",
    restrictions: "",
    followUpDate: "",
    physician: "Dr. Occupational Care",
    caseStatus: "completed",
  };
}

export default function MedicalVisitsPage() {
  const { t } = useHealthLocale();
  const { data, loading, error, reload } = useMedicalVisits();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      employeeId: item.employeeId,
      visitType: item.visitType,
      occurredAt: item.occurredAt,
      result: item.result,
      restrictions: item.restrictions,
      followUpDate: item.followUpDate || "",
      physician: item.physician || "Dr. Occupational Care",
      caseStatus: item.caseStatus,
    });
    setFeedback(t("Editando visita seleccionada.", "Editing selected visit."));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await saveMedicalVisitRecord(form);
      setFeedback(form.id ? t("Visita actualizada.", "Visit updated.") : t("Visita registrada.", "Visit created."));
      setForm(createInitialForm());
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const exported = await exportOccupationalHealthSection("medical-visits");
    triggerTextDownload(exported.fileName, exported.content);
  };

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando visitas medicas", "Loading medical visits")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar visitas", "Could not load visits")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader eyebrow={t("Medical Visits", "Medical Visits")} title={t("Visitas medicas", "Medical visits")} description={t("Control de resultados, restricciones laborales y seguimiento.", "Control results, work restrictions, and follow-up.")} actions={<button type="button" className="suite-button" onClick={handleExport}>{t("Exportar visitas", "Export visits")}</button>} />
      <HealthFilters options={data.options} t={t} />
      <section className="suite-card health-form-card">
        <div className="suite-head">
          <div>
            <h2>{form.id ? t("Editar visita", "Edit visit") : t("Registrar visita", "Register visit")}</h2>
            <p className="suite-muted">{t("Seguimiento medico con resultado, restricciones y control posterior.", "Medical follow-up with result, restrictions, and next control.")}</p>
          </div>
        </div>
        <form className="health-form-grid" onSubmit={handleSubmit}>
          <label><span>{t("Empleado", "Employee")}</span><select name="employeeId" value={form.employeeId} onChange={handleChange}><option value="">{t("Selecciona", "Select")}</option>{data.options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>{t("Tipo de visita", "Visit type")}</span><input name="visitType" value={form.visitType} onChange={handleChange} /></label>
          <label><span>{t("Fecha", "Date")}</span><input name="occurredAt" type="date" value={form.occurredAt} onChange={handleChange} /></label>
          <label><span>{t("Resultado", "Result")}</span><select name="result" value={form.result} onChange={handleChange}><option value="fit">{t("Apto", "Fit")}</option><option value="restricted">{t("Restringido", "Restricted")}</option><option value="unfit">{t("No apto", "Unfit")}</option></select></label>
          <label><span>{t("Estado del caso", "Case status")}</span><select name="caseStatus" value={form.caseStatus} onChange={handleChange}><option value="completed">{t("Completado", "Completed")}</option><option value="follow_up">{t("Seguimiento", "Follow-up")}</option></select></label>
          <label><span>{t("Proximo control", "Next follow-up")}</span><input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} /></label>
          <label><span>{t("Medico", "Physician")}</span><input name="physician" value={form.physician} onChange={handleChange} /></label>
          <label className="health-form-span-2"><span>{t("Restricciones", "Restrictions")}</span><textarea name="restrictions" value={form.restrictions} onChange={handleChange} rows="3" /></label>
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
            <MedicalVisitsTable items={data.items} t={t} onEdit={handleEdit} />
          </section>
          <section className="suite-card">
            <h2>{t("Casos en seguimiento", "Follow-up cases")}</h2>
            <div className="health-case-grid">
              {data.cases.map((item) => <HealthCaseCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
