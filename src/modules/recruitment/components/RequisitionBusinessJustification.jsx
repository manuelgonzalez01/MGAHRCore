function Field({ label, hint, error, children }) {
  return (
    <label className={`requisition-field${error ? " has-error" : ""}`}>
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
      {children}
      {error ? <em>{error}</em> : null}
    </label>
  );
}

export default function RequisitionBusinessJustification({
  copy,
  values,
  errors,
  onChange,
  justificationRequired,
  multiOpening,
}) {
  return (
    <div className="requisition-form-grid requisition-form-grid--single">
      <Field
        label={copy.businessReasonLabel}
        hint={justificationRequired ? copy.businessReasonRequiredHint : copy.businessReasonHint}
        error={errors.businessReason}
      >
        <textarea
          rows="4"
          value={values.businessReason}
          onChange={(event) => onChange("businessReason", event.target.value)}
        />
      </Field>

      <Field
        label={copy.roleImpactLabel}
        hint={copy.roleImpactHint}
        error={errors.roleImpact}
      >
        <textarea
          rows="4"
          value={values.roleImpact}
          onChange={(event) => onChange("roleImpact", event.target.value)}
        />
      </Field>

      <Field
        label={copy.priorityJustificationLabel}
        hint={copy.priorityJustificationHint}
        error={errors.priorityJustification}
      >
        <textarea
          rows="3"
          value={values.priorityJustification}
          onChange={(event) => onChange("priorityJustification", event.target.value)}
        />
      </Field>

      {multiOpening ? (
        <Field
          label={copy.hiringPlanLabel}
          hint={copy.hiringPlanHint}
          error={errors.hiringPlan}
        >
          <textarea
            rows="3"
            value={values.hiringPlan}
            onChange={(event) => onChange("hiringPlan", event.target.value)}
          />
        </Field>
      ) : null}

      <Field
        label={copy.areaNotesLabel}
        hint={copy.areaNotesHint}
        error={errors.areaNotes}
      >
        <textarea
          rows="3"
          value={values.areaNotes}
          onChange={(event) => onChange("areaNotes", event.target.value)}
        />
      </Field>
    </div>
  );
}
