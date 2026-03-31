export default function RequisitionActionBar({
  draftLabel,
  submitLabel,
  cancelLabel,
  onSaveDraft,
  onSubmit,
  onCancel,
  canSubmit,
  contextLabel,
}) {
  return (
    <div className="requisition-action-bar">
      <div className="requisition-action-bar__context">
        <span>{contextLabel}</span>
      </div>
      <div className="requisition-action-bar__actions">
        <button type="button" className="recruitment-secondary-button" onClick={onSaveDraft}>
          {draftLabel}
        </button>
        <button type="button" className="recruitment-primary-button" onClick={onSubmit} disabled={!canSubmit}>
          {submitLabel}
        </button>
        <button type="button" className="recruitment-inline-button" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
