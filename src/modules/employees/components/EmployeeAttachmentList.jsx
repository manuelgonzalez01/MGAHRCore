import useEmployeesCopy from "../hooks/useEmployeesCopy";
import { formatFileSize } from "../utils/employee.helpers";

export default function EmployeeAttachmentList({ attachments = [], compact = false }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  if (!attachments.length) {
    return null;
  }

  return (
    <div className={`employees-attachment-list${compact ? " employees-attachment-list--compact" : ""}`}>
      <span className="employees-attachment-list__label">
        {isSpanish ? "Adjuntos" : "Attachments"}
      </span>
      <div className="employees-attachment-list__items">
        {attachments.map((attachment) => (
          <article
            key={`${attachment.fileName}-${attachment.fileSize}-${attachment.fileType}`}
            className="employees-attachment-chip"
          >
            <strong>{attachment.fileName || (isSpanish ? "Archivo" : "File")}</strong>
            <small>
              {attachment.fileSize ? formatFileSize(attachment.fileSize, copy.locale) : copy.common.noData}
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}
