import "../../shared/hrSuite.css";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import DevelopmentPlansTable from "../components/DevelopmentPlansTable";
import DevelopmentQuickActions from "../components/DevelopmentQuickActions";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import EvaluationCyclesTable from "../components/EvaluationCyclesTable";
import NineBoxGrid from "../components/NineBoxGrid";
import SkillGapTable from "../components/SkillGapTable";
import SuccessionBenchTable from "../components/SuccessionBenchTable";
import TalentReadinessCard from "../components/TalentReadinessCard";
import TrainingCompliancePanel from "../components/TrainingCompliancePanel";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useDevelopmentDashboard from "../hooks/useDevelopmentDashboard";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentHomePage() {
  const { t, language } = useDevelopmentLocale();
  const {
    data,
    filters,
    options,
    loading,
    error,
    exportState,
    setFilter,
    resetFilters,
    exportReport,
  } = useDevelopmentDashboard();

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando desarrollo del talento", "Loading talent development")}
          description={t(
            "Estamos consolidando skills, evaluaciones, planes, training y readiness.",
            "We are consolidating skills, evaluations, plans, training, and readiness.",
          )}
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar el centro de desarrollo", "We could not load the development hub")}
          description={t(
            "El modulo encontro un error al consolidar skills, evaluaciones, planes o training. Ya no quedara pegado en carga y ahora mostrara el estado de falla para poder corregirlo.",
            "The module hit an error while consolidating skills, evaluations, plans, or training. It will no longer stay stuck loading and will now show the failure state for diagnosis.",
          )}
        />
        <section className="development-card">
          <p className="development-muted"><strong>{t("Detalle tecnico", "Technical detail")}:</strong> {error.message}</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Sin datos de desarrollo", "No development data available")}
          description={t(
            "No fue posible construir el workspace de talento.",
            "The talent workspace could not be built.",
          )}
        />
      </main>
    );
  }

  if (data.stats.employeesTracked === 0) {
    return (
      <main className="suite-page development-page">
        <DevelopmentHeader
          eyebrow={t("Talent Development System", "Talent Development System")}
          title={t("Centro ejecutivo de desarrollo", "Executive development hub")}
          description={t(
            "El modulo ya esta listo, pero aun no hay colaboradores reales cargados para construir skills, evaluaciones, planes o sucesion.",
            "The module is ready, but there are no real employees loaded yet to build skills, evaluations, plans, or succession.",
          )}
          badges={[{ label: t("Colaboradores", "Employees"), value: 0, tone: "info" }]}
        />
        <DevelopmentEmptyState
          title={t("Todavia no hay talento cargado", "No talent loaded yet")}
          description={t(
            "Crea o aprueba colaboradores en Employees para activar automaticamente el ecosistema de development con datos organizacionales reales.",
            "Create or approve employees in Employees to activate the development ecosystem with real organizational data.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Talent Development System", "Talent Development System")}
        title={t("Centro ejecutivo de desarrollo", "Executive development hub")}
        description={t(
          "Consolida brechas de competencias, evaluaciones, planes, training y readiness para decisiones reales de talento.",
          "Consolidates capability gaps, evaluations, plans, training, and readiness for real talent decisions.",
        )}
        badges={[
          { label: t("Colaboradores", "Employees"), value: data.stats.employeesTracked, tone: "info" },
          { label: t("Ready now", "Ready now"), value: data.stats.readyNow, tone: "success" },
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
          {
            label: t("Colaboradores trazados", "Employees tracked"),
            value: data.stats.employeesTracked,
            helper: t(
              "Base conectada a Employees y Administration.",
              "Connected base from Employees and Administration.",
            ),
          },
          {
            label: t("Planes activos", "Active plans"),
            value: data.stats.activePlans,
            helper: t(
              "Planes en ejecucion con responsables definidos.",
              "Plans currently running with assigned owners.",
            ),
          },
          {
            label: t("Brechas criticas", "Critical gaps"),
            value: data.stats.criticalGaps,
            helper: t(
              "Brechas con impacto directo sobre readiness.",
              "Gaps directly affecting readiness.",
            ),
          },
          {
            label: t("Activos de aprendizaje", "Learning assets"),
            value: data.stats.learningAssets,
            helper: t(
              "Inscripciones activas en programas y cursos.",
              "Active enrollments across programs and learning tracks.",
            ),
          },
          {
            label: t("Ciclos de evaluacion", "Evaluation cycles"),
            value: data.stats.evaluationCycles,
            helper: t(
              "Cobertura vigente de feedback y score.",
              "Active coverage of feedback and performance scoring.",
            ),
          },
          {
            label: t("Talento listo", "Ready talent"),
            value: data.stats.readyNow,
            helper: t(
              "Colaboradores con movilidad o promocion viable.",
              "Employees with viable promotion or mobility readiness.",
            ),
          },
          {
            label: t("Roles criticos expuestos", "Exposed critical roles"),
            value: data.stats.criticalRoles,
            helper: t(
              "Roles sin bench listo o suficiente cobertura de sucesion.",
              "Roles without ready bench or sufficient succession coverage.",
            ),
          },
        ]}
      />

      <DevelopmentQuickActions actions={data.quickActions} />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={t("Brechas de capacidades prioritarias", "Priority capability gaps")}
            description={t(
              "Lectura operativa de skills faltantes por rol y area.",
              "Operational view of missing skills by role and area.",
            )}
          >
            <SkillGapTable items={data.skillsWorkspace.topGaps.slice(0, 8)} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Planes de desarrollo activos", "Active development plans")}
            description={t(
              "Seguimiento de avance, owner y fecha objetivo.",
              "Track progress, owner, and target dates.",
            )}
          >
            <DevelopmentPlansTable items={data.plansWorkspace.plans.slice(0, 8)} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Ciclos de evaluacion", "Evaluation cycles")}
            description={t("Estado de cobertura y avance por ciclo.", "Cycle coverage and completion progress.")}
          >
            <EvaluationCyclesTable items={data.evaluationsWorkspace.cycles} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Programas de training con riesgo", "Training programs needing attention")}
            description={t(
              "Cumplimiento y exposicion de programas clave.",
              "Compliance and exposure of strategic programs.",
            )}
          >
            <TrainingCompliancePanel items={data.trainingWorkspace.programs.slice(0, 4)} />
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Insights del modulo", "Module insights")}
            description={t(
              "Indicadores ejecutivos para conversaciones de talento.",
              "Executive indicators for talent conversations.",
            )}
          >
            <div className="development-list">
              {data.insights.map((insight) => (
                <article key={insight.title}>
                  <strong>{insight.title}</strong>
                  <p className="development-muted">{insight.helper}</p>
                  <span className="development-chip">{insight.value}</span>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Readiness y movilidad", "Readiness and mobility")}
            description={t(
              "Talento con mayor preparacion para crecimiento interno.",
              "Talent most prepared for internal growth scenarios.",
            )}
          >
            <div className="development-readiness-grid">
              {data.readinessWorkspace.readiness.slice(0, 4).map((item) => (
                <TalentReadinessCard key={item.employeeId} item={item} />
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("9-box de talento", "Talent 9-box")}
            description={t(
              "Calibracion rapida entre potencial y performance/readiness.",
              "Quick calibration across potential and performance/readiness.",
            )}
          >
            <NineBoxGrid items={data.readinessWorkspace.nineBox} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Bench de sucesion", "Succession bench")}
            description={t(
              "Exposicion de roles criticos y profundidad de reemplazo.",
              "Critical role exposure and replacement bench depth.",
            )}
          >
            <SuccessionBenchTable items={data.readinessWorkspace.criticalRoles.slice(0, 6)} />
          </DevelopmentSectionCard>
        </div>
      </section>

      <ModuleConnectionsPanel moduleKey="development" language={language} />
    </main>
  );
}
