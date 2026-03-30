import { useState } from "react";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeTimeline from "../components/EmployeeTimeline";
import EmployeeModuleOverview from "../components/EmployeeModuleOverview";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import EmployeeAttachmentsField from "../components/EmployeeAttachmentsField";
import EmployeeAttachmentList from "../components/EmployeeAttachmentList";
import useEmployeeProfile from "../hooks/useEmployeeProfile";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import useEmployees from "../hooks/useEmployees";
import employeesService from "../services/employees.service";
import { formatDate } from "../utils/employee.helpers";

const initialExperience = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  achievements: "",
  attachments: [],
};

export default function ExperiencePage() {
  const { employee, loading, refresh } = useEmployeeProfile();
  const { dashboard } = useEmployees();
  const [form, setForm] = useState(initialExperience);
  const [feedback, setFeedback] = useState("");
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  async function handleSubmit(event) {
    event.preventDefault();
    await employeesService.saveEmployee({
      ...employee,
      experience: [{ id: `EXP-${Date.now()}`, ...form }, ...(employee.experience || [])],
    });
    setForm(initialExperience);
    setFeedback(isSpanish ? "Experiencia registrada correctamente." : "Experience successfully registered.");
    refresh();
  }

  if (loading) {
    return <main className="employees-page"><EmployeeEmptyState title={isSpanish ? "Cargando experiencia" : "Loading experience"} description={isSpanish ? "Preparando trayectoria profesional previa del colaborador." : "Preparing the employee prior career background."} /></main>;
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <EmployeeModuleOverview
          title={isSpanish ? "Experiencia laboral" : "Work experience"}
          description={isSpanish ? "Vista general de trayectoria previa y seniority de toda la plantilla." : "General view of prior career background and seniority across the workforce."}
          employees={dashboard.employees}
          emptyTitle={isSpanish ? "No hay experiencia para mostrar" : "No experience to display"}
          emptyDescription={isSpanish ? "Cuando existan trayectorias cargadas, podras abrir el detalle por colaborador desde aqui." : "Once career records exist, you will be able to open the employee detail from here."}
          actionLabel={isSpanish ? "Ver experiencia" : "View experience"}
          buildMeta={(item) => `${item.experience.length} ${isSpanish ? "etapas previas" : "previous stages"} | ${item.recruitmentSource?.origin || copy.common.manual}`}
        />
      </main>
    );
  }

  return (
    <main className="employees-page employees-page--experience">
      <EmployeeProfileHero employee={employee} title={isSpanish ? "Experiencia laboral" : "Work experience"} description={isSpanish ? "Historia profesional previa y aportes relevantes." : "Prior professional history and relevant contributions."} />
      <EmployeeTabs employeeId={employee.id} />

      <section className="employees-grid">
        <div className="employees-side-stack">
          <EmployeeSpotlightCard
            variant="experience"
            eyebrow={isSpanish ? "Trayectoria" : "Career path"}
            title={isSpanish ? "Trayectoria profesional previa" : "Previous professional journey"}
            description={isSpanish ? "Una lectura premium del recorrido laboral que explica la seniority del colaborador." : "A premium read of the career path that explains employee seniority."}
            meta={[
              { label: isSpanish ? "Etapas" : "Stages", value: employee.experience.length },
              { label: isSpanish ? "Ultima empresa" : "Latest company", value: employee.experience[0]?.company || copy.common.noData },
              { label: isSpanish ? "Rol previo" : "Previous role", value: employee.experience[0]?.role || copy.common.noData },
              { label: isSpanish ? "Origen" : "Origin", value: employee.recruitmentSource?.origin || copy.common.manual },
            ]}
          />

          <EmployeeSectionCard variant="experience" title={isSpanish ? "Timeline de carrera" : "Career timeline"} description={isSpanish ? "Cada bloque resume etapas anteriores y valor acumulado del colaborador." : "Each block summarizes previous stages and accumulated value."}>
            <EmployeeTimeline
              items={employee.experience.map((item) => ({
                id: item.id,
                eyebrow: item.company || (isSpanish ? "Empresa" : "Company"),
                title: item.role || copy.common.noRole,
                date: `${formatDate(item.startDate)} - ${item.endDate ? formatDate(item.endDate) : (isSpanish ? "Actual" : "Current")}`,
                description: item.attachments?.length
                  ? `${item.achievements || copy.common.noAchievements} ${isSpanish ? "Adjuntos:" : "Attachments:"} ${item.attachments.map((attachment) => attachment.fileName).join(", ")}`
                  : item.achievements || copy.common.noAchievements,
                trailing: employee.recruitmentSource?.candidateName === employee.name ? (isSpanish ? "Trayectoria usada en hiring" : "Experience used in hiring") : "",
              }))}
              emptyTitle={isSpanish ? "Sin experiencia previa registrada" : "No prior experience registered"}
              emptyDescription={isSpanish ? "Completa la trayectoria para enriquecer la lectura del perfil." : "Complete the trajectory to enrich the profile readout."}
            />
          </EmployeeSectionCard>
        </div>

        <EmployeeSectionCard variant="experience" title={isSpanish ? "Agregar experiencia" : "Add experience"} description={isSpanish ? "Registra etapas anteriores, alcance de rol y logros destacados para enriquecer el perfil 360." : "Register previous stages, role scope, and major achievements to enrich the 360 profile."}>
          {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}
          <form className="employees-form-grid" onSubmit={handleSubmit}>
            <div className="employees-field">
              <label>{isSpanish ? "Empresa" : "Company"}</label>
              <input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} required />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Cargo" : "Role"}</label>
              <input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} required />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Fecha inicio" : "Start date"}</label>
              <input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="employees-field">
              <label>{isSpanish ? "Fecha fin" : "End date"}</label>
              <input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="employees-field" style={{ gridColumn: "1 / -1" }}>
              <label>{isSpanish ? "Logros o contribuciones" : "Achievements or contributions"}</label>
              <textarea value={form.achievements} onChange={(event) => setForm((current) => ({ ...current, achievements: event.target.value }))} />
            </div>
            <EmployeeAttachmentsField
              label={isSpanish ? "Respaldos de experiencia" : "Experience supporting files"}
              buttonLabel={isSpanish ? "Seleccionar archivos" : "Select files"}
              emptyLabel={isSpanish ? "Ningun archivo seleccionado" : "No files selected"}
              helperText={isSpanish ? "Adjunta cartas laborales, certificados o evidencias relevantes de la experiencia previa." : "Attach employment letters, certificates, or relevant evidence of prior experience."}
              files={form.attachments}
              onChange={(attachments) => setForm((current) => ({ ...current, attachments }))}
            />
            {form.attachments.length ? <EmployeeAttachmentList attachments={form.attachments} compact /> : null}
            <div className="employees-inline-actions">
              <button className="employees-button" type="submit">{copy.actions.saveExperience}</button>
            </div>
          </form>
        </EmployeeSectionCard>
      </section>
    </main>
  );
}
