import { useState } from "react";
import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthFilters from "../components/HealthFilters";
import HealthHeader from "../components/HealthHeader";
import LaboratoryTestsTable from "../components/LaboratoryTestsTable";
import useHealthLocale from "../hooks/useHealthLocale";
import useLaboratoryTests from "../hooks/useLaboratoryTests";
import { exportOccupationalHealthSection, saveLaboratoryTestRecord } from "../services/occupationalHealth.service";
import { triggerTextDownload } from "../utils/download.helpers";

function createInitialForm() {
  return {
    id: "",
    employeeId: "",
    testType: "",
    scheduledAt: "",
    result: "",
    status: "scheduled",
    laboratory: "MGA Clinical Labs",
  };
}

export default function LaboratoryTestsPage() {
  const { t } = useHealthLocale();
  const { data, loading, error, reload } = useLaboratoryTests();
  const [form, setForm] = useState(createInitialForm());
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }));

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      employeeId: item.employeeId,
      testType: item.testType,
      scheduledAt: item.scheduledAt,
      result: item.result,
      status: item.status,
      laboratory: item.laboratory || "MGA Clinical Labs",
    });
    setFeedback(t("Editando examen de laboratorio.", "Editing laboratory test."));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await saveLaboratoryTestRecord(form);
      setFeedback(form.id ? t("Laboratorio actualizado.", "Laboratory test updated.") : t("Laboratorio registrado.", "Laboratory test created."));
      setForm(createInitialForm());
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const exported = await exportOccupationalHealthSection("laboratory-tests");
    triggerTextDownload(exported.fileName, exported.content);
  };

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando laboratorio", "Loading laboratory tests")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar laboratorio", "Could not load laboratory tests")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader eyebrow={t("Laboratory", "Laboratory")} title={t("Laboratorio", "Laboratory tests")} description={t("Panel operativo de pruebas, resultados y cumplimiento.", "Operational panel for tests, results, and compliance.")} actions={<button type="button" className="suite-button" onClick={handleExport}>{t("Exportar laboratorio", "Export laboratory")}</button>} />
      <HealthFilters options={data.options} t={t} />
      <section className="suite-card health-form-card">
        <div className="suite-head">
          <div>
            <h2>{form.id ? t("Editar laboratorio", "Edit laboratory test") : t("Registrar laboratorio", "Register laboratory test")}</h2>
            <p className="suite-muted">{t("Registra panel, laboratorio, fecha y resultado del examen.", "Register panel, laboratory, date, and result.")}</p>
          </div>
        </div>
        <form className="health-form-grid" onSubmit={handleSubmit}>
          <label><span>{t("Empleado", "Employee")}</span><select name="employeeId" value={form.employeeId} onChange={handleChange}><option value="">{t("Selecciona", "Select")}</option>{data.options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>{t("Panel", "Panel")}</span><input name="testType" value={form.testType} onChange={handleChange} /></label>
          <label><span>{t("Fecha", "Date")}</span><input name="scheduledAt" type="date" value={form.scheduledAt} onChange={handleChange} /></label>
          <label><span>{t("Estado", "Status")}</span><select name="status" value={form.status} onChange={handleChange}><option value="scheduled">{t("Programado", "Scheduled")}</option><option value="completed">{t("Completado", "Completed")}</option></select></label>
          <label><span>{t("Laboratorio", "Laboratory")}</span><input name="laboratory" value={form.laboratory} onChange={handleChange} /></label>
          <label className="health-form-span-2"><span>{t("Resultado", "Result")}</span><textarea name="result" value={form.result} onChange={handleChange} rows="3" /></label>
          <div className="health-form-actions">
            <button type="submit" className="suite-button" disabled={saving}>{saving ? t("Guardando...", "Saving...") : form.id ? t("Actualizar", "Update") : t("Registrar", "Register")}</button>
            <button type="button" className="suite-button-secondary" onClick={() => setForm(createInitialForm())}>{t("Limpiar", "Clear")}</button>
          </div>
          {feedback ? <p className="health-form-feedback">{feedback}</p> : null}
        </form>
      </section>
      <section className="suite-card">
        <LaboratoryTestsTable items={data.items} t={t} onEdit={handleEdit} />
      </section>
    </main>
  );
}
