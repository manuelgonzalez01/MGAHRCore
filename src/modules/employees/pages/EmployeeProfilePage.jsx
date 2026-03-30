import { Link } from "react-router-dom";
import "../employees.css";
import EmployeeProfileHero from "../components/EmployeeProfileHero";
import EmployeeTabs from "../components/EmployeeTabs";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeTimeline from "../components/EmployeeTimeline";
import EmployeeQuickActions from "../components/EmployeeQuickActions";
import EmployeeOrgContextCard from "../components/EmployeeOrgContextCard";
import EmployeeRecruitmentOriginCard from "../components/EmployeeRecruitmentOriginCard";
import EmployeeContractCard from "../components/EmployeeContractCard";
import useEmployees from "../hooks/useEmployees";
import useEmployeeHistory from "../hooks/useEmployeeHistory";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import { formatCurrency } from "../utils/employee.helpers";

function ProfileSelector({ employees = [], isSpanish, actionLabel }) {
  return (
    <section className="employees-grid">
      <EmployeeSectionCard
        title={isSpanish ? "Selecciona un colaborador" : "Select an employee"}
        description={isSpanish ? "El perfil 360 se activa al abrir un expediente existente. Esta vista no gestiona altas, solo inteligencia operativa del colaborador." : "The 360 profile becomes available when you open an existing employee file. This view does not manage hires; it focuses on employee intelligence."}
      >
        {employees.length ? (
          <div className="employees-list">
            {employees.map((employee) => (
              <article key={employee.id} className="employees-list-item">
                <span>{employee.department}</span>
                <strong>{employee.name}</strong>
                <p className="employees-muted">
                  {employee.position} | {employee.location} | {employee.manager}
                </p>
                <div className="employees-inline-actions">
                  <Link className="employees-button" to={`/employees/profile?employee=${employee.id}`}>
                    {actionLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmployeeEmptyState
            title={isSpanish ? "No hay perfiles activos aun" : "No active profiles yet"}
            description={isSpanish ? "Primero aprueba una solicitud en Employee List para habilitar los expedientes y sus vistas de detalle." : "Approve a request in Employee List first to enable employee files and their detail views."}
          />
        )}
      </EmployeeSectionCard>

      <EmployeeSectionCard
        title={isSpanish ? "Que encontraras aqui" : "What you will find here"}
        description={isSpanish ? "Esta pantalla concentra el resumen ejecutivo del colaborador y su lectura organizacional." : "This screen concentrates the employee executive summary and organizational view."}
      >
        <div className="employees-list">
          <article className="employees-list-item">
            <span>{isSpanish ? "Organizacion" : "Organization"}</span>
            <strong>{isSpanish ? "Posicion, unidad, centro de costo y jefe directo" : "Position, unit, cost center, and direct manager"}</strong>
          </article>
          <article className="employees-list-item">
            <span>{isSpanish ? "Ciclo de vida" : "Lifecycle"}</span>
            <strong>{isSpanish ? "Ingreso, contrato, expediente, proximos hitos y origen" : "Start date, contract, file, upcoming milestones, and origin"}</strong>
          </article>
          <article className="employees-list-item">
            <span>Recruitment</span>
            <strong>{isSpanish ? "Trazabilidad del candidato si el ingreso provino del pipeline" : "Candidate traceability when the hire came from the pipeline"}</strong>
          </article>
        </div>
      </EmployeeSectionCard>
    </section>
  );
}

export default function EmployeeProfilePage() {
  const { dashboard } = useEmployees();
  const { employee, loading, error, history } = useEmployeeHistory();
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";

  if (loading) {
    return (
      <main className="employees-page">
        <EmployeeEmptyState title={isSpanish ? "Cargando perfil 360" : "Loading 360 profile"} description={isSpanish ? "Estamos preparando el contexto del colaborador." : "Preparing employee context."} />
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="employees-page">
        <ProfileSelector employees={dashboard.employees} isSpanish={isSpanish} actionLabel={copy.actions.openProfile} />
        {error ? <EmployeeEmptyState title={isSpanish ? "No fue posible cargar el perfil" : "Could not load profile"} description={error} /> : null}
      </main>
    );
  }

  return (
    <main className="employees-page employees-page--profile-hub">
      <EmployeeProfileHero
        employee={employee}
        title={isSpanish ? "Colaborador 360" : "Employee 360"}
        description={`${employee.position} | ${employee.department} | ${employee.company}`}
      />

      <EmployeeTabs employeeId={employee.id} />
      <EmployeeQuickActions employeeId={employee.id} />

      <section className="employees-profile-mosaic">
        <div className="employees-profile-main">
          <EmployeeSpotlightCard
            variant="experience"
            eyebrow={isSpanish ? "Resumen ejecutivo" : "Executive summary"}
            title={employee.executiveInsight}
            description={employee.summary}
            meta={[
              { label: isSpanish ? "Compania" : "Company", value: employee.company },
              { label: isSpanish ? "Unidad" : "Unit", value: employee.businessUnit },
              { label: isSpanish ? "Centro de costo" : "Cost center", value: employee.costCenter },
              { label: isSpanish ? "Proximo hito" : "Next milestone", value: employee.nextMilestone },
            ]}
          />

          <EmployeeSectionCard
            variant="default"
            title={isSpanish ? "Resumen ejecutivo" : "Executive summary"}
            description={isSpanish ? "Lectura rapida para RRHH sobre estado del expediente, compensacion y situacion operativa." : "Quick HR readout on file status, compensation, and operational situation."}
          >
            <div className="employees-kpi-grid">
              <article className="employees-kpi">
                <span>{isSpanish ? "Completitud de perfil" : "Profile completion"}</span>
                <strong>{employee.profileCompletion}%</strong>
                <p className="employees-muted">{isSpanish ? "Madurez del expediente central." : "Core file maturity."}</p>
              </article>
              <article className="employees-kpi">
                <span>{isSpanish ? "Documentos listos" : "Ready documents"}</span>
                <strong>{employee.documents.length}</strong>
                <p className="employees-muted">{isSpanish ? "Activos visibles en el expediente digital." : "Assets visible in the digital file."}</p>
              </article>
              <article className="employees-kpi">
                <span>{isSpanish ? "Compensacion base" : "Base pay"}</span>
                <strong>{formatCurrency(employee.salary.baseSalary || 0, employee.salary.currency || "BOB")}</strong>
                <p className="employees-muted">{isSpanish ? "Base registrada actualmente." : "Current registered base pay."}</p>
              </article>
              <article className="employees-kpi">
                <span>{isSpanish ? "Proximo hito" : "Next milestone"}</span>
                <strong>{employee.nextMilestone}</strong>
                <p className="employees-muted">{isSpanish ? "Siguiente accion recomendada por RRHH." : "Next HR recommended action."}</p>
              </article>
            </div>
          </EmployeeSectionCard>

          <EmployeeOrgContextCard employee={employee} />

          <EmployeeSectionCard
            variant="experience"
            title={isSpanish ? "Historial del colaborador" : "Employee history"}
            description={isSpanish ? "Narrativa completa del ciclo de vida, acciones y eventos relevantes del colaborador." : "Complete narrative of lifecycle, actions, and relevant employee events."}
          >
            <EmployeeTimeline
              items={history}
              emptyTitle={isSpanish ? "Sin eventos relevantes aun" : "No relevant events yet"}
              emptyDescription={isSpanish ? "A medida que avance el expediente, aqui apareceran ingresos, cambios y movimientos." : "As the file progresses, starts, changes, and movements will appear here."}
            />
          </EmployeeSectionCard>
        </div>

        <div className="employees-profile-rail">
          <EmployeeContractCard employee={employee} />

          <EmployeeRecruitmentOriginCard employee={employee} />

          <EmployeeSectionCard
            variant="documents"
            title={isSpanish ? "Contacto y operacion" : "Contact and operations"}
            description={isSpanish ? "Datos operativos listos para gestion diaria, soporte y seguimiento administrativo." : "Operational data ready for day-to-day management, support, and administrative follow-up."}
          >
            <div className="employees-list">
              <article className="employees-list-item">
                <span>{isSpanish ? "Contacto" : "Contact"}</span>
                <strong>{employee.email || copy.common.noEmail}</strong>
                <p className="employees-muted">{employee.phone || copy.common.noPhone}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Onboarding" : "Onboarding"}</span>
                <strong>{employee.onboarding?.completion || 0}%</strong>
                <p className="employees-muted">{employee.onboarding?.nextCheckpoint || copy.common.noData}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Acciones de personal" : "Personnel actions"}</span>
                <strong>{employee.actions?.length || 0}</strong>
                <p className="employees-muted">{employee.actions?.[0]?.title || copy.common.noData}</p>
              </article>
            </div>
          </EmployeeSectionCard>
        </div>
      </section>
    </main>
  );
}
