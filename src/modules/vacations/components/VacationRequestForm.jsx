import { useState } from "react";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationRequestForm({ employees = [], onSave }) {
  const { copy } = useVacationLocale();
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || "",
    startDate: "",
    endDate: "",
    note: "",
    status: "draft",
    requestMode: "standard",
    retroactive: false,
    accumulatedPeriods: 1,
  });

  return (
    <section className="suite-card">
      <h2>{copy.newRequest}</h2>
      <div className="suite-mini-grid">
        <label>{copy.employee}<select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>
        <label>{copy.start}<input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /></label>
        <label>{copy.end}<input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /></label>
        <label>{copy.status}<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="draft">{copy.draft}</option><option value="submitted">{copy.submitted}</option></select></label>
        <label>{copy.mode}<select value={form.requestMode} onChange={(event) => setForm((current) => ({ ...current, requestMode: event.target.value }))}><option value="standard">{copy.standard}</option><option value="partial">{copy.partial}</option><option value="split">{copy.split}</option><option value="amendment">{copy.amendment}</option></select></label>
        <label>{copy.accumulation}<input type="number" min="1" max="3" value={form.accumulatedPeriods} onChange={(event) => setForm((current) => ({ ...current, accumulatedPeriods: Number(event.target.value) || 1 }))} /></label>
        <label>{copy.retroactive}<select value={String(form.retroactive)} onChange={(event) => setForm((current) => ({ ...current, retroactive: event.target.value === "true" }))}><option value="false">{copy.no}</option><option value="true">{copy.yes}</option></select></label>
      </div>
      <label>{copy.justification}<textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></label>
      <button className="suite-button" onClick={() => onSave(form)} type="button">{copy.registerRequest}</button>
    </section>
  );
}
