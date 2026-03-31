import { useEffect, useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import RecruitmentFilters from "../components/RecruitmentFilters";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import JobRequestsTable from "../components/JobRequestsTable";
import RequisitionActionBar from "../components/RequisitionActionBar";
import RequisitionBusinessJustification from "../components/RequisitionBusinessJustification";
import RequisitionContextCard from "../components/RequisitionContextCard";
import RequisitionFormSection from "../components/RequisitionFormSection";
import RequisitionHeader from "../components/RequisitionHeader";
import RequisitionImpactPanel from "../components/RequisitionImpactPanel";
import RequisitionSummaryPanel from "../components/RequisitionSummaryPanel";
import RequisitionValidationAlert from "../components/RequisitionValidationAlert";
import RequisitionWorkflowCard from "../components/RequisitionWorkflowCard";
import RequisitionStatusBadge from "../components/RequisitionStatusBadge";
import useRecruitmentData from "../hooks/useRecruitmentData";
import useOrganizations from "../../administration/hooks/useOrganizations";
import { recruitmentCopy } from "../services/recruitment.service";
import { createInitialRequisitionForm } from "../schemas/requisition.schema";
import {
  buildRequisitionImpact,
  createRequisitionLabels,
  createSubmissionPayload,
  createWorkflowSteps,
  deriveRequisitionContext,
  syncRequisitionWithContext,
  validateRequisition,
} from "../services/requisitionWorkflow.service";
import "../recruitment.css";

function getCurrentActor() {
  if (typeof window === "undefined") {
    return "MGAHRCore Super Admin";
  }

  try {
    const raw = window.localStorage.getItem("mgahrcore.auth.session");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed?.user?.displayName || parsed?.user?.name || "MGAHRCore Super Admin";
  } catch {
    return "MGAHRCore Super Admin";
  }
}

function formatDate(value, language) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat(language === "es" ? "es-BO" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function JobRequestsPage() {
  const { language } = useI18n();
  const isSpanish = language === "es";
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const organizations = useOrganizations();
  const {
    dashboard,
    query,
    setQuery,
    status,
    setStatus,
    filteredJobRequests,
    createJobRequest,
    updateJobRequest,
  } = useRecruitmentData();
  const requisitionLabels = useMemo(() => createRequisitionLabels(isSpanish), [isSpanish]);
  const [editorForm, setEditorForm] = useState(() => createInitialRequisitionForm());
  const [editorErrors, setEditorErrors] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!selectedRequestId && filteredJobRequests[0]?.id) {
      setSelectedRequestId(filteredJobRequests[0].id);
    }
  }, [filteredJobRequests, selectedRequestId]);

  const selectedRequest = useMemo(
    () => filteredJobRequests.find((item) => item.id === selectedRequestId) || filteredJobRequests[0] || null,
    [filteredJobRequests, selectedRequestId],
  );

  const editorContext = useMemo(
    () => deriveRequisitionContext(editorForm, organizations, dashboard.jobRequests),
    [dashboard.jobRequests, editorForm, organizations],
  );

  const submitErrors = useMemo(
    () => validateRequisition(editorForm, editorContext, isSpanish, "submit"),
    [editorContext, editorForm, isSpanish],
  );

  const impactItems = useMemo(
    () => buildRequisitionImpact(editorForm, editorContext, requisitionLabels.labels, isSpanish),
    [editorContext, editorForm, isSpanish, requisitionLabels.labels],
  );

  const workflowSteps = useMemo(
    () => createWorkflowSteps(editorContext, editorForm, isSpanish),
    [editorContext, editorForm, isSpanish],
  );

  const companyOptions = organizations.companies || [];
  const departmentOptions = organizations.departments || [];
  const positionOptions = (organizations.positions || []).filter((item) => item.useInRecruitment !== false);
  const locationOptions = organizations.locations || [];

  function patchForm(mutator) {
    setEditorForm((current) => {
      const draft = typeof mutator === "function" ? mutator(current) : { ...current, ...mutator };
      const context = deriveRequisitionContext(draft, organizations, dashboard.jobRequests);
      return syncRequisitionWithContext(draft, context);
    });
  }

  function updateField(field, value) {
    patchForm((current) => {
      const next = {
        ...current,
        [field]: field === "openings" ? Math.max(1, Number(value) || 1) : value,
      };

      if (field === "positionId") {
        const position = positionOptions.find((item) => item.id === value);
        if (position) {
          next.position = position.name;
          next.title = current.title || position.name;
        }
      }

      if (field === "departmentId") {
        const department = departmentOptions.find((item) => item.id === value);
        if (department) {
          next.department = department.name;
        }
      }

      if (field === "locationId") {
        const location = locationOptions.find((item) => item.id === value);
        if (location) {
          next.location = location.name;
        }
      }

      if (field === "requestType" && value !== "replacement") {
        next.replacedEmployeeId = "";
        next.replacedEmployeeName = "";
      }

      return next;
    });

    setEditorErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function loadRequestIntoEditor(request) {
    setSelectedRequestId(request.id);
    setEditorForm({
      ...createInitialRequisitionForm(),
      ...request,
    });
    setEditorErrors({});
    setFeedback("");
    setIsFormOpen(true);
  }

  function openNewEditor() {
    setEditorForm(createInitialRequisitionForm());
    setEditorErrors({});
    setFeedback("");
    setIsFormOpen(true);
  }

  function resetEditor() {
    setEditorForm(createInitialRequisitionForm());
    setEditorErrors({});
    setFeedback("");
    setIsFormOpen(false);
  }

  async function handleSaveDraft() {
    const nextErrors = validateRequisition(editorForm, editorContext, isSpanish, "draft");
    setEditorErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = createSubmissionPayload(editorForm, editorContext, getCurrentActor(), "draft");
    if (payload.id) {
      await updateJobRequest(payload);
    } else {
      await createJobRequest(payload);
    }
    setFeedback(isSpanish ? "Borrador guardado con trazabilidad." : "Draft saved with traceability.");
    setIsFormOpen(false);
  }

  async function handleSubmitForApproval() {
    const nextErrors = validateRequisition(editorForm, editorContext, isSpanish, "submit");
    setEditorErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const nextStatus = editorContext.requiresApproval ? "pending_review" : "submitted";
    const payload = createSubmissionPayload(editorForm, editorContext, getCurrentActor(), nextStatus);
    if (payload.id) {
      await updateJobRequest(payload);
    } else {
      await createJobRequest(payload);
    }
    setFeedback(
      editorContext.requiresApproval
        ? (isSpanish ? "Requisicion enviada a revision." : "Requisition sent to review.")
        : (isSpanish ? "Requisicion enviada correctamente." : "Requisition submitted successfully."),
    );
    setIsFormOpen(false);
  }

  const formCopy = {
    workspaceEyebrow: isSpanish ? "Control de headcount" : "Headcount control",
    workspaceTitle: isSpanish ? "Workspace de requisicion" : "Requisition workspace",
    workspaceDescription: isSpanish
      ? "Crea, gobierna y valida requisiciones con contexto organizacional, impacto y workflow de aprobacion."
      : "Create, govern, and validate requisitions with organizational context, impact, and approval workflow.",
    validationTitle: isSpanish ? "Acciones requeridas antes de continuar" : "Actions required before continuing",
    section1Title: isSpanish ? "Contexto de la requisicion" : "Requisition context",
    section1Description: isSpanish ? "Vincula la solicitud con la estructura organizacional y el control de capacidad." : "Link the request to organizational structure and capacity control.",
    section2Title: isSpanish ? "Informacion de la posicion" : "Position information",
    section2Description: isSpanish ? "Define con precision la vacante, modalidad y objetivo de cobertura." : "Define the vacancy, modality, and target coverage precisely.",
    section3Title: isSpanish ? "Configuracion de la vacante" : "Vacancy configuration",
    section3Description: isSpanish ? "Configura el tipo de requerimiento y reglas que alteran el flujo." : "Configure the request type and rules that alter the workflow.",
    section4Title: isSpanish ? "Responsables" : "Responsibility model",
    section4Description: isSpanish ? "Asigna a los responsables operativos y de seguimiento." : "Assign operational and follow-up owners.",
    section5Title: isSpanish ? "Justificacion y prioridad" : "Justification and priority",
    section5Description: isSpanish ? "Sustenta el negocio detras de la requisicion y la urgencia de cobertura." : "Support the business case and urgency behind the requisition.",
    section6Title: isSpanish ? "Estado, envio y control" : "Status, submission, and control",
    section6Description: isSpanish ? "Consolida trazabilidad, workflow y acciones del ciclo de vida." : "Consolidate traceability, workflow, and lifecycle actions.",
    businessReasonLabel: isSpanish ? "Motivo de la solicitud" : "Business reason",
    businessReasonHint: isSpanish ? "Describe por que el negocio necesita esta vacante." : "Describe why the business needs this vacancy.",
    businessReasonRequiredHint: isSpanish ? "Obligatorio para prioridades altas/criticas o solicitudes de alto impacto." : "Required for high/critical priorities or high-impact requests.",
    roleImpactLabel: isSpanish ? "Impacto del rol" : "Role impact",
    roleImpactHint: isSpanish ? "Explica como afecta a operacion, cliente o continuidad." : "Explain how it affects operations, customers, or continuity.",
    priorityJustificationLabel: isSpanish ? "Justificacion de prioridad" : "Priority justification",
    priorityJustificationHint: isSpanish ? "Justifica por que la prioridad de negocio debe acelerarse." : "Justify why business priority should be accelerated.",
    areaNotesLabel: isSpanish ? "Observaciones del area" : "Business area notes",
    areaNotesHint: isSpanish ? "Comentarios adicionales para RRHH o aprobadores." : "Additional comments for HR or approvers.",
    hiringPlanLabel: isSpanish ? "Plan de cobertura" : "Staffing plan",
    hiringPlanHint: isSpanish ? "Explica como se cubrira mas de una vacante." : "Explain how multiple openings will be covered.",
    impactTitle: isSpanish ? "Lectura de impacto" : "Impact readout",
    workflowTitle: isSpanish ? "Workflow previsto" : "Expected workflow",
    traceabilityTitle: isSpanish ? "Trazabilidad operativa" : "Operational traceability",
    draftLabel: isSpanish ? "Guardar borrador" : "Save draft",
    submitLabel: isSpanish ? "Enviar a aprobacion" : "Submit for approval",
    cancelLabel: isSpanish ? "Nueva requisicion" : "New requisition",
    actionContext: feedback || (isSpanish ? "La requisicion se guardara con historial, actor y estado del workflow." : "The requisition will be saved with history, actor, and workflow state."),
  };

  const summaryMetrics = [
    {
      label: isSpanish ? "Headcount disponible" : "Available headcount",
      value: `${editorContext.availableHeadcount}/${editorContext.estimatedTeamSize || 0}`,
      meta: isSpanish ? "capacidad del departamento" : "department capacity",
    },
    {
      label: isSpanish ? "Aprobacion" : "Approval",
      value: editorContext.requiresApproval ? (isSpanish ? "Requerida" : "Required") : (isSpanish ? "No requerida" : "Not required"),
      meta: isSpanish ? "segun impacto y prioridad" : "based on impact and priority",
    },
    {
      label: isSpanish ? "Cobertura objetivo" : "Target coverage",
      value: editorForm.targetHireDate || "-",
      meta: isSpanish ? "fecha comprometida" : "committed date",
    },
  ];

  const contextItems = [
    {
      label: isSpanish ? "Empresa" : "Company",
      value: editorContext.selectedCompany?.name || editorForm.companyName || "-",
      meta: isSpanish ? "entidad de la requisicion" : "requisition entity",
    },
    {
      label: isSpanish ? "Departamento" : "Department",
      value: editorContext.selectedDepartment?.name || editorForm.department || "-",
      meta: isSpanish ? "area solicitante" : "requesting area",
    },
    {
      label: isSpanish ? "Posicion" : "Position",
      value: editorContext.selectedPosition?.name || editorForm.position || "-",
      meta: editorContext.selectedLevel?.name || "-",
    },
    {
      label: isSpanish ? "Tipo de solicitud" : "Request type",
      value: requisitionLabels.labels.requestType[editorForm.requestType],
      meta: editorContext.selectedPosition?.criticalPosition ? (isSpanish ? "posicion critica" : "critical position") : "",
    },
    {
      label: isSpanish ? "Headcount" : "Headcount",
      value: `${editorContext.availableHeadcount}/${editorContext.estimatedTeamSize || 0}`,
      meta: isSpanish ? "disponible / capacidad" : "available / capacity",
    },
    {
      label: isSpanish ? "Prioridad operativa" : "Operational priority",
      value: requisitionLabels.labels.priority[editorForm.priority],
      meta: editorContext.affectsBudget ? (isSpanish ? "afecta presupuesto" : "affects budget") : "",
    },
  ];

  const selectedSummaryLabels = {
    request: isSpanish ? "Requisicion" : "Requisition",
    position: isSpanish ? "Posicion" : "Position",
    department: copy.forms.department,
    owner: isSpanish ? "Owner" : "Owner",
    status: requisitionLabels.labels.status,
  };

  const validationList = Object.values(editorErrors);

  return (
    <div className="recruitment-page recruitment-page--requisitions">
      <RequisitionHeader
        eyebrow={formCopy.workspaceEyebrow}
        title={formCopy.workspaceTitle}
        description={formCopy.workspaceDescription}
        metrics={summaryMetrics}
        actions={
          <button type="button" className="recruitment-primary-button" onClick={openNewEditor}>
            {copy.buttons.newRequest}
          </button>
        }
      />

      {isFormOpen ? (
        <div className="recruitment-drawer-backdrop" onClick={resetEditor}>
          <aside
            className="recruitment-drawer-shell"
            onClick={(event) => event.stopPropagation()}
            aria-label={formCopy.workspaceTitle}
          >
            <section className="requisition-workspace">
              <div className="requisition-workspace__main">
          <RequisitionValidationAlert title={formCopy.validationTitle} errors={validationList} />
          <RequisitionContextCard title={formCopy.section1Title} items={contextItems} tone="context" />

          <RequisitionFormSection eyebrow="01" title={formCopy.section1Title} description={formCopy.section1Description}>
            <div className="requisition-form-grid">
              <label className="requisition-field">
                <span>{isSpanish ? "Tipo de requisicion" : "Requisition type"}</span>
                <small>{isSpanish ? "Determina si es nueva posicion, reemplazo, expansion o backfill." : "Determines whether this is a new position, replacement, expansion, or backfill."}</small>
                <select value={editorForm.requestType} onChange={(event) => updateField("requestType", event.target.value)}>
                  {requisitionLabels.requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="requisition-field">
                <span>{isSpanish ? "Empresa" : "Company"}</span>
                <small>{isSpanish ? "Entidad empresarial a la que pertenecera la vacante." : "Business entity that will own the vacancy."}</small>
                <select value={editorForm.companyId} onChange={(event) => updateField("companyId", event.target.value)}>
                  <option value="">{isSpanish ? "Selecciona empresa" : "Select company"}</option>
                  {companyOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className={`requisition-field${editorErrors.departmentId ? " has-error" : ""}`}>
                <span>{copy.forms.department}</span>
                <small>{isSpanish ? "Departamento que solicita y consume el headcount." : "Department requesting and consuming the headcount."}</small>
                <select value={editorForm.departmentId} onChange={(event) => updateField("departmentId", event.target.value)}>
                  <option value="">{isSpanish ? "Selecciona departamento" : "Select department"}</option>
                  {departmentOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                {editorErrors.departmentId ? <em>{editorErrors.departmentId}</em> : null}
              </label>
              <label className="requisition-field">
                <span>{copy.forms.priority}</span>
                <small>{isSpanish ? "Define urgencia operativa y severidad del workflow." : "Defines operational urgency and workflow severity."}</small>
                <select value={editorForm.priority} onChange={(event) => updateField("priority", event.target.value)}>
                  {requisitionLabels.priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </RequisitionFormSection>

          <RequisitionFormSection eyebrow="02" title={formCopy.section2Title} description={formCopy.section2Description}>
            <div className="requisition-form-grid">
              <label className={`requisition-field${editorErrors.title ? " has-error" : ""}`}>
                <span>{copy.forms.title}</span>
                <small>{isSpanish ? "Nombre ejecutivo con el que se seguira la requisicion." : "Executive title used to track the requisition."}</small>
                <input value={editorForm.title} onChange={(event) => updateField("title", event.target.value)} />
                {editorErrors.title ? <em>{editorErrors.title}</em> : null}
              </label>
              <label className={`requisition-field${editorErrors.positionId ? " has-error" : ""}`}>
                <span>{isSpanish ? "Posicion estructural" : "Structured position"}</span>
                <small>{isSpanish ? "Se conecta con positions, niveles y reporting." : "Connected to positions, levels, and reporting."}</small>
                <select value={editorForm.positionId} onChange={(event) => updateField("positionId", event.target.value)}>
                  <option value="">{isSpanish ? "Selecciona posicion" : "Select position"}</option>
                  {positionOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                {editorErrors.positionId ? <em>{editorErrors.positionId}</em> : null}
              </label>
              <label className={`requisition-field${editorErrors.locationId ? " has-error" : ""}`}>
                <span>{copy.forms.location}</span>
                <small>{isSpanish ? "Ubicacion principal para la cobertura." : "Primary location for the search."}</small>
                <select value={editorForm.locationId} onChange={(event) => updateField("locationId", event.target.value)}>
                  <option value="">{isSpanish ? "Selecciona ubicacion" : "Select location"}</option>
                  {locationOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                {editorErrors.locationId ? <em>{editorErrors.locationId}</em> : null}
              </label>
              <label className="requisition-field">
                <span>{copy.forms.modality}</span>
                <small>{isSpanish ? "Modelo de trabajo previsto para la vacante." : "Expected working model for the vacancy."}</small>
                <select value={editorForm.modality} onChange={(event) => updateField("modality", event.target.value)}>
                  {requisitionLabels.modalityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="requisition-field">
                <span>{isSpanish ? "Tipo de contratacion" : "Contract type"}</span>
                <small>{isSpanish ? "Usado para impacto presupuestario y condiciones de contratacion." : "Used for budget impact and hiring conditions."}</small>
                <select value={editorForm.contractType} onChange={(event) => updateField("contractType", event.target.value)}>
                  {requisitionLabels.contractTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className={`requisition-field${editorErrors.targetHireDate ? " has-error" : ""}`}>
                <span>{isSpanish ? "Fecha objetivo de cobertura" : "Target coverage date"}</span>
                <small>{isSpanish ? "Compromiso operativo esperado para cubrir la vacante." : "Operational commitment to cover the vacancy."}</small>
                <input type="date" value={editorForm.targetHireDate} onChange={(event) => updateField("targetHireDate", event.target.value)} />
                {editorErrors.targetHireDate ? <em>{editorErrors.targetHireDate}</em> : null}
              </label>
            </div>
          </RequisitionFormSection>

          <RequisitionFormSection eyebrow="03" title={formCopy.section3Title} description={formCopy.section3Description}>
            <div className="requisition-form-grid">
              <label className={`requisition-field${editorErrors.openings ? " has-error" : ""}`}>
                <span>{copy.forms.openings}</span>
                <small>{isSpanish ? "Cantidad de posiciones que se habilitaran." : "Number of positions to be opened."}</small>
                <input type="number" min="1" value={editorForm.openings} onChange={(event) => updateField("openings", event.target.value)} />
                {editorErrors.openings ? <em>{editorErrors.openings}</em> : null}
              </label>
              <label className="requisition-field">
                <span>{isSpanish ? "Requiere aprobacion" : "Requires approval"}</span>
                <small>{isSpanish ? "Derivado por prioridad, impacto y reglas del contexto." : "Derived from priority, impact, and contextual rules."}</small>
                <input value={editorContext.requiresApproval ? (isSpanish ? "Si" : "Yes") : (isSpanish ? "No" : "No")} readOnly />
              </label>
              {editorForm.requestType === "replacement" ? (
                <label className={`requisition-field${editorErrors.replacedEmployeeName ? " has-error" : ""}`}>
                  <span>{isSpanish ? "Colaborador a reemplazar" : "Employee being replaced"}</span>
                  <small>{isSpanish ? "Obligatorio para solicitudes de reemplazo." : "Required for replacement requests."}</small>
                  <input value={editorForm.replacedEmployeeName} onChange={(event) => updateField("replacedEmployeeName", event.target.value)} />
                  {editorErrors.replacedEmployeeName ? <em>{editorErrors.replacedEmployeeName}</em> : null}
                </label>
              ) : null}
              {Number(editorForm.openings) > 1 ? (
                <label className={`requisition-field requisition-field--full${editorErrors.hiringPlan ? " has-error" : ""}`}>
                  <span>{isSpanish ? "Detalle adicional de cobertura" : "Additional staffing detail"}</span>
                  <small>{isSpanish ? "Explica la estrategia si necesitas cubrir mas de una vacante." : "Explain the strategy when you need to cover more than one opening."}</small>
                  <textarea rows="3" value={editorForm.hiringPlan} onChange={(event) => updateField("hiringPlan", event.target.value)} />
                  {editorErrors.hiringPlan ? <em>{editorErrors.hiringPlan}</em> : null}
                </label>
              ) : null}
            </div>
          </RequisitionFormSection>

          <RequisitionFormSection eyebrow="04" title={formCopy.section4Title} description={formCopy.section4Description}>
            <div className="requisition-form-grid">
              <label className={`requisition-field${editorErrors.hiringManager ? " has-error" : ""}`}>
                <span>{copy.forms.manager}</span>
                <small>{isSpanish ? "Responsable del negocio que lidera la decision." : "Business leader accountable for the decision."}</small>
                <input value={editorForm.hiringManager} onChange={(event) => updateField("hiringManager", event.target.value)} />
                {editorErrors.hiringManager ? <em>{editorErrors.hiringManager}</em> : null}
              </label>
              <label className={`requisition-field${editorErrors.recruiterOwner ? " has-error" : ""}`}>
                <span>{isSpanish ? "Recruiter responsable" : "Recruiter owner"}</span>
                <small>{isSpanish ? "Owner de recruitment para coordinar sourcing y pipeline." : "Recruitment owner coordinating sourcing and pipeline."}</small>
                <input value={editorForm.recruiterOwner} onChange={(event) => updateField("recruiterOwner", event.target.value)} />
                {editorErrors.recruiterOwner ? <em>{editorErrors.recruiterOwner}</em> : null}
              </label>
              <label className={`requisition-field${editorErrors.processOwner ? " has-error" : ""}`}>
                <span>{isSpanish ? "Owner del proceso" : "Process owner"}</span>
                <small>{isSpanish ? "Responsable transversal del avance y cierre." : "Cross-functional owner of progress and closure."}</small>
                <input value={editorForm.processOwner} onChange={(event) => updateField("processOwner", event.target.value)} />
                {editorErrors.processOwner ? <em>{editorErrors.processOwner}</em> : null}
              </label>
              <label className="requisition-field">
                <span>{isSpanish ? "Area solicitante" : "Requesting area"}</span>
                <small>{isSpanish ? "Area que formaliza la necesidad y absorbe el headcount." : "Area formalizing the need and absorbing headcount."}</small>
                <input value={editorForm.requestingArea} onChange={(event) => updateField("requestingArea", event.target.value)} />
              </label>
            </div>
          </RequisitionFormSection>

          <RequisitionFormSection eyebrow="05" title={formCopy.section5Title} description={formCopy.section5Description}>
            <RequisitionBusinessJustification
              copy={formCopy}
              values={editorForm}
              errors={editorErrors}
              onChange={updateField}
              justificationRequired={editorContext.priorityCritical || editorForm.requestType === "critical"}
              multiOpening={editorContext.multiOpening}
            />
          </RequisitionFormSection>

          <RequisitionFormSection eyebrow="06" title={formCopy.section6Title} description={formCopy.section6Description}>
            <div className="requisition-trace-grid">
              <article className="requisition-trace-card">
                <span>{isSpanish ? "Estado actual" : "Current status"}</span>
                <strong><RequisitionStatusBadge value={editorForm.status} label={requisitionLabels.labels.status[editorForm.status] || editorForm.status} /></strong>
              </article>
              <article className="requisition-trace-card">
                <span>{isSpanish ? "Creado por" : "Created by"}</span>
                <strong>{editorForm.createdBy || getCurrentActor()}</strong>
              </article>
              <article className="requisition-trace-card">
                <span>{isSpanish ? "Ultimo cambio" : "Last change"}</span>
                <strong>{formatDate(editorForm.updatedAt, language)}</strong>
              </article>
              <article className="requisition-trace-card">
                <span>{isSpanish ? "Comentarios operativos" : "Operational comments"}</span>
                <strong>{editorForm.workflowComments || "-"}</strong>
              </article>
            </div>
          </RequisitionFormSection>

          <RequisitionActionBar
            draftLabel={formCopy.draftLabel}
            submitLabel={formCopy.submitLabel}
            cancelLabel={isSpanish ? "Cerrar" : "Close"}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmitForApproval}
            onCancel={resetEditor}
            canSubmit={!Object.keys(submitErrors).length}
            contextLabel={formCopy.actionContext}
          />
        </div>

        <div className="requisition-workspace__rail">
          <RequisitionImpactPanel title={formCopy.impactTitle} items={impactItems} />
          <RequisitionWorkflowCard title={formCopy.workflowTitle} steps={workflowSteps} />
          {selectedRequest ? (
            <RequisitionSummaryPanel
              title={formCopy.traceabilityTitle}
              requisition={selectedRequest}
              labels={selectedSummaryLabels}
              onLoad={loadRequestIntoEditor}
              actionLabel={isSpanish ? "Cargar en editor" : "Load into editor"}
            />
          ) : null}
        </div>
            </section>
          </aside>
        </div>
      ) : null}

      <RecruitmentFilters
        copy={copy}
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[{ value: "all", label: isSpanish ? "Todos" : "All" }, ...requisitionLabels.statusOptions]}
      />

      <section className="recruitment-page-grid recruitment-page-grid--workspace">
        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Pipeline de requisiciones" : "Requisition pipeline"}
            description={isSpanish ? "Gestiona el backlog de vacantes con lectura ejecutiva y seleccion de detalle." : "Manage the requisition backlog with executive readout and detail selection."}
          >
            {filteredJobRequests.length ? (
              <JobRequestsTable items={filteredJobRequests} copy={copy} selectedId={selectedRequest?.id} onSelect={setSelectedRequestId} />
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>
        </div>

        <div className="recruitment-side-stack">
          {selectedRequest ? (
            <>
              <RequisitionSummaryPanel
                title={isSpanish ? "Detalle de la requisicion" : "Requisition detail"}
                requisition={selectedRequest}
                labels={selectedSummaryLabels}
                onLoad={loadRequestIntoEditor}
                actionLabel={isSpanish ? "Editar requisicion" : "Edit requisition"}
              />
              <RequisitionContextCard
                title={isSpanish ? "Control y gobierno" : "Control and governance"}
                tone="control"
                items={[
                  {
                    label: isSpanish ? "Estado" : "Status",
                    value: requisitionLabels.labels.status[selectedRequest.status] || selectedRequest.status,
                    meta: formatDate(selectedRequest.updatedAt || selectedRequest.createdAt, language),
                  },
                  {
                    label: isSpanish ? "Tipo" : "Type",
                    value: requisitionLabels.labels.requestType[selectedRequest.requestType] || selectedRequest.requestType || "-",
                    meta: selectedRequest.contractType || "-",
                  },
                  {
                    label: isSpanish ? "Aprobacion" : "Approval",
                    value: selectedRequest.requiresApproval ? (isSpanish ? "Requerida" : "Required") : (isSpanish ? "No requerida" : "Not required"),
                    meta: (selectedRequest.approvalPath || []).join(" -> ") || "-",
                  },
                  {
                    label: isSpanish ? "Notas" : "Notes",
                    value: selectedRequest.businessReason || "-",
                  },
                ]}
              />
            </>
          ) : (
            <RecruitmentEmptyState copy={copy} />
          )}
        </div>
      </section>
    </div>
  );
}
