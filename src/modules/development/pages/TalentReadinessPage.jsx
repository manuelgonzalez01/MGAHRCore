import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import DevelopmentAuditTimeline from "../components/DevelopmentAuditTimeline";
import "../development.css";
import DevelopmentEmptyState from "../components/DevelopmentEmptyState";
import DevelopmentFilters from "../components/DevelopmentFilters";
import DevelopmentHeader from "../components/DevelopmentHeader";
import NineBoxGrid from "../components/NineBoxGrid";
import DevelopmentSectionCard from "../components/DevelopmentSectionCard";
import DevelopmentStatsCards from "../components/DevelopmentStatsCards";
import SuccessionBenchTable from "../components/SuccessionBenchTable";
import TalentReadinessCard from "../components/TalentReadinessCard";
import useDevelopmentLocale from "../hooks/useDevelopmentLocale";
import useTalentReadiness from "../hooks/useTalentReadiness";
import { saveTalentProfileRecord } from "../services/developmentDomain.service";

export default function TalentReadinessPage() {
  const { t } = useDevelopmentLocale();
  const { data, filters, options, loading, error, exportState, setFilter, resetFilters, exportReport, reload } = useTalentReadiness();
  const [searchParams] = useSearchParams();
  const requestedEmployeeId = searchParams.get("employee") || "";
  const [form, setForm] = useState({
    id: "",
    employeeId: requestedEmployeeId,
    potential: 0,
    potentialCategory: "medium",
    successionReadiness: "developing",
    successorFor: "",
    successorRoles: "",
    mobilityPreference: "in-role",
    retentionRisk: "stable",
    reviewBoard: "",
    notes: "",
  });
  const [feedback, setFeedback] = useState("");

  if (loading) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("Cargando readiness de talento", "Loading talent readiness")}
          description={t(
            "Estamos preparando la lectura de movilidad y sucesion.",
            "We are preparing the mobility and succession perspective.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page development-page">
        <DevelopmentEmptyState
          title={t("No pudimos cargar readiness", "We could not load readiness")}
          description={t(
            "La vista de readiness encontro un problema al consolidar movilidad y sucesion.",
            "The readiness workspace hit a problem while consolidating mobility and succession signals.",
          )}
        />
      </main>
    );
  }

  return (
    <main className="suite-page development-page">
      <DevelopmentHeader
        eyebrow={t("Talent Readiness", "Talent Readiness")}
        title={t("Preparacion para movilidad y crecimiento", "Readiness for mobility and growth")}
        description={t(
          "Identifica talento listo, talento en preparacion y focos criticos para sucesion interna.",
          "Identifies ready talent, developing talent, and critical succession focus areas.",
        )}
        badges={[
          { label: t("Ready now", "Ready now"), value: data.summary.readyNow, tone: "success" },
          { label: t("Prioridad critica", "Critical priority"), value: data.summary.criticalPriority, tone: "critical" },
        ]}
      />

      <DevelopmentFilters
        filters={filters}
        options={options}
        onChange={setFilter}
        onReset={resetFilters}
        onExport={exportReport}
        exportState={exportState}
        visibleFields={["companyId", "departmentId", "levelId", "readiness"]}
      />

      <DevelopmentStatsCards
        items={[
          { label: t("Ready now", "Ready now"), value: data.summary.readyNow },
          { label: t("Ready soon", "Ready soon"), value: data.summary.readySoon },
          { label: t("Prioridad critica", "Critical priority"), value: data.summary.criticalPriority },
          { label: t("Readiness promedio", "Average readiness"), value: `${data.summary.averageReadiness}%` },
        ]}
      />

      <section className="development-grid">
        <div className="development-columns">
          <DevelopmentSectionCard
            title={form.id ? t("Editar talent review", "Edit talent review") : t("Registrar talent review", "Register talent review")}
            description={t(
              "Define potencial, sucesion, riesgo de retencion y movilidad para conversaciones reales de talento.",
              "Define potential, succession, retention risk, and mobility for real talent review conversations.",
            )}
          >
            <div className="development-form-grid">
              <label className="development-filter">
                <span>{t("Colaborador", "Employee")}</span>
                <select value={form.employeeId} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.readiness.map((item) => <option key={item.employeeId} value={item.employeeId}>{item.employeeName}</option>)}
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Potencial", "Potential")}</span>
                <input type="number" min="0" max="100" value={form.potential} onChange={(event) => setForm((current) => ({ ...current, potential: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Categoria de potencial", "Potential category")}</span>
                <select value={form.potentialCategory} onChange={(event) => setForm((current) => ({ ...current, potentialCategory: event.target.value }))}>
                  <option value="emerging">{t("Emergente", "Emerging")}</option>
                  <option value="medium">{t("Media", "Medium")}</option>
                  <option value="high">{t("Alta", "High")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Readiness de sucesion", "Succession readiness")}</span>
                <select value={form.successionReadiness} onChange={(event) => setForm((current) => ({ ...current, successionReadiness: event.target.value }))}>
                  <option value="developing">{t("En desarrollo", "Developing")}</option>
                  <option value="ready_soon">{t("Listo pronto", "Ready soon")}</option>
                  <option value="ready_now">{t("Listo ahora", "Ready now")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Sucesor para", "Successor for")}</span>
                <input value={form.successorFor} onChange={(event) => setForm((current) => ({ ...current, successorFor: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Roles sucesorios adicionales", "Additional successor roles")}</span>
                <textarea value={form.successorRoles} onChange={(event) => setForm((current) => ({ ...current, successorRoles: event.target.value }))} placeholder={t("Ejemplo: HRBP Senior, Head of Talent", "Example: Senior HRBP, Head of Talent")} />
              </label>
              <label className="development-filter">
                <span>{t("Movilidad", "Mobility")}</span>
                <select value={form.mobilityPreference} onChange={(event) => setForm((current) => ({ ...current, mobilityPreference: event.target.value }))}>
                  <option value="in-role">{t("En rol actual", "In role")}</option>
                  <option value="cross-functional">{t("Transversal", "Cross-functional")}</option>
                  <option value="leadership-track">{t("Track de liderazgo", "Leadership track")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Riesgo de retencion", "Retention risk")}</span>
                <select value={form.retentionRisk} onChange={(event) => setForm((current) => ({ ...current, retentionRisk: event.target.value }))}>
                  <option value="stable">{t("Estable", "Stable")}</option>
                  <option value="watch">{t("Vigilar", "Watch")}</option>
                  <option value="critical">{t("Critico", "Critical")}</option>
                </select>
              </label>
              <label className="development-filter">
                <span>{t("Mesa de talento", "Review board")}</span>
                <input value={form.reviewBoard} onChange={(event) => setForm((current) => ({ ...current, reviewBoard: event.target.value }))} />
              </label>
              <label className="development-filter">
                <span>{t("Notas", "Notes")}</span>
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </label>
            </div>
            <div className="development-form-actions">
              <button type="button" className="suite-button" onClick={async () => {
                if (!form.employeeId) {
                  setFeedback(t("Selecciona un colaborador.", "Select an employee."));
                  return;
                }
                const employee = data.readiness.find((item) => item.employeeId === form.employeeId);
                await saveTalentProfileRecord({
                  ...form,
                  employeeName: employee?.employeeName || "",
                  successorRoles: [form.successorFor, ...form.successorRoles.split(/[\n,;]/)].map((item) => item.trim()).filter(Boolean),
                });
                setForm({ id: "", employeeId: requestedEmployeeId || "", potential: 0, potentialCategory: "medium", successionReadiness: "developing", successorFor: "", successorRoles: "", mobilityPreference: "in-role", retentionRisk: "stable", reviewBoard: "", notes: "" });
                setFeedback(t("Talent review guardado correctamente.", "Talent review saved successfully."));
                reload();
              }}>{form.id ? t("Actualizar review", "Update review") : t("Registrar review", "Register review")}</button>
            </div>
            {feedback ? <p className="development-inline-feedback">{feedback}</p> : null}
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Talento priorizado", "Prioritized talent")}
            description={t(
              "Lectura nominativa para decisiones de crecimiento interno.",
              "Named view for internal growth decisions.",
            )}
          >
            <div className="development-readiness-grid">
              {data.readiness.slice(0, 8).map((item) => (
                <button
                  key={item.employeeId}
                  type="button"
                  className="development-card-button"
                  onClick={() => {
                    const profile = data.talentProfiles.find((record) => record.employeeId === item.employeeId);
                    setForm({
                      id: profile?.id || "",
                      employeeId: item.employeeId,
                      potential: profile?.potential ?? item.potential ?? 0,
                      potentialCategory: profile?.potentialCategory || "medium",
                      successionReadiness: profile?.successionReadiness || item.promotionReadiness,
                      successorFor: profile?.successorFor || item.successorFor || "",
                      successorRoles: (profile?.successorRoles || item.successorRoles || []).join(", "),
                      mobilityPreference: profile?.mobilityPreference || item.mobilityPreference || "in-role",
                      retentionRisk: profile?.retentionRisk || item.retentionRisk || "stable",
                      reviewBoard: profile?.reviewBoard || item.reviewBoard || "",
                      notes: profile?.notes || item.notes || "",
                    });
                  }}
                >
                  <TalentReadinessCard item={item} />
                </button>
              ))}
            </div>
          </DevelopmentSectionCard>
        </div>

        <div className="development-rail">
          <DevelopmentSectionCard
            title={t("Readiness por nivel", "Readiness by level")}
            description={t(
              "Concentracion de talento preparado por estrato organizacional.",
              "Concentration of prepared talent by organizational tier.",
            )}
          >
            <div className="development-list">
              {data.byLevel.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Colaboradores", "Employees")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Distribucion de readiness", "Readiness distribution")}
            description={t(
              "Balance entre talento listo y talento en desarrollo.",
              "Balance between ready and developing talent.",
            )}
          >
            <div className="development-list">
              {data.byReadiness.map((item) => (
                <article key={item.label}>
                  <strong>{item.label}</strong>
                  <p className="development-muted">{t("Colaboradores", "Employees")}: {item.count}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("9-box de talento", "Talent 9-box")}
            description={t(
              "Lectura de calibracion para comite de talento.",
              "Calibration view for talent committee discussions.",
            )}
          >
            <NineBoxGrid items={data.nineBox} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Slate de sucesion", "Succession slate")}
            description={t(
              "Colaboradores ya nominados para movilidad o sucesion.",
              "Employees already nominated for succession or mobility scenarios.",
            )}
          >
            <div className="development-list">
              {data.successionSlate.slice(0, 6).map((item) => (
                <article key={`${item.employeeId}-successor`}>
                  <strong>{item.employeeName}</strong>
                  <p className="development-muted">{t("Posicion objetivo", "Target role")}: {(item.successorRoles || []).join(", ") || item.successorFor}</p>
                </article>
              ))}
            </div>
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Roles criticos y bench", "Critical roles and bench")}
            description={t(
              "Cobertura real de posiciones criticas y profundidad de sucesion.",
              "Actual coverage for critical roles and succession bench depth.",
            )}
          >
            <SuccessionBenchTable items={data.criticalRoles} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Snapshots de sucesion", "Succession snapshots")}
            description={t(
              "Historial reciente de cambios en bench y nominaciones criticas.",
              "Recent history of bench and critical nominations changes.",
            )}
          >
            <DevelopmentAuditTimeline items={data.successionSnapshots.map((item) => ({
              ...item,
              title: `${item.employeeName} | ${(item.successorRoles || []).join(", ")}`,
              description: `${item.successionReadiness} | ${item.reviewBoard}`,
            }))} />
          </DevelopmentSectionCard>

          <DevelopmentSectionCard
            title={t("Auditoria de talent review", "Talent review audit")}
            description={t(
              "Ultimos cambios de readiness, sucesion y riesgo de retencion.",
              "Latest readiness, succession, and retention risk changes.",
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
