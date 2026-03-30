import { useState } from "react";
import "../../shared/hrSuite.css";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import EvaluationCyclesTable from "../components/EvaluationCyclesTable";
import EvaluationDetailsCard from "../components/EvaluationDetailsCard";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import useEvaluations from "../hooks/useEvaluations";
import { saveEvaluationCycle, saveEvaluationRecord, deleteEvaluationRecord } from "../services/developmentDomain.service";

function competenciesToText(competencies = []) {
  return competencies.map((item) => `${item.skillName}|${item.expectedLevel}|${item.currentScore}`).join("\n");
}

function textToCompetencies(value = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [skillName = "", expectedLevel = "4", currentScore = "0"] = line.split("|");
      const expected = Number(expectedLevel) || 4;
      const current = Number(currentScore) || 0;
      return {
        skillName: skillName.trim(),
        expectedLevel: expected,
        currentScore: current,
        gap: Number((expected - current).toFixed(1)),
      };
    });
}

export default function EvaluationsPage() {
  const { t } = useDevelopmentLocale();
  const { data, filters, options, loading, error, exportState, setFilter, resetFilters, exportReport, reload } = useEvaluations();
  const [cycleForm, setCycleForm] = useState({ id: "", name: "", dueDate: "", owner: "", status: "scheduled" });
  const [evaluationForm, setEvaluationForm] = useState({ id: "", cycleId: "", employeeId: "", evaluator: "", score: 0, status: "scheduled", observations: "", competenciesText: "" });
  const [feedback, setFeedback] = useState("");

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando evaluaciones", "Loading evaluations")}
          description={t(
            "Estamos preparando ciclos, scores y competencias evaluadas.",
            "We are preparing cycles, scores, and assessed competencies.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar evaluaciones", "We could not load evaluations")}
          description={t(
            "La vista de evaluaciones encontro un problema al consolidar ciclos o scores.",
            "The evaluations workspace hit a problem while consolidating cycles or scores.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Sistema de evaluacion", "Evaluation System")}
        title={t("Ciclos y detalle de evaluaciones", "Evaluation cycles and assessment detail")}
        description={t(
          "Controla cobertura, score y observaciones para performance y crecimiento.",
          "Controls coverage, score, and observations for performance and growth.",
        )}
        badges={[
          { label: t("Ciclos", "Cycles"), value: data.summary.cycles, tone: "info" },
          { label: t("Score promedio", "Average score"), value: data.summary.averageScore, tone: "success" },
        ]}
      />

      <DevelopmentFilters
        filters={filters}
        options={options}
        onChange={setFilter}
        onReset={resetFilters}
        onExport={exportReport}
        exportState={exportState}
        visibleFields={["companyId", "departmentId", "levelId", "cycleId", "status"]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Evaluaciones completadas", "Completed evaluations"), value: data.summary.completedEvaluations },
          { label: t("En progreso", "In progress"), value: data.summary.inProgressEvaluations },
          { label: t("Score promedio", "Average score"), value: data.summary.averageScore },
          { label: t("Ciclos activos", "Active cycles"), value: data.summary.cycles },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={t("Administrar ciclos y evaluaciones", "Manage cycles and evaluations")}
            description={t(
              "Registra ciclos, asigna evaluadores y actualiza score u observaciones.",
              "Register cycles, assign evaluators, and update scores or observations.",
            )}
          >
            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Nombre del ciclo", "Cycle name")}</span>
                <input value={cycleForm.name} onChange={(event) => setCycleForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Fecha objetivo", "Due date")}</span>
                <input type="date" value={cycleForm.dueDate} onChange={(event) => setCycleForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Responsable", "Owner")}</span>
                <input value={cycleForm.owner} onChange={(event) => setCycleForm((current) => ({ ...current, owner: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Estado", "Status")}</span>
                <select value={cycleForm.status} onChange={(event) => setCycleForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="scheduled">{t("Programada", "Scheduled")}</option>
                  <option value="in_progress">{t("En progreso", "In progress")}</option>
                  <option value="completed">{t("Completada", "Completed")}</option>
                </select>
              </label>
            </div>
            <div className="development-form-actions">
              <button type="button" className="suite-button-secondary" onClick={async () => {
                if (!cycleForm.name.trim()) {
                  setFeedback(t("El ciclo necesita un nombre.", "The cycle needs a name."));
                  return;
                }
                await saveEvaluationCycle(cycleForm);
                setCycleForm({ id: "", name: "", dueDate: "", owner: "", status: "scheduled" });
                setFeedback(t("Ciclo guardado correctamente.", "Cycle saved successfully."));
                reload();
              }}>{cycleForm.id ? t("Actualizar ciclo", "Update cycle") : t("Registrar ciclo", "Register cycle")}</button>
            </div>

            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Colaborador", "Employee")}</span>
                <select value={evaluationForm.employeeId} onChange={(event) => setEvaluationForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Ciclo", "Cycle")}</span>
                <select value={evaluationForm.cycleId} onChange={(event) => setEvaluationForm((current) => ({ ...current, cycleId: event.target.value }))}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name}</option>)}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Evaluador", "Evaluator")}</span>
                <input value={evaluationForm.evaluator} onChange={(event) => setEvaluationForm((current) => ({ ...current, evaluator: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Score", "Score")}</span>
                <input type="number" min="0" max="5" step="0.1" value={evaluationForm.score} onChange={(event) => setEvaluationForm((current) => ({ ...current, score: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Estado", "Status")}</span>
                <select value={evaluationForm.status} onChange={(event) => setEvaluationForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="scheduled">{t("Programada", "Scheduled")}</option>
                  <option value="in_review">{t("En revision", "In review")}</option>
                  <option value="completed">{t("Completada", "Completed")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Observaciones", "Observations")}</span>
                <textarea value={evaluationForm.observations} onChange={(event) => setEvaluationForm((current) => ({ ...current, observations: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Competencias", "Competencies")}</span>
                <textarea
                  value={evaluationForm.competenciesText}
                  onChange={(event) => setEvaluationForm((current) => ({ ...current, competenciesText: event.target.value }))}
                  placeholder={t("Formato: competencia|esperado|actual", "Format: competency|expected|current")}
                />
              </label>
            </div>
            <div className="development-form-actions">
              <button type="button" className="suite-button" onClick={async () => {
                if (!evaluationForm.employeeId || !evaluationForm.cycleId) {
                  setFeedback(t("Selecciona colaborador y ciclo.", "Select an employee and a cycle."));
                  return;
                }
                const employee = data.employees.find((item) => item.id === evaluationForm.employeeId);
                const cycle = data.cycles.find((item) => item.id === evaluationForm.cycleId);
                await saveEvaluationRecord({
                  ...evaluationForm,
                  employeeName: employee?.name || "",
                  cycleName: cycle?.name || "",
                  competencies: textToCompetencies(evaluationForm.competenciesText),
                });
                setEvaluationForm({ id: "", cycleId: "", employeeId: "", evaluator: "", score: 0, status: "scheduled", observations: "", competenciesText: "" });
                setFeedback(t("Evaluacion guardada correctamente.", "Evaluation saved successfully."));
                reload();
              }}>{evaluationForm.id ? t("Actualizar evaluacion", "Update evaluation") : t("Registrar evaluacion", "Register evaluation")}</button>
            </div>
            {feedback ? <p className="development-inline-feedback">{feedback}</p> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Ciclos de evaluacion", "Evaluation cycles")}
            description={t("Seguimiento de cobertura y cierre por ciclo.", "Track coverage and closure by cycle.")}
          >
            <EvaluationCyclesTable items={data.cycles} onEdit={(item) => setCycleForm({ id: item.id, name: item.name, dueDate: item.dueDate, owner: item.owner, status: item.status })} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Evaluaciones destacadas", "Highlighted evaluations")}
            description={t(
              "Detalle de competencias y observaciones por colaborador.",
              "Detailed competencies and observations by employee.",
            )}
          >
            <div className="development-readiness-grid">
              {data.evaluations.slice(0, 4).map((evaluation) => (
                <EvaluationDetailsCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  onEdit={(item) => setEvaluationForm({ id: item.id, cycleId: item.cycleId, employeeId: item.employeeId, evaluator: item.evaluator, score: item.score, status: item.status, observations: item.observations || "", competenciesText: competenciesToText(item.competencies || []) })}
                  onDelete={async (item) => {
                    await deleteEvaluationRecord(item.id);
                    setFeedback(t("Evaluacion eliminada correctamente.", "Evaluation deleted successfully."));
                    reload();
                  }}
                />
              ))}
            </div>
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Promedio por area", "Average by department")}
            description={t(
              "Lectura funcional del score de evaluacion.",
              "Functional reading of evaluation performance by department.",
            )}
          >
            <div className="development-list">
              {data.byDepartment.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Score acumulado", "Aggregate score")}: {item.value}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Distribucion de estatus", "Status distribution")}
            description={t(
              "Estado operativo de la evaluacion actual.",
              "Operational status of current evaluation execution.",
            )}
          >
            <div className="development-list">
              {data.statusDistribution.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Colaboradores", "Employees")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>
        </div>
      </section>
    </main>
  );
}
