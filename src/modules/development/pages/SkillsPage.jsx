import { useState } from "react";
import "../../shared/hrSuite.css";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import SkillGapTable from "../components/SkillGapTable";
import SkillsMatrixPanel from "../components/SkillsMatrixPanel";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import useSkills from "../hooks/useSkills";
import { deleteSkillRecord, saveSkillRecord } from "../services/developmentDomain.service";

export default function SkillsPage() {
  const { t } = useDevelopmentLocale();
  const { data, filters, options, loading, error, exportState, setFilter, resetFilters, exportReport, reload } = useSkills();
  const [form, setForm] = useState({
    id: "",
    employeeId: "",
    skillName: "",
    category: "Development",
    level: "developing",
    required: false,
    source: "manual update",
  });
  const [feedback, setFeedback] = useState("");

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando skills management", "Loading skills management")}
          description={t(
            "Estamos preparando la matriz de capacidades y gaps.",
            "We are preparing the capability matrix and skill gaps.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar skills management", "We could not load skills management")}
          description={t(
            "La vista de habilidades encontro un problema al consolidar matriz y brechas.",
            "The skills workspace hit a problem while consolidating the matrix and gaps.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Skills Management", "Skills Management")}
        title={t("Catalogo y brechas de habilidades", "Skill catalog and capability gaps")}
        description={t(
          "Relaciona habilidades requeridas con evidencia real del expediente del colaborador.",
          "Connects required capabilities with actual evidence from the employee dossier.",
        )}
        badges={[
          { label: t("Skills trazadas", "Tracked skills"), value: data.gapSummary.skillsTracked, tone: "info" },
          { label: t("Brechas criticas", "Critical gaps"), value: data.gapSummary.criticalGaps, tone: "critical" },
        ]}
      />

      <DevelopmentFilters
        filters={filters}
        options={options}
        onChange={setFilter}
        onReset={resetFilters}
        onExport={exportReport}
        exportState={exportState}
        visibleFields={["companyId", "departmentId", "positionId", "levelId", "category"]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Empleados cubiertos", "Employees covered"), value: data.gapSummary.employeesCovered },
          { label: t("Departamentos con gap", "Departments with gaps"), value: data.gapSummary.departmentsWithGaps },
          { label: t("Skills catalogadas", "Catalogued skills"), value: data.gapSummary.skillsTracked },
          { label: t("Brechas criticas", "Critical gaps"), value: data.gapSummary.criticalGaps },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={form.id ? t("Editar skill observada", "Edit tracked skill") : t("Registrar skill o evidencia", "Register skill or evidence")}
            description={t(
              "Permite agregar o corregir habilidades por colaborador para que la matriz sea realmente administrable.",
              "Allows adding or correcting employee capabilities so the matrix is truly manageable.",
            )}
          >
            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Empleado", "Employee")}</span>
                <select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Habilidad", "Skill")}</span>
                <input value={form.skillName} onChange={(event) => setForm((current) => ({ ...current, skillName: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Categoria", "Category")}</span>
                <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Nivel", "Level")}</span>
                <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>
                  <option value="developing">{t("En desarrollo", "Developing")}</option>
                  <option value="advanced">{t("Avanzado", "Advanced")}</option>
                  <option value="expert">{t("Experto", "Expert")}</option>
                  <option value="critical_gap">{t("Brecha critica", "Critical gap")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Requerida", "Required")}</span>
                <select value={form.required ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, required: event.target.value === "yes" }))}>
                  <option value="no">{t("No", "No")}</option>
                  <option value="yes">{t("Si", "Yes")}</option>
                </select>
              </label>
            </div>
            <div className="development-form-actions">
              <button
                type="button"
                className="suite-button"
                onClick={async () => {
                  if (!form.employeeId || !form.skillName.trim()) {
                    setFeedback(t("Selecciona colaborador y habilidad.", "Select an employee and a skill."));
                    return;
                  }
                  const employee = data.employees.find((item) => item.id === form.employeeId);
                  await saveSkillRecord({
                    ...form,
                    employeeName: employee?.name || "",
                  });
                  setForm({ id: "", employeeId: "", skillName: "", category: "Development", level: "developing", required: false, source: "manual update" });
                  setFeedback(t("Skill guardada correctamente.", "Skill saved successfully."));
                  reload();
                }}
              >
                {form.id ? t("Actualizar skill", "Update skill") : t("Registrar skill", "Register skill")}
              </button>
              <button type="button" className="suite-button-secondary" onClick={() => setForm({ id: "", employeeId: "", skillName: "", category: "Development", level: "developing", required: false, source: "manual update" })}>
                {t("Limpiar", "Clear")}
              </button>
            </div>
            {feedback ? <p className="development-inline-feedback">{feedback}</p> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Matriz de habilidades", "Skills matrix")}
            description={t(
              "Lectura de skill por empleado, rol y nivel requerido.",
              "Skill view by employee, role, and expected level.",
            )}
          >
            <SkillsMatrixPanel
              items={data.matrix.slice(0, 14)}
              onEdit={(item) => setForm({
                id: item.id,
                employeeId: item.employeeId,
                skillName: item.skillName,
                category: item.category,
                level: item.level,
                required: item.required,
                source: item.source || "manual update",
              })}
              onDelete={async (item) => {
                await deleteSkillRecord(item.id);
                setFeedback(t("Skill eliminada correctamente.", "Skill deleted successfully."));
                reload();
              }}
            />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Brechas prioritarias", "Priority gaps")}
            description={t(
              "Competencias que limitan readiness y crecimiento.",
              "Capabilities currently limiting readiness and growth.",
            )}
          >
            <SkillGapTable items={data.topGaps} />
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Distribucion por categoria", "Distribution by category")}
            description={t(
              "Donde se concentra la demanda de capacidades.",
              "Where capability demand is concentrated.",
            )}
          >
            <div className="development-list">
              {data.byCategory.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Skills requeridas", "Required skills")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Brechas por departamento", "Gaps by department")}
            description={t(
              "Lectura ejecutiva de exposicion funcional.",
              "Executive view of functional exposure.",
            )}
          >
            <div className="development-list">
              {data.byDepartment.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Brechas", "Gaps")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>
        </div>
      </section>
    </main>
  );
}
