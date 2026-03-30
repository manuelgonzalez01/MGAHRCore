import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import useEmployeeProfile from "../hooks/useEmployeeProfile";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import { addEmployeeDocument } from "../services/documents.service";
import { formatDate, formatFileSize } from "../utils/employee.helpers";

const initialDocument = {
  name: "",
  category: "Legal",
  owner: "",
  expiresAt: "",
  status: "pending",
  fileName: "",
  fileType: "",
  fileSize: 0,
};

export default function EmployeeDocumentsPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const [form, setForm] = useState(initialDocument);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [feedback, setFeedback] = useState("");
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  async function handleSubmit(event) {
    event.preventDefault();
    await addEmployeeDocument(employee, form);
    setForm(initialDocument);
    setSelectedFileName("");
    setFeedback(isSpanish ? "Documento registrado correctamente en el expediente del colaborador." : "Document successfully registered in the employee file.");
    refresh();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName("");
      setForm((current) => ({
        ...current,
        fileName: "",
        fileType: "",
        fileSize: 0,
      }));
      return;
    }

    setSelectedFileName(file.name);
    setForm((current) => ({
      ...current,
      name: current.name || file.name.replace(/\.[^.]+$/, ""),
      fileName: file.name,
      fileType: file.type || "",
      fileSize: file.size || 0,
    }));
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando expediente" : "Loading file"} description={isSpanish ? "Preparando documentos del colaborador." : "Preparing employee documents."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Expediente digital por colaborador" : "Digital file by employee"}
          description={isSpanish ? "Vista general de documentos, vencimientos y cobertura para todos los colaboradores. Selecciona uno para entrar a su expediente puntual." : "General view of documents, expirations, and coverage across all employees. Select one to enter the specific employee file."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay colaboradores con expediente" : "No employees with files yet"}
          emptyDescription={isSpanish ? "Cuando existan colaboradores activos, aqui podras entrar al expediente individual." : "Once active employees exist, you will be able to open the individual file from here."}
          actionLabel={isSpanish ? "Abrir expediente" : "Open file"}
          buildMeta={(item) => `${item.documents.length} ${isSpanish ? "documentos" : "documents"} | ${isSpanish ? "Completitud" : "Completion"} ${item.dossierReadiness}%`}
        />
      </main>
    );
  }

  const expiringSoon = employee.documents.filter((item) => item.expiresAt).length;
  const approvedDocs = employee.documents.filter((item) => item.status === "approved").length;
  const criticalDocs = employee.documents.filter((item) => item.status === "missing").length;

  return (
    <main className="employees-page employees-page--documents">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Expediente digital" : "Digital file"} description={isSpanish ? "Control documental, cumplimiento y vigencias por colaborador." : "Document control, compliance, and expirations by employee."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="documents"
            eyebrow={isSpanish ? "Expediente" : "File"}
            title={isSpanish ? "Control documental del colaborador" : "Employee document control"}
            description={isSpanish ? "Consolida cumplimiento, responsables y vigencias en una sola vista operativa." : "Consolidates compliance, owners, and expirations in one operational view."}
            meta={[
              { label: isSpanish ? "Owner principal" : "Primary owner", value: employee.documents[0]?.owner || "HR Operations" },
              { label: isSpanish ? "Criticos" : "Critical", value: criticalDocs },
              { label: isSpanish ? "Vigencias" : "Expirations", value: expiringSoon },
              { label: isSpanish ? "Completitud" : "Completion", value: `${employee.dossierReadiness}%` },
            ]}
          />

          <EmployeeSectionCard variant="documents" title={isSpanish ? "Estado del expediente" : "File status"} description={isSpanish ? "Monitorea cobertura documental, pendientes y vencimientos visibles." : "Monitor document coverage, pending items, and visible expirations."}>
            <div className="employees-domain-strip employees-domain-strip--documents">
              <article className="employees-domain-chip"><span>{isSpanish ? "Documentos cargados" : "Loaded documents"}</span><strong>{employee.documents.length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Aprobados" : "Approved"}</span><strong>{approvedDocs}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Con vigencia" : "With expiration"}</span><strong>{expiringSoon}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Criticos" : "Critical"}</span><strong>{criticalDocs}</strong></article>
            </div>
          </EmployeeSectionCard>

          <EmployeeSectionCard variant="documents" title={isSpanish ? "Biblioteca documental" : "Document library"} description={isSpanish ? "Repositorio operativo con responsable, categoria y fecha de vigencia." : "Operational repository with owner, category, and validity date."}>
            {employee.documents.length ? (
              <div className="employees-list">
                {employee.documents.map((document) => (
                  <article key={document.id} className="employees-list-item">
                    <span>{document.category}</span>
                    <strong>{document.name}</strong>
                    <p className="employees-muted">
                      {document.owner || copy.common.noOwner} | {isSpanish ? "Estado" : "Status"} {copy.status[document.status] || document.status} | {isSpanish ? "Vigencia" : "Validity"} {document.expiresAt ? formatDate(document.expiresAt) : copy.common.noDate}
                    </p>
                    {document.fileName ? (
                      <p className="employees-muted">
                        {isSpanish ? "Archivo" : "File"} {document.fileName}
                        {document.fileSize ? ` | ${formatFileSize(document.fileSize, copy.locale)}` : ""}
                        {document.updatedAt ? ` | ${isSpanish ? "Actualizado" : "Updated"} ${formatDate(document.updatedAt, copy.locale)}` : ""}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin documentos cargados" : "No documents loaded"} description={isSpanish ? "Agrega el primer activo del expediente y empieza a construir cumplimiento." : "Add the first file asset and begin building compliance coverage."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="documents" title={isSpanish ? "Registrar documento" : "Register document"} description={isSpanish ? "Incorpora nueva evidencia al expediente del colaborador con owner, categoria y vencimiento." : "Add new evidence to the employee file with owner, category, and expiration date."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field" style={{ gridColumn: "1 / -1" }}>
              <label>{isSpanish ? "Archivo" : "File"}</label>
              <label className="employees-file-picker">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />
                <span className="employees-file-picker__button">{isSpanish ? "Seleccionar archivo" : "Select file"}</span>
                <span className="employees-file-picker__name">
                  {selectedFileName || (isSpanish ? "Ningun archivo seleccionado" : "No file selected")}
                </span>
              </label>
              <small className="employees-helper-text">
                {isSpanish
                  ? "Frontend-only por ahora: se registra el archivo seleccionado en la experiencia del expediente y sus metadatos quedan listos para conectar storage real despues."
                  : "Frontend-only for now: the selected file is registered in the file experience and its metadata stays ready for real storage integration later."}
              </small>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Nombre del documento" : "Document name"}</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Categoria" : "Category"}</label>
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                <option>{isSpanish ? "Legal" : "Legal"}</option>
                <option>{isSpanish ? "Identidad" : "Identity"}</option>
                <option>{isSpanish ? "Contrato" : "Contract"}</option>
                <option>{isSpanish ? "Beneficios" : "Benefits"}</option>
                <option>{isSpanish ? "Salud" : "Health"}</option>
              </select>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Responsable" : "Owner"}</label>
              <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Vigencia" : "Validity"}</label>
              <input type="date" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Estado" : "Status"}</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="pending">{copy.status.pending}</option>
                <option value="approved">{copy.status.approved}</option>
                <option value="missing">{copy.status.missing}</option>
              </select>
            </div>
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit" disabled={!form.fileName}>
                {copy.actions.saveDocument}
              </button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
