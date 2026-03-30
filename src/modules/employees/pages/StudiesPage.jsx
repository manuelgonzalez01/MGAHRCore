import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import EmployeeAttachmentsField from "../components/EmployeeAttachmentsField";
import EmployeeAttachmentList from "../components/EmployeeAttachmentList";
import useEmployeeProfile from "../hooks/useEmployeeProfile";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import employeesService from "../services/employees.service";

function createInitialStudy(copy) {
  return {
    institution: "",
    degree: "",
    level: copy.language === "es" ? "Licenciatura" : "Bachelor's degree",
    status: "completed",
    year: String(new Date().getFullYear()),
    attachments: [],
  };
}

export default function StudiesPage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const [form, setForm] = useState(() => createInitialStudy(copy));
  const [feedback, setFeedback] = useState("");
  const levelOptions = isSpanish
    ? [
        "Tecnico medio",
        "Tecnico superior",
        "Licenciatura",
        "Especialidad",
        "Diplomado",
        "Maestria",
        "Doctorado",
        "Certificacion",
      ]
    : [
        "Technical diploma",
        "Higher technical degree",
        "Bachelor's degree",
        "Specialization",
        "Diploma",
        "Master's degree",
        "Doctorate",
        "Certification",
      ];

  async function handleSubmit(event) {
    event.preventDefault();
    await employeesService.saveEmployee({
      ...employee,
      studies: [{ id: `STU-${Date.now()}`, ...form }, ...(employee.studies || [])],
    });
    setForm(createInitialStudy(copy));
    setFeedback(isSpanish ? "Formacion registrada correctamente." : "Learning record successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando estudios" : "Loading studies"} description={isSpanish ? "Preparando formacion academica y tecnica del colaborador." : "Preparing the employee academic and technical background."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Formacion y estudios" : "Studies and learning"}
          description={isSpanish ? "Vista general de capital academico y formacion registrada para toda la plantilla." : "General view of academic capital and registered learning across the workforce."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay estudios para mostrar" : "No studies to display"}
          emptyDescription={isSpanish ? "Cuando existan registros de formacion, podras abrir el detalle por colaborador desde aqui." : "Once learning records exist, you will be able to open the employee detail from here."}
          actionLabel={isSpanish ? "Ver formacion" : "View learning"}
          buildMeta={(item) => `${item.studies.length} ${isSpanish ? "registros" : "records"} | ${item.levelName || copy.common.noLevel}`}
        />
      </main>
    );
  }

  return (
    <main className="employees-page employees-page--studies">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Estudios y formacion" : "Studies and learning"} description={isSpanish ? "Historial academico y tecnico del colaborador." : "Employee academic and technical history."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="studies"
            eyebrow={isSpanish ? "Perfil formativo" : "Learning profile"}
            title={isSpanish ? "Capital academico del colaborador" : "Employee academic capital"}
            description={isSpanish ? "Relaciona formacion completada, programas en curso y madurez del perfil." : "Connects completed learning, ongoing programs, and profile maturity."}
            meta={[
              { label: isSpanish ? "Registros" : "Records", value: employee.studies.length },
              { label: isSpanish ? "Completados" : "Completed", value: employee.studies.filter((item) => item.status === "completed").length },
              { label: isSpanish ? "En curso" : "In progress", value: employee.studies.filter((item) => item.status === "in_progress").length },
              { label: isSpanish ? "Nivel actual" : "Current level", value: employee.levelName || copy.common.noLevel },
            ]}
          />

          <EmployeeSectionCard variant="studies" title={isSpanish ? "Trayectoria academica" : "Academic journey"} description={isSpanish ? "Visualiza niveles, instituciones y avance formativo con contexto ejecutivo." : "Visualize levels, institutions, and learning progress with executive context."}>
            <div className="employees-domain-strip employees-domain-strip--studies">
              <article className="employees-domain-chip"><span>{isSpanish ? "Completados" : "Completed"}</span><strong>{employee.studies.filter((item) => item.status === "completed").length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "En curso" : "In progress"}</span><strong>{employee.studies.filter((item) => item.status === "in_progress").length}</strong></article>
              <article className="employees-domain-chip"><span>{isSpanish ? "Instituciones" : "Institutions"}</span><strong>{new Set(employee.studies.map((item) => item.institution).filter(Boolean)).size}</strong></article>
            </div>
            {employee.studies.length ? (
              <div className="employees-list">
                {employee.studies.map((study) => (
                  <article key={study.id} className="employees-list-item">
                    <span>{study.level || (isSpanish ? "Nivel" : "Level")}</span>
                    <strong>{study.degree || (isSpanish ? "Formacion" : "Learning")}</strong>
                    <p className="employees-muted">
                      {study.institution || copy.common.noInstitution} | {copy.status[study.status] || study.status} | {study.year || copy.common.noYear}
                    </p>
                    <EmployeeAttachmentList attachments={study.attachments} compact />
                  </article>
                ))}
              </div>
            ) : (
              <EmployeeEmptyState title={isSpanish ? "Sin estudios registrados" : "No studies registered"} description={isSpanish ? "Carga titulos, especialidades y programas clave para el mapa de talento." : "Add degrees, specialties, and key programs to the talent map."} />
            )}
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="studies" title={isSpanish ? "Agregar formacion" : "Add learning"} description={isSpanish ? "Incorpora titulos, certificaciones o programas relevantes al expediente y mapa de talento." : "Add degrees, certifications, or relevant programs to the employee file and talent map."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Institucion" : "Institution"}</label>
              <input
                value={form.institution}
                onChange={(event) => setForm((current) => ({ ...current, institution: event.target.value }))}
                placeholder={isSpanish ? "Ej. Universidad Catolica, Coursera, UPSA" : "Ex. Catholic University, Coursera, UPSA"}
                required
              />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Titulo o programa" : "Degree or program"}</label>
              <input
                value={form.degree}
                onChange={(event) => setForm((current) => ({ ...current, degree: event.target.value }))}
                placeholder={isSpanish ? "Ej. Psicologia Organizacional, Excel avanzado" : "Ex. Organizational Psychology, Advanced Excel"}
                required
              />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Nivel" : "Level"}</label>
              <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>
                {levelOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Estado" : "Status"}</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="completed">{copy.status.completed}</option>
                <option value="in_progress">{copy.status.in_progress}</option>
                <option value="planned">{copy.status.planned}</option>
              </select>
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Ano" : "Year"}</label>
              <input
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                placeholder={isSpanish ? "Ej. 2024" : "Ex. 2024"}
              />
            </div>
            <EmployeeAttachmentsField
              label={isSpanish ? "Certificados o diplomas" : "Certificates or diplomas"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta diploma, certificado o constancia del programa registrado." : "Attach diploma, certificate, or proof of the registered program."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.saveStudy}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
