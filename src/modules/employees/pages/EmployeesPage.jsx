import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../employees.css";
import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesStatsCards from "../components/EmployeesStatsCards";
import EmployeesFilters from "../components/EmployeesFilters";
import EmployeesTable from "../components/EmployeesTable";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeAuthorizationQueue from "../components/EmployeeAuthorizationQueue";
import EmployeeSectionCard from "../components/EmployeeSectionCard";
import EmployeeEmptyState from "../components/EmployeeEmptyState";
import EmployeeSpotlightCard from "../components/EmployeeSpotlightCard";
import EmployeeFeedbackBanner from "../components/EmployeeFeedbackBanner";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useEmployees from "../hooks/useEmployees";
import useEmployeeFilters from "../hooks/useEmployeeFilters";
import useEmployeesCopy from "../hooks/useEmployeesCopy";
import employeesService from "../services/employees.service";
import useOrganizations from "../../administration/hooks/useOrganizations";
import useApprovalFlows from "../../administration/hooks/useApprovalFlows";
import useLanguageSettings from "../../administration/hooks/useLanguageSettings";

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const { dashboard, loading, error, refresh } = useEmployees();
  const { filters, filteredEmployees, updateFilter } = useEmployeeFilters(dashboard.employees);
  const organizations = useOrganizations();
  const { flows } = useApprovalFlows();
  const { language } = useLanguageSettings();
  const copy = useEmployeesCopy();
  const isSpanish = language === "es";
  const spotlightEmployee = filteredEmployees[0] || dashboard.employees[0] || null;

  async function handleCreateRequest(form) {
    const candidate = dashboard.recruitmentBridge.find((item) => item.id === form.candidateId);

    await employeesService.createEmployeeRequest({
      ...form,
      name: form.name || candidate?.name || "",
      position: form.position || candidate?.position || "",
      recruitmentSource:
        form.sourceType === "recruitment" && candidate
          ? {
              origin: "Recruitment",
              candidateId: candidate.id,
              candidateName: candidate.name,
              sourceChannel: candidate.source,
              pipelineStage: candidate.stage,
              fitScore: candidate.score,
            }
          : { origin: copy.common.manual },
    });

    setFeedback(isSpanish ? "Solicitud de nuevo colaborador enviada correctamente a autorizacion." : "New employee request successfully sent for approval.");
    refresh();
  }

  async function handleApprove(requestId) {
    await employeesService.approveEmployeeRequest(requestId);
    setFeedback(isSpanish ? "Alta aprobada y colaborador incorporado al modulo." : "Hire approved and employee added to the module.");
    refresh();
  }

  const selectedHighlights = [
    {
      label: "Headcount",
      value: dashboard.employees.length,
      trend: `${dashboard.insights?.activeEmployees || 0} ${isSpanish ? "activos" : "active"}`,
    },
    {
      label: isSpanish ? "Ingresos recientes" : "Recent hires",
      value: dashboard.insights?.recentHires || 0,
      trend: isSpanish ? "ultimos 90 dias" : "last 90 days",
    },
    {
      label: isSpanish ? "Ausencias activas" : "Active absences",
      value: dashboard.insights?.onLeaveEmployees || 0,
      trend: isSpanish ? "visibles en workforce" : "visible in workforce",
    },
    {
      label: isSpanish ? "Coverage del expediente" : "File coverage",
      value: `${dashboard.insights?.averageProfileCompletion || 0}%`,
      trend: `${dashboard.insights?.pendingDocuments || 0} ${isSpanish ? "documentos pendientes" : "pending documents"}`,
    },
  ];

  return (
    <main className="employees-page employees-page--workspace">
      <EmployeesHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
        actions={
          <>
            <Link className="employees-button-secondary" to="/employees/profile">{copy.actions.goProfile360}</Link>
          </>
        }
        highlights={selectedHighlights}
      />

      {error ? <EmployeeEmptyState title={isSpanish ? "No fue posible cargar Employees" : "Could not load Employees"} description={error} /> : null}
      {feedback ? <EmployeeFeedbackBanner>{feedback}</EmployeeFeedbackBanner> : null}

      <EmployeesStatsCards items={dashboard.stats} />

      <section className="employees-dashboard-layout">
        <div className="employees-dashboard-main">
          <EmployeeSectionCard
            variant="salary"
            className="employees-command-shell"
            title={isSpanish ? "Centro de control de la plantilla" : "Workforce command center"}
            description={isSpanish ? "Busca, filtra y entra al colaborador correcto desde una vista mas ejecutiva del workforce." : "Search, filter, and reach the right employee from a more executive workforce view."}
            actions={
              <div className="employees-inline-actions">
                <span className="employees-badge neutral">{filteredEmployees.length} {isSpanish ? "visibles" : "visible"}</span>
                <span className="employees-badge info">{dashboard.requests.length} {isSpanish ? "movimientos" : "moves"}</span>
              </div>
            }
          >
            <div className="employees-story-band">
              <article className="employees-story-chip">
                <span>{isSpanish ? "Visibles" : "Visible"}</span>
                <strong>{filteredEmployees.length}</strong>
              </article>
              <article className="employees-story-chip">
                <span>{isSpanish ? "Solicitudes" : "Requests"}</span>
                <strong>{dashboard.requests.length}</strong>
              </article>
              <article className="employees-story-chip">
                <span>{isSpanish ? "Recruitment bridge" : "Recruitment bridge"}</span>
                <strong>{dashboard.recruitmentBridge.length}</strong>
              </article>
            </div>
            <EmployeesFilters employees={dashboard.employees} filters={filters} updateFilter={updateFilter} />
            {loading ? (
              <EmployeeEmptyState title={isSpanish ? "Cargando plantilla" : "Loading workforce"} description={isSpanish ? "Estamos preparando el listado de colaboradores y solicitudes." : "Preparing the employee list and pending requests."} />
            ) : filteredEmployees.length ? (
              <EmployeesTable
                employees={filteredEmployees}
                onSelect={(employee) => {
                  employeesService.setActiveEmployeeId(employee.id);
                  navigate(`/employees/profile?employee=${employee.id}`);
                }}
              />
            ) : (
              <EmployeeEmptyState
                title={isSpanish ? "Aun no hay colaboradores visibles" : "No visible employees yet"}
                description={isSpanish ? "Crea una solicitud de alta o aprueba una pendiente para comenzar a construir la plantilla." : "Create a hiring request or approve a pending one to start building the workforce."}
              />
            )}
          </EmployeeSectionCard>

          <EmployeeSectionCard
            variant="experience"
            title={isSpanish ? "Continuidad con Recruitment" : "Continuity with Recruitment"}
            description={isSpanish ? "Employees ya refleja el tramo candidato a colaborador para sostener una narrativa de talento completa." : "Employees already reflects the candidate-to-employee transition to sustain a full talent narrative."}
          >
            {dashboard.recruitmentBridge.length ? (
              <div className="employees-mini-grid">
                {dashboard.recruitmentBridge.slice(0, 4).map((candidate) => (
                  <EmployeeSpotlightCard
                    key={candidate.id}
                    eyebrow={isSpanish ? "Recruitment" : "Recruitment"}
                    title={candidate.name}
                    description={`${candidate.position} | ${candidate.department || (isSpanish ? "Sin area" : "No area")}`}
                    meta={[
                      { label: isSpanish ? "Etapa" : "Stage", value: candidate.stage },
                      { label: "Fit", value: candidate.score },
                    ]}
                    badges={[{ kind: "status", value: candidate.stage === "offer" ? "approved" : "pending" }]}
                  />
                ))}
              </div>
            ) : (
              <EmployeeEmptyState
                title={isSpanish ? "Recruitment aun no aporta candidatos" : "Recruitment has not provided candidates yet"}
                description={isSpanish ? "Cuando el pipeline tenga perfiles capturados, apareceran aqui como fuente de alta." : "Once the pipeline has captured profiles, they will appear here as hiring sources."}
              />
            )}
          </EmployeeSectionCard>

          <EmployeeSectionCard
            variant="permissions"
            title={isSpanish ? "Riesgos operativos del workforce" : "Workforce operational risks"}
            description={isSpanish ? "Lectura rapida de brechas que RRHH deberia atacar para sostener cumplimiento y continuidad." : "Quick readout of gaps HR should address to sustain compliance and continuity."}
          >
            <div className="employees-mini-grid">
              <article className="employees-list-item">
                <span>{isSpanish ? "Expedientes bajo 70%" : "Files below 70%"}</span>
                <strong>{dashboard.employees.filter((item) => Number(item.dossierReadiness) < 70).length}</strong>
                <p className="employees-muted">{isSpanish ? "Requieren prioridad documental y seguimiento." : "Require document priority and follow-up."}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Onboarding incompleto" : "Incomplete onboarding"}</span>
                <strong>{dashboard.employees.filter((item) => Number(item.onboarding?.completion || 0) < 100).length}</strong>
                <p className="employees-muted">{isSpanish ? "Colaboradores que aun no completan su ciclo inicial." : "Employees who have not completed their initial cycle yet."}</p>
              </article>
            </div>
          </EmployeeSectionCard>
        </div>

        <div className="employees-dashboard-rail">
          {spotlightEmployee ? (
            <EmployeeSpotlightCard
              variant="default"
              eyebrow={isSpanish ? "Colaborador destacado" : "Employee spotlight"}
              title={spotlightEmployee.name}
              description={`${spotlightEmployee.position} | ${spotlightEmployee.department}`}
              badges={[
                { kind: "status", value: spotlightEmployee.status },
                { kind: "type", value: spotlightEmployee.employeeType },
              ]}
              meta={[
                { label: isSpanish ? "Compania" : "Company", value: spotlightEmployee.company },
                { label: isSpanish ? "Ubicacion" : "Location", value: spotlightEmployee.location },
                { label: isSpanish ? "Expediente" : "File", value: `${spotlightEmployee.dossierReadiness}%` },
                { label: isSpanish ? "Origen" : "Origin", value: spotlightEmployee.recruitmentSource?.origin || copy.common.manual },
              ]}
              actions={
                <button
                  type="button"
                  className="employees-button"
                  onClick={() => {
                    employeesService.setActiveEmployeeId(spotlightEmployee.id);
                    navigate(`/employees/profile?employee=${spotlightEmployee.id}`);
                  }}
                >
                  {copy.actions.openProfile360}
                </button>
              }
            />
          ) : null}

          <EmployeeSectionCard
            variant="assignments"
            title={isSpanish ? "Solicitud de nuevo colaborador" : "New employee request"}
            description={isSpanish ? "El alta no crea empleados en forma directa. Primero pasa por un flujo de autorizacion para conservar control y trazabilidad." : "The hire does not create employees directly. It first goes through an approval flow to preserve control and traceability."}
          >
            <EmployeeForm
              onSubmit={handleCreateRequest}
              recruitmentOptions={dashboard.recruitmentBridge}
              positionOptions={organizations.positions.filter((item) => item.useInEmployees !== false)}
              departmentOptions={organizations.departments}
              locationOptions={organizations.locations}
            />
          </EmployeeSectionCard>

          <EmployeeSectionCard
            variant="documents"
            title={isSpanish ? "Bandeja de autorizaciones" : "Approval queue"}
            description={isSpanish ? "Aprueba solicitudes y conviertelas en empleados activos dentro del ecosistema." : "Approve requests and turn them into active employees inside the ecosystem."}
          >
            {dashboard.requests.length ? (
              <EmployeeAuthorizationQueue requests={dashboard.requests} onApprove={handleApprove} />
            ) : (
              <EmployeeEmptyState
                title={isSpanish ? "No hay solicitudes pendientes" : "No pending requests"}
                description={isSpanish ? "Cuando RRHH registre un alta, aparecera en esta cola para su aprobacion." : "When HR registers a new hire, it will appear in this queue for approval."}
              />
            )}
          </EmployeeSectionCard>

          <EmployeeSectionCard
            variant="studies"
            title={isSpanish ? "Gobierno desde Administration" : "Governance from Administration"}
            description={isSpanish ? "Employees ya consume estructuras maestras, idioma activo y flujo de aprobacion definidos por Administration." : "Employees already consumes master structures, active language, and approval flows defined by Administration."}
          >
            <div className="employees-mini-grid">
              <article className="employees-list-item">
                <span>{isSpanish ? "Idioma activo" : "Active language"}</span>
                <strong>{language.toUpperCase()}</strong>
                <p className="employees-muted">{isSpanish ? "Persistido desde configuracion global." : "Persisted from global settings."}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Departamentos gobernados" : "Governed departments"}</span>
                <strong>{organizations.departments.length}</strong>
                <p className="employees-muted">{isSpanish ? "Base organizacional compartida con Recruitment y Employees." : "Shared organizational structure across Recruitment and Employees."}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Posiciones estructurales" : "Structural positions"}</span>
                <strong>{organizations.positions.filter((item) => item.useInEmployees !== false).length}</strong>
                <p className="employees-muted">{isSpanish ? "Fuente maestra para altas, staffing y perfil organizacional." : "Master source for hiring, staffing, and org profile."}</p>
              </article>
              <article className="employees-list-item">
                <span>{isSpanish ? "Flujos vinculados" : "Linked flows"}</span>
                <strong>{flows.filter((item) => item.module === "Employees").length}</strong>
                <p className="employees-muted">{isSpanish ? "Altas, permisos y cambios sensibles bajo control administrativo." : "Hiring, permissions, and sensitive changes under admin control."}</p>
              </article>
            </div>
          </EmployeeSectionCard>
        </div>
      </section>

      <ModuleConnectionsPanel moduleKey="employees" language={language} />
    </main>
  );
}
