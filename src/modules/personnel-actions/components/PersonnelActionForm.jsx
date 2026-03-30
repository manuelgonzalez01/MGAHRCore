export default function PersonnelActionForm({ form, setForm, options, onSubmit, t, feedback, error }) {
  const actionType = form.actionType;
  const isPromotion = actionType === "promotion";
  const isTransfer = ["transfer", "department_change", "location_change", "position_change", "supervisor_change"].includes(actionType);
  const isSalary = actionType === "salary_change";

  return (
    <section className="suite-card">
      <h2>{t("Crear o actualizar accion", "Create or update action")}</h2>
      {feedback ? <p className="personnel-feedback">{feedback}</p> : null}
      {error ? <p className="personnel-feedback error">{error}</p> : null}
      <form className="personnel-actions-form" onSubmit={onSubmit}>
        <label>
          <span>{t("Colaborador", "Employee")}</span>
          <select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} required>
            <option value="">{t("Selecciona", "Select")}</option>
            {options.employees.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Tipo de accion", "Action type")}</span>
          <select value={form.actionType} onChange={(event) => setForm((current) => ({ ...current, actionType: event.target.value }))} required>
            <option value="">{t("Selecciona", "Select")}</option>
            {options.actionTypes.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Fecha efectiva", "Effective date")}</span>
          <input type="date" value={form.effectiveDate} onChange={(event) => setForm((current) => ({ ...current, effectiveDate: event.target.value }))} required />
        </label>
        <label>
          <span>{t("Estado inicial", "Initial status")}</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            {options.statuses.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {isPromotion || isTransfer ? (
          <>
            <label>
              <span>{t("Posicion destino", "Target position")}</span>
              <select value={form.targetPositionId} onChange={(event) => setForm((current) => ({ ...current, targetPositionId: event.target.value }))}>
                <option value="">{t("Selecciona", "Select")}</option>
                {options.positions.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Nivel destino", "Target level")}</span>
              <select value={form.targetLevelId} onChange={(event) => setForm((current) => ({ ...current, targetLevelId: event.target.value }))}>
                <option value="">{t("Selecciona", "Select")}</option>
                {options.levels.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Departamento destino", "Target department")}</span>
              <select value={form.targetDepartmentId} onChange={(event) => setForm((current) => ({ ...current, targetDepartmentId: event.target.value }))}>
                <option value="">{t("Selecciona", "Select")}</option>
                {options.departments.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>{t("Localizacion destino", "Target location")}</span>
              <select value={form.targetLocationId} onChange={(event) => setForm((current) => ({ ...current, targetLocationId: event.target.value }))}>
                <option value="">{t("Selecciona", "Select")}</option>
                {options.locations.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </>
        ) : null}
        {isSalary ? (
          <label>
            <span>{t("Salario destino", "Target salary")}</span>
            <input type="number" value={form.targetSalary} onChange={(event) => setForm((current) => ({ ...current, targetSalary: event.target.value }))} />
          </label>
        ) : null}
        <label>
          <span>{t("Supervisor destino", "Target supervisor")}</span>
          <select value={form.targetSupervisor} onChange={(event) => setForm((current) => ({ ...current, targetSupervisor: event.target.value }))}>
            <option value="">{t("Selecciona", "Select")}</option>
            {options.supervisors.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t("Estatus destino", "Target status")}</span>
          <input value={form.targetStatus} onChange={(event) => setForm((current) => ({ ...current, targetStatus: event.target.value }))} />
        </label>
        <label className="span-2">
          <span>{t("Motivo", "Reason")}</span>
          <input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} required />
        </label>
        <label className="span-2">
          <span>{t("Justificacion de negocio", "Business justification")}</span>
          <textarea value={form.businessJustification} onChange={(event) => setForm((current) => ({ ...current, businessJustification: event.target.value }))} />
        </label>
        <label className="span-2">
          <span>{t("Notas", "Notes")}</span>
          <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <div className="span-2 personnel-action-buttons">
          <button className="suite-button" type="submit">{t("Guardar accion", "Save action")}</button>
        </div>
      </form>
    </section>
  );
}
