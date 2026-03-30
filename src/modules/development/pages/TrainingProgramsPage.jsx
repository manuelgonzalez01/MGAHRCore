import { useState } from "react";
import "../../shared/hrSuite.css";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import TrainingCompliancePanel from "../components/TrainingCompliancePanel";
import TrainingProgramsTable from "../components/TrainingProgramsTable";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import useTrainingPrograms from "../hooks/useTrainingPrograms";
import { deleteTrainingProgramRecord, saveTrainingProgramRecord } from "../services/developmentDomain.service";

export default function TrainingProgramsPage() {
  const { t } = useDevelopmentLocale();
  const { data, filters, options, loading, error, exportState, setFilter, resetFilters, exportReport, reload } = useTrainingPrograms();
  const [form, setForm] = useState({ id: "", title: "", category: "Capability", audience: "", enrolled: 0, completed: 0, owner: "", status: "in_progress", mandatory: false });
  const [feedback, setFeedback] = useState("");

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando training programs", "Loading training programs")}
          description={t(
            "Estamos consolidando cumplimiento, audiencias y programas activos.",
            "We are consolidating compliance, audiences, and active programs.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar training", "We could not load training")}
          description={t(
            "La vista de capacitacion encontro un problema al consolidar programas o cumplimiento.",
            "The training workspace hit a problem while consolidating programs or compliance.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Gestion de capacitacion", "Training Management")}
        title={t("Programas y cumplimiento de capacitacion", "Training programs and compliance")}
        description={t(
          "Controla programas obligatorios y opcionales con impacto real sobre planes de desarrollo.",
          "Controls mandatory and optional programs with real impact on development plans.",
        )}
        badges={[
          { label: t("Programas", "Programs"), value: data.summary.programs, tone: "info" },
          { label: t("Obligatorios", "Mandatory"), value: data.summary.mandatoryPrograms, tone: "warning" },
        ]}
      />

      <DevelopmentFilters
        filters={filters}
        options={options}
        onChange={setFilter}
        onReset={resetFilters}
        onExport={exportReport}
        exportState={exportState}
        visibleFields={["companyId", "departmentId", "category", "status"]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Programas activos", "Active programs"), value: data.summary.programs },
          { label: t("Programas saludables", "Healthy programs"), value: data.summary.healthyPrograms },
          { label: t("Obligatorios", "Mandatory"), value: data.summary.mandatoryPrograms },
          { label: t("Inscripciones", "Enrollments"), value: data.summary.enrollments },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={form.id ? t("Editar programa", "Edit program") : t("Registrar programa", "Register program")}
            description={t(
              "Administra programas, cumplimiento, audiencia y volumen de inscripciones.",
              "Manage programs, completion, audience, and enrollment volume.",
            )}
          >
            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Programa", "Program")}</span>
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Categoria", "Category")}</span>
                <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Audiencia", "Audience")}</span>
                <input value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Responsable", "Owner")}</span>
                <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Inscritos", "Enrolled")}</span>
                <input type="number" min="0" value={form.enrolled} onChange={(event) => setForm((current) => ({ ...current, enrolled: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Completados", "Completed")}</span>
                <input type="number" min="0" value={form.completed} onChange={(event) => setForm((current) => ({ ...current, completed: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Estado", "Status")}</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="healthy">{t("Saludable", "Healthy")}</option>
                  <option value="in_progress">{t("En progreso", "In progress")}</option>
                  <option value="attention">{t("Atencion", "Attention")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Obligatorio", "Mandatory")}</span>
                <select value={form.mandatory ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, mandatory: event.target.value === "yes" }))}>
                  <option value="no">{t("No", "No")}</option>
                  <option value="yes">{t("Si", "Yes")}</option>
                </select>
              </label>
            </div>
            <div className="development-form-actions">
              <button type="button" className="suite-button" onClick={async () => {
                if (!form.title.trim()) {
                  setFeedback(t("El programa necesita nombre.", "The program needs a name."));
                  return;
                }
                await saveTrainingProgramRecord(form);
                setForm({ id: "", title: "", category: "Capability", audience: "", enrolled: 0, completed: 0, owner: "", status: "in_progress", mandatory: false });
                setFeedback(t("Programa guardado correctamente.", "Program saved successfully."));
                reload();
              }}>{form.id ? t("Actualizar programa", "Update program") : t("Registrar programa", "Register program")}</button>
            </div>
            {feedback ? <p className="development-inline-feedback">{feedback}</p> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Tabla de programas", "Programs table")}
            description={t(
              "Vista ejecutiva de cumplimiento, audiencia y estado.",
              "Executive view of completion, audience, and program health.",
            )}
          >
            <TrainingProgramsTable
              items={data.programs}
              onEdit={(item) => setForm({ id: item.id, title: item.title, category: item.category, audience: item.audience, enrolled: item.enrolled, completed: item.completed, owner: item.owner, status: item.status, mandatory: item.mandatory })}
              onDelete={async (item) => {
                await deleteTrainingProgramRecord(item.id);
                setFeedback(t("Programa eliminado correctamente.", "Program deleted successfully."));
                reload();
              }}
            />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Cumplimiento y seguimiento", "Compliance and follow-up")}
            description={t(
              "Programas que requieren seguimiento del negocio o talento.",
              "Programs requiring business or talent follow-up.",
            )}
          >
            <TrainingCompliancePanel items={data.programs.slice(0, 6)} />
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Distribucion por categoria", "Distribution by category")}
            description={t(
              "Donde se concentra la inversion de aprendizaje.",
              "Where learning investment is concentrated.",
            )}
          >
            <div className="development-list">
              {data.byCategory.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Programas", "Programs")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Audiencias atendidas", "Audience coverage")}
            description={t(
              "Cuantas personas impacta cada frente de capacitacion.",
              "How many people each training track is impacting.",
            )}
          >
            <div className="development-list">
              {data.byAudience.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Inscripciones", "Enrollments")}: {item.value}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>
        </div>
      </section>
    </main>
  );
}
