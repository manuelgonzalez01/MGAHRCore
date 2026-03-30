import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import DevelopmentAuditTimeline from "../components/DevelopmentAuditTimeline";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentObjectivesEditor from "../components/DevelopmentObjectivesEditor";
import DevelopmentPlanCard from "../components/DevelopmentPlanCard";
import DevelopmentPlansTable from "../components/DevelopmentPlansTable";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import DevelopmentWorkflowPanel from "../components/DevelopmentWorkflowPanel";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import useDevelopmentPlans from "../hooks/useDevelopmentPlans";
import { emptyPlanObjective } from "../utils/developmentPlan.factory";
import { getWorkflowStatusLabel } from "../utils/developmentWorkflow.labels";
import {
  PLAN_WORKFLOW,
  deleteDevelopmentPlanRecord,
  saveDevelopmentPlanRecord,
  transitionDevelopmentPlanState,
} from "../services/developmentDomain.service";

export default function DevelopmentPlanPage() {
  const { t } = useDevelopmentLocale();
  const { data, filters, options, loading, error, exportState, setFilter, resetFilters, exportReport, reload } = useDevelopmentPlans();
  const [searchParams] = useSearchParams();
  const requestedEmployeeId = searchParams.get("employee") || "";
  const [form, setForm] = useState({
    id: "",
    employeeId: requestedEmployeeId,
    owner: "",
    sponsor: "",
    workflowStatus: "draft",
    readiness: 0,
    targetDate: "",
    nextMilestone: "",
    workflowComment: "",
    objectives: [emptyPlanObjective()],
  });
  const [feedback, setFeedback] = useState("");
  const [workflowComment, setWorkflowComment] = useState("");
  const selectedPlan = useMemo(() => data?.plans.find((item) => item.id === form.id) || null, [data, form.id]);

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando planes de desarrollo", "Loading development plans")}
          description={t(
            "Estamos consolidando objetivos, owners y progreso.",
            "We are consolidating objectives, owners, and progress.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar los planes", "We could not load development plans")}
          description={t(
            "La vista de planes encontro un problema al consolidar objetivos, owners o progreso.",
            "The plans workspace hit a problem while consolidating goals, owners, or progress.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Planes de desarrollo", "Development Plans")}
        title={t("Planes de desarrollo activos", "Active development plans")}
        description={t(
          "Gestiona objetivos, responsables, milestones y seguimiento para crecimiento interno.",
          "Manage goals, owners, milestones, and follow-up for internal growth.",
        )}
        badges={[
          { label: t("Activos", "Active"), value: data.summary.activePlans, tone: "warning" },
          { label: t("Pendientes de aprobacion", "Pending approvals"), value: data.summary.pendingApprovals, tone: "info" },
        ]}
      />

      <DevelopmentFilters
        filters={filters}
        options={options}
        onChange={setFilter}
        onReset={resetFilters}
        onExport={exportReport}
        exportState={exportState}
        visibleFields={["companyId", "departmentId", "positionId", "levelId", "status"]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Planes activos", "Active plans"), value: data.summary.activePlans },
          { label: t("Planes en riesgo", "Plans at risk"), value: data.summary.atRiskPlans },
          { label: t("Pendientes de aprobacion", "Pending approvals"), value: data.summary.pendingApprovals },
          { label: t("Planes completados", "Completed plans"), value: data.summary.completedPlans },
          { label: t("Avance promedio", "Average progress"), value: `${data.summary.averageProgress}%` },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={form.id ? t("Editar plan de desarrollo", "Edit development plan") : t("Registrar plan de desarrollo", "Register development plan")}
            description={t(
              "Permite crear o actualizar planes con flujo, objetivos, acciones, riesgos y evidencia.",
              "Allows creating or updating plans with workflow, objectives, actions, risks, and evidence.",
            )}
          >
            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Colaborador", "Employee")}</span>
                <select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Responsable", "Owner")}</span>
                <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Patrocinador", "Sponsor")}</span>
                <input value={form.sponsor} onChange={(event) => setForm((current) => ({ ...current, sponsor: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Flujo", "Workflow")}</span>
                <select value={form.workflowStatus} onChange={(event) => setForm((current) => ({ ...current, workflowStatus: event.target.value }))}>
                  {Object.keys(PLAN_WORKFLOW).map((status) => (
                    <option key={status} value={status}>{getWorkflowStatusLabel(status, t)}</option>
                  ))}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Preparacion", "Readiness")}</span>
                <input type="number" min="0" max="100" value={form.readiness} onChange={(event) => setForm((current) => ({ ...current, readiness: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Fecha objetivo", "Target date")}</span>
                <input type="date" value={form.targetDate} onChange={(event) => setForm((current) => ({ ...current, targetDate: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Siguiente hito", "Next milestone")}</span>
                <input value={form.nextMilestone} onChange={(event) => setForm((current) => ({ ...current, nextMilestone: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Comentario del plan", "Plan comment")}</span>
                <textarea
                  value={form.workflowComment}
                  onChange={(event) => setForm((current) => ({ ...current, workflowComment: event.target.value }))}
                  placeholder={t("Contexto del plan, decision o foco del ciclo.", "Plan context, decision, or cycle focus.")}
                />
              </label>
            </div>
            <DevelopmentObjectivesEditor
              value={form.objectives}
              onChange={(objectives) => setForm((current) => ({ ...current, objectives }))}
            />
            <div className="development-form-actions">
              <button type="button" className="suite-button" onClick={async () => {
                if (!form.employeeId) {
                  setFeedback(t("Selecciona un colaborador.", "Select an employee."));
                  return;
                }
                const employee = data.employees.find((item) => item.id === form.employeeId);
                await saveDevelopmentPlanRecord({
                  ...form,
                  employeeName: employee?.name || "",
                  objectives: form.objectives,
                });
                setForm({ id: "", employeeId: requestedEmployeeId || "", owner: employee?.manager || "", sponsor: employee?.department || "", workflowStatus: "draft", readiness: 0, targetDate: "", nextMilestone: "", workflowComment: "", objectives: [emptyPlanObjective()] });
                setFeedback(t("Plan guardado correctamente.", "Plan saved successfully."));
                reload();
              }}>{form.id ? t("Actualizar plan", "Update plan") : t("Registrar plan", "Register plan")}</button>
              {requestedEmployeeId ? <Link className="suite-button-secondary" to={`/development/dossier?employee=${requestedEmployeeId}`}>{t("Abrir dossier", "Open dossier")}</Link> : null}
            </div>
            {feedback ? <p className="development-inline-feedback">{feedback}</p> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Tabla operativa de planes", "Operational plans table")}
            description={t(
              "Vista de seguimiento para RRHH, leaders y talento.",
              "Tracking view for HR, people leaders, and talent office.",
            )}
          >
            <DevelopmentPlansTable
              items={data.plans}
              onEdit={(item) => {
                setForm({
                  id: item.id,
                  employeeId: item.employeeId,
                  owner: item.owner,
                  sponsor: item.sponsor || "",
                  workflowStatus: item.workflowStatus || item.status,
                  readiness: item.readiness || 0,
                  targetDate: item.targetDate,
                  nextMilestone: item.nextMilestone || "",
                  workflowComment: "",
                  objectives: item.objectives || [emptyPlanObjective()],
                });
                setWorkflowComment("");
              }}
              onDelete={async (item) => {
                await deleteDevelopmentPlanRecord(item.id);
                setFeedback(t("Plan eliminado correctamente.", "Plan deleted successfully."));
                reload();
              }}
            />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Planes destacados", "Highlighted plans")}
            description={t(
              "Planes con mayor impacto o exposicion de seguimiento.",
              "Plans with the highest impact or follow-up exposure.",
            )}
          >
            <div className="development-readiness-grid">
              {data.plans.slice(0, 4).map((plan) => (
                <DevelopmentPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Workflow y gobierno", "Workflow and governance")}
            description={t(
              "Acciones permitidas por estado, comentario de flujo y trail de aprobacion.",
              "Allowed actions by status, workflow comment, and approval trail.",
            )}
          >
            <DevelopmentWorkflowPanel
              plan={selectedPlan}
              workflow={PLAN_WORKFLOW}
              comment={workflowComment}
              setComment={setWorkflowComment}
              onTransition={async (action) => {
                if (!selectedPlan) {
                  return;
                }
                const result = await transitionDevelopmentPlanState(selectedPlan.id, {
                  action: action.key,
                  comment: workflowComment,
                });
                setFeedback(result.ok
                  ? t("Workflow actualizado correctamente.", "Workflow updated successfully.")
                  : result.error);
                setWorkflowComment("");
                reload();
              }}
            />
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Carga por responsable", "Load by owner")}
            description={t(
              "Distribucion de planes por leader o sponsor.",
              "Distribution of plans by leader or sponsor.",
            )}
          >
            <div className="development-list">
              {data.byOwner.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Planes", "Plans")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Avance por departamento", "Progress by department")}
            description={t(
              "Seguimiento ejecutivo por estructura organizacional.",
              "Executive tracking by organizational structure.",
            )}
          >
            <div className="development-list">
              {data.byDepartment.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Avance acumulado", "Aggregate progress")}: {item.value}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Auditoria de planes", "Plans audit")}
            description={t(
              "Ultimos cambios sobre estructura, workflow y decisiones de aprobacion.",
              "Latest changes across structure, workflow, and approval decisions.",
            )}
          >
            <DevelopmentAuditTimeline items={data.auditLog.map((item) => ({
              ...item,
              title: item.summary,
              description: `${item.actorName} | ${item.entityType}`,
            }))} />
          </DevelopmentSectionCard>
        </div>
      </section>
    </main>
  );
}
