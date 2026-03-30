import { useState } from "react";
import "../../shared/hrSuite.css";
import "../occupationalHealth.css";
import HealthFilters from "../components/HealthFilters";
import HealthHeader from "../components/HealthHeader";
import MedicinesTable from "../components/MedicinesTable";
import useHealthLocale from "../hooks/useHealthLocale";
import useMedicinesControl from "../hooks/useMedicinesControl";
import { exportOccupationalHealthSection, saveConditionRecord, saveMedicineRecord } from "../services/occupationalHealth.service";
import { triggerTextDownload } from "../utils/download.helpers";

function createMedicineForm() {
  return {
    id: "",
    employeeId: "",
    medicine: "",
    deliveredAt: "",
    quantity: 1,
    status: "active",
    notes: "",
  };
}

function createConditionForm() {
  return {
    id: "",
    employeeId: "",
    conditionType: "",
    status: "monitoring",
    restriction: "",
    owner: "Occupational Health",
    followUpDate: "",
  };
}

export default function MedicinesControlPage() {
  const { t } = useHealthLocale();
  const { data, loading, error, reload } = useMedicinesControl();
  const [medicineForm, setMedicineForm] = useState(createMedicineForm());
  const [conditionForm, setConditionForm] = useState(createConditionForm());
  const [feedback, setFeedback] = useState("");
  const [savingMedicine, setSavingMedicine] = useState(false);
  const [savingCondition, setSavingCondition] = useState(false);

  const handleMedicineChange = ({ target }) => setMedicineForm((current) => ({ ...current, [target.name]: target.value }));
  const handleConditionChange = ({ target }) => setConditionForm((current) => ({ ...current, [target.name]: target.value }));

  const handleMedicineEdit = (item) => {
    setMedicineForm({
      id: item.id,
      employeeId: item.employeeId,
      medicine: item.medicine,
      deliveredAt: item.deliveredAt,
      quantity: item.quantity,
      status: item.status,
      notes: item.notes || "",
    });
    setFeedback(t("Editando entrega seleccionada.", "Editing selected delivery."));
  };

  const handleConditionEdit = (item) => {
    setConditionForm({
      id: item.id,
      employeeId: item.employeeId,
      conditionType: item.conditionType,
      status: item.status,
      restriction: item.restriction,
      owner: item.owner || "Occupational Health",
      followUpDate: item.followUpDate || "",
    });
    setFeedback(t("Editando condicion especial.", "Editing special condition."));
  };

  const handleMedicineSubmit = async (event) => {
    event.preventDefault();
    setSavingMedicine(true);
    setFeedback("");
    try {
      await saveMedicineRecord(medicineForm);
      setFeedback(medicineForm.id ? t("Entrega actualizada.", "Delivery updated.") : t("Entrega registrada.", "Delivery created."));
      setMedicineForm(createMedicineForm());
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSavingMedicine(false);
    }
  };

  const handleConditionSubmit = async (event) => {
    event.preventDefault();
    setSavingCondition(true);
    setFeedback("");
    try {
      await saveConditionRecord(conditionForm);
      setFeedback(conditionForm.id ? t("Condicion actualizada.", "Condition updated.") : t("Condicion registrada.", "Condition created."));
      setConditionForm(createConditionForm());
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    } finally {
      setSavingCondition(false);
    }
  };

  const handleExport = async () => {
    const exported = await exportOccupationalHealthSection("medicines-control");
    triggerTextDownload(exported.fileName, exported.content);
  };

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando control de medicamentos", "Loading medicines control")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar medicamentos", "Could not load medicines")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page occupational-health-page">
      <HealthHeader eyebrow={t("Medicines Control", "Medicines Control")} title={t("Control de medicamentos", "Medicines control")} description={t("Entrega, consumo y seguimiento de medicacion ocupacional.", "Delivery, consumption, and follow-up of occupational medication.")} actions={<button type="button" className="suite-button" onClick={handleExport}>{t("Exportar control", "Export control")}</button>} />
      <HealthFilters options={data.options} t={t} />
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card health-form-card">
            <h2>{medicineForm.id ? t("Editar entrega", "Edit medicine delivery") : t("Registrar entrega", "Register medicine delivery")}</h2>
            <form className="health-form-grid" onSubmit={handleMedicineSubmit}>
              <label><span>{t("Empleado", "Employee")}</span><select name="employeeId" value={medicineForm.employeeId} onChange={handleMedicineChange}><option value="">{t("Selecciona", "Select")}</option>{data.options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label><span>{t("Medicamento", "Medicine")}</span><input name="medicine" value={medicineForm.medicine} onChange={handleMedicineChange} /></label>
              <label><span>{t("Fecha de entrega", "Delivery date")}</span><input name="deliveredAt" type="date" value={medicineForm.deliveredAt} onChange={handleMedicineChange} /></label>
              <label><span>{t("Cantidad", "Quantity")}</span><input name="quantity" type="number" min="1" value={medicineForm.quantity} onChange={handleMedicineChange} /></label>
              <label><span>{t("Estado", "Status")}</span><select name="status" value={medicineForm.status} onChange={handleMedicineChange}><option value="active">{t("Activo", "Active")}</option><option value="monitoring">{t("Seguimiento", "Monitoring")}</option><option value="completed">{t("Completado", "Completed")}</option></select></label>
              <label className="health-form-span-2"><span>{t("Notas", "Notes")}</span><textarea name="notes" value={medicineForm.notes} onChange={handleMedicineChange} rows="3" /></label>
              <div className="health-form-actions">
                <button type="submit" className="suite-button" disabled={savingMedicine}>{savingMedicine ? t("Guardando...", "Saving...") : medicineForm.id ? t("Actualizar", "Update") : t("Registrar", "Register")}</button>
                <button type="button" className="suite-button-secondary" onClick={() => setMedicineForm(createMedicineForm())}>{t("Limpiar", "Clear")}</button>
              </div>
            </form>
          </section>
          <section className="suite-card health-form-card">
            <h2>{conditionForm.id ? t("Editar condicion", "Edit condition") : t("Registrar condicion especial", "Register special condition")}</h2>
            <form className="health-form-grid" onSubmit={handleConditionSubmit}>
              <label><span>{t("Empleado", "Employee")}</span><select name="employeeId" value={conditionForm.employeeId} onChange={handleConditionChange}><option value="">{t("Selecciona", "Select")}</option>{data.options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label><span>{t("Condicion", "Condition")}</span><input name="conditionType" value={conditionForm.conditionType} onChange={handleConditionChange} /></label>
              <label><span>{t("Estado", "Status")}</span><select name="status" value={conditionForm.status} onChange={handleConditionChange}><option value="monitoring">{t("Seguimiento", "Monitoring")}</option><option value="active">{t("Activo", "Active")}</option><option value="completed">{t("Completado", "Completed")}</option></select></label>
              <label><span>{t("Responsable", "Owner")}</span><input name="owner" value={conditionForm.owner} onChange={handleConditionChange} /></label>
              <label><span>{t("Seguimiento", "Follow-up")}</span><input name="followUpDate" type="date" value={conditionForm.followUpDate} onChange={handleConditionChange} /></label>
              <label className="health-form-span-2"><span>{t("Restriccion", "Restriction")}</span><textarea name="restriction" value={conditionForm.restriction} onChange={handleConditionChange} rows="3" /></label>
              <div className="health-form-actions">
                <button type="submit" className="suite-button" disabled={savingCondition}>{savingCondition ? t("Guardando...", "Saving...") : conditionForm.id ? t("Actualizar", "Update") : t("Registrar", "Register")}</button>
                <button type="button" className="suite-button-secondary" onClick={() => setConditionForm(createConditionForm())}>{t("Limpiar", "Clear")}</button>
              </div>
            </form>
          </section>
        </div>
        {feedback ? <section className="suite-card"><p className="health-form-feedback">{feedback}</p></section> : null}
      </section>
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <MedicinesTable items={data.items} t={t} onEdit={handleMedicineEdit} />
          </section>
          <section className="suite-card">
            <h2>{t("Condiciones especiales", "Special conditions")}</h2>
            <div className="health-case-grid">
              {data.conditions.map((item) => (
                <article key={item.id} className="health-case-card health-editable-card" onClick={() => handleConditionEdit(item)}>
                  <strong>{item.employeeName}</strong>
                  <p className="suite-muted">{item.conditionType}</p>
                  <p>{item.restriction}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
