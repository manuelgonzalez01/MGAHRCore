export default function EmployeeAttachmentsField({
  label,
  buttonLabel,
  emptyLabel,
  helperText,
  accept = ".pdf,.png,.jpg,.jpeg,.doc,.docx",
  onChange,
  files = [],
}) {
  return (
    <div className="employees-field" style={{ gridColumn: "1 / -1" }}>
      <label>{label}</label>
      <label className="employees-file-picker">
        <input
          type="file"
          accept={accept}
          multiple
          onChange={(event) => {
            const nextFiles = Array.from(event.target.files || []).map((file) => ({
              fileName: file.name,
              fileType: file.type || "",
              fileSize: file.size || 0,
            }));
            onChange(nextFiles);
          }}
        />
        <span className="employees-file-picker__button">{buttonLabel}</span>
        <span className="employees-file-picker__name">
          {files.length ? files.map((item) => item.fileName).join(", ") : emptyLabel}
        </span>
      </label>
      {helperText ? <small className="employees-helper-text">{helperText}</small> : null}
    </div>
  );
}
