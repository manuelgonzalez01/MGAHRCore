import { Link, useSearchParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../development.css";
import DevelopmentAuditTimeline from "../components/DevelopmentAuditTimeline";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentPlanCard from "../components/DevelopmentPlanCard";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import EvaluationDetailsCard from "../components/EvaluationDetailsCard";
import SkillGapTable from "../components/SkillGapTable";
import TalentReadinessCard from "../components/TalentReadinessCard";
import TrainingCompliancePanel from "../components/TrainingCompliancePanel";
import useDevelopmentDossier from "../hooks/useDevelopmentDossier";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentDossierPage() {
  const { t } = useDevelopmentLocale();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employee") || "";
  const { data, loading, error } = useDevelopmentDossier(employeeId);

  if (!employeeId) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Selecciona un colaborador", "Select an employee")}
          description={t(
            "Abre este dossier desde Employees o desde las vistas de talento para consolidar la ficha estrategica.",
            "Open this dossier from Employees or talent views to consolidate the strategic profile.",
          )}
        />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando dossier de desarrollo", "Loading development dossier")}
          description={t(
            "Estamos consolidando skills, evaluaciones, planes, training y sucesion del colaborador.",
            "We are consolidating the employee skills, evaluations, plans, training, and succession view.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos construir el dossier", "We could not build the dossier")}
          description={error?.message || t(
            "El expediente de desarrollo no pudo consolidarse.",
            "The development dossier could not be consolidated.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={data.employee.company}
        title={data.employee.name}
        description={`${data.employee.position} | ${data.employee.department} | ${data.employee.levelName}`}
        badges={[
          { label: t("Readiness", "Readiness"), value: `${data.summary.readiness}%`, tone: "info" },
          { label: t("Bench depth", "Bench depth"), value: data.summary.successionBenchDepth, tone: "warning" },
        ]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Dossier strength", "Dossier strength"), value: `${data.summary.dossierStrength}%` },
          { label: t("Planes activos", "Active plans"), value: data.summary.activePlans },
          { label: t("Brechas criticas", "Critical gaps"), value: data.summary.skillGaps },
          { label: t("Training pendiente", "Pending training"), value: data.summary.pendingTraining },
          { label: t("Score evaluacion", "Evaluation score"), value: data.summary.evaluationScore },
          { label: t("Movilidad", "Mobility"), value: data.summary.mobility },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={t("Ficha estrategica de talento", "Strategic talent dossier")}
            description={t(
              "Lectura consolidada del talento con contexto organizacional, readiness, sucesion y riesgo.",
              "Consolidated talent readout with organizational context, readiness, succession, and risk.",
            )}
          >
            <div className="development-list">
              <article className="development-list-item">
                <span>{t("Manager", "Manager")}</span>
                <strong>{data.employee.manager || "-"}</strong>
                <p className="development-muted">{t("Proximo hito", "Next milestone")}: {data.employee.nextMilestone}</p>
              </article>
              <article className="development-list-item">
                <span>{t("Sucesion", "Succession")}</span>
                <strong>{data.talentProfile?.successorRoles?.join(", ") || t("Sin rol objetivo", "No target role yet")}</strong>
                <p className="development-muted">{t("Riesgo de retencion", "Retention risk")}: {data.summary.retentionRisk}</p>
              </article>
              <article className="development-list-item">
                <span>{t("Notas clave", "Key notes")}</span>
                <strong>{data.talentProfile?.reviewBoard || data.readiness?.reviewBoard || "-"}</strong>
                <p className="development-muted">{data.talentProfile?.notes || data.employee.executiveInsight}</p>
              </article>
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Brechas vs rol y nivel", "Gap vs role and level")}
            description={t(
              "Skills requeridas, validadas y brechas abiertas para la posicion actual.",
              "Required, validated, and open skills gaps for the current role.",
            )}
          >
            <SkillGapTable items={data.gapSummary.gapItems} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Evaluaciones historicas", "Evaluation history")}
            description={t(
              "Cobertura reciente de ciclos, competencias y score.",
              "Recent cycle coverage, competencies, and score.",
            )}
          >
            <div className="development-readiness-grid">
              {data.evaluations.slice(0, 3).map((evaluation) => (
                <EvaluationDetailsCard key={evaluation.id} evaluation={evaluation} />
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Planes activos e historicos", "Active and historical plans")}
            description={t(
              "Planes del colaborador con workflow, progreso y foco de desarrollo.",
              "Employee plans with workflow, progress, and development focus.",
            )}
          >
            <div className="development-readiness-grid">
              {data.plans.map((plan) => (
                <DevelopmentPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Timeline de talento", "Talent timeline")}
            description={t(
              "Historial consolidado de talento, evaluaciones, workflow y eventos del expediente.",
              "Consolidated history of talent, evaluations, workflow, and dossier events.",
            )}
          >
            <DevelopmentAuditTimeline items={data.timeline} />
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Readiness y movilidad", "Readiness and mobility")}
            description={t(
              "Lectura ejecutiva de preparacion, potencial y movilidad interna.",
              "Executive readout of readiness, potential, and internal mobility.",
            )}
          >
            {data.readiness ? <TalentReadinessCard item={data.readiness} /> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Training completado y pendiente", "Completed and pending training")}
            description={t(
              "Programas obligatorios y complementarios conectados al area del colaborador.",
              "Mandatory and complementary programs linked to the employee area.",
            )}
          >
            <TrainingCompliancePanel items={data.training.programs.slice(0, 4)} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Bench para el rol actual", "Bench for the current role")}
            description={t(
              "Sucesores comparables para la posicion actual del colaborador.",
              "Comparable successors for the employee current role.",
            )}
          >
            <div className="development-list">
              {data.successorsForRole.length ? data.successorsForRole.map((item) => (
                <article key={`${item.employeeId}-${item.employeeName}`} className="development-list-item">
                  <span>{item.readiness}</span>
                  <strong>{item.employeeName}</strong>
                  <p className="development-muted">{t("Potencial", "Potential")}: {item.potential} | {t("Comparativo", "Comparison")}: {item.comparisonSignal}</p>
                </article>
              )) : <p className="development-muted">{t("No hay bench registrado para este rol.", "No bench registered for this role yet.")}</p>}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Auditoria del expediente", "Dossier audit")}
            description={t(
              "Ultimos cambios sobre readiness, planes, evaluaciones y sucesion.",
              "Latest changes across readiness, plans, evaluations, and succession.",
            )}
          >
            <DevelopmentAuditTimeline items={data.auditLog.map((item) => ({
              ...item,
              title: item.summary,
              description: `${item.actorName} | ${item.entityType}`,
            }))} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Accesos cruzados", "Cross-module actions")}
            description={t(
              "Navegacion directa entre Employees y Development para gobernanza real.",
              "Direct navigation between Employees and Development for real governance.",
            )}
          >
            <div className="development-row-actions">
              <Link to={`/employees/profile?employee=${data.employee.id}`} className="suite-button-secondary">{t("Abrir Employee 360", "Open Employee 360")}</Link>
              <Link to={`/development/plan?employee=${data.employee.id}`} className="suite-button-secondary">{t("Abrir plan de desarrollo", "Open development plan")}</Link>
              <Link to={`/development/readiness?employee=${data.employee.id}`} className="suite-button-secondary">{t("Abrir talent review", "Open talent review")}</Link>
            </div>
          </DevelopmentSectionCard>
        </div>
      </section>
    </main>
  );
}
