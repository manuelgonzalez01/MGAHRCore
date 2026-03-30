import { hasSupabaseConfig } from "../../../services/supabase/client";
import {
  createRecruitmentCandidateInSupabase,
  createRecruitmentJobRequestInSupabase,
  fetchRecruitmentCandidatesFromSupabase,
  fetchRecruitmentJobRequestsFromSupabase,
} from "../../../services/supabase/mgahrcore.repository";

const STORAGE_KEYS = {
  jobRequests: "mgahrcore.recruitment.jobRequests",
  candidates: "mgahrcore.recruitment.candidates",
  interviews: "mgahrcore.recruitment.interviews",
  evaluations: "mgahrcore.recruitment.evaluations",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key) {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection(key, items) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(items));
  }
}

function getLanguage() {
  if (!canUseStorage()) {
    return "es";
  }

  return window.localStorage.getItem("mgahrcore.language") === "en" ? "en" : "es";
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
}

function getActor() {
  if (!canUseStorage()) {
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

function getDateOffset(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function readOrganizations() {
  return {
    companies: readCollection("mgahrcore.administration.companies"),
    positions: readCollection("mgahrcore.administration.positions"),
    departments: readCollection("mgahrcore.administration.departments"),
    levels: readCollection("mgahrcore.administration.levels"),
    locations: readCollection("mgahrcore.administration.locations"),
  };
}

function getPositionContext(payload = {}, organizations = readOrganizations()) {
  const position = organizations.positions.find((item) => item.id === payload.positionId)
    || organizations.positions.find((item) => item.name === payload.position || item.name === payload.title);
  const department = organizations.departments.find((item) => item.id === payload.departmentId)
    || organizations.departments.find((item) => item.name === payload.department)
    || organizations.departments.find((item) => item.id === position?.departmentId);
  const location = organizations.locations.find((item) => item.id === payload.locationId)
    || organizations.locations.find((item) => item.name === payload.location)
    || organizations.locations.find((item) => item.id === position?.locationId)
    || organizations.locations.find((item) => item.id === department?.locationId);
  const level = organizations.levels.find((item) => item.id === payload.levelId)
    || organizations.levels.find((item) => item.name === payload.levelName)
    || organizations.levels.find((item) => item.id === position?.levelId);
  const company = organizations.companies.find((item) => item.id === payload.companyId)
    || organizations.companies.find((item) => item.id === position?.companyId)
    || organizations.companies.find((item) => item.id === department?.companyId);

  return {
    companyId: company?.id || payload.companyId || "",
    companyName: company?.name || payload.companyName || "MGAHRCore",
    positionId: position?.id || payload.positionId || "",
    position: position?.name || payload.position || payload.title || "",
    departmentId: department?.id || payload.departmentId || "",
    department: department?.name || payload.department || "",
    levelId: level?.id || payload.levelId || "",
    levelName: level?.name || payload.levelName || "",
    locationId: location?.id || payload.locationId || "",
    location: location?.name || payload.location || "",
    hiringManager: payload.hiringManager || department?.departmentHead || "",
  };
}

function buildSeedJobRequests() {
  const organizations = readOrganizations();
  const positions = organizations.positions.filter((item) => item.useInRecruitment !== false).slice(0, 4);

  if (!positions.length) {
    return [];
  }

  return positions.map((position, index) => {
    const department = organizations.departments.find((item) => item.id === position.departmentId);
    const location = organizations.locations.find((item) => item.id === position.locationId)
      || organizations.locations.find((item) => item.id === department?.locationId);
    const company = organizations.companies.find((item) => item.id === position.companyId)
      || organizations.companies.find((item) => item.id === department?.companyId);
    const level = organizations.levels.find((item) => item.id === position.levelId);
    const status = ["open", "in_progress", "approved", "open"][index] || "open";
    const priority = ["high", "medium", "high", "low"][index] || "medium";
    const modality = ["hybrid", "onsite", "remote", "hybrid"][index] || "hybrid";

    return {
      id: createId("REQ"),
      title: position.name,
      companyId: company?.id || "",
      companyName: company?.name || "MGAHRCore",
      positionId: position.id,
      position: position.name,
      departmentId: department?.id || "",
      department: department?.name || "",
      levelId: level?.id || "",
      levelName: level?.name || "",
      hiringManager: department?.departmentHead || "HR Director",
      openings: index === 0 ? 2 : 1,
      locationId: location?.id || "",
      location: location?.name || "",
      modality,
      priority,
      status,
      createdAt: getDateOffset(-(index + 2)),
      requestedBy: getActor(),
    };
  });
}

function ensureJobRequests() {
  const current = readCollection(STORAGE_KEYS.jobRequests);
  if (current.length) {
    return current;
  }

  const seeded = buildSeedJobRequests();
  if (seeded.length) {
    writeCollection(STORAGE_KEYS.jobRequests, seeded);
  }
  return seeded;
}

function ensureCandidates() {
  return readCollection(STORAGE_KEYS.candidates);
}

function ensureInterviews() {
  return readCollection(STORAGE_KEYS.interviews);
}

function ensureEvaluations() {
  return readCollection(STORAGE_KEYS.evaluations);
}

function normalizeJobRequest(item) {
  const organizations = readOrganizations();
  const context = getPositionContext(item, organizations);

  return {
    ...item,
    ...context,
    title: item.title || context.position || "",
    openings: Number(item.openings) || 1,
    modality: item.modality || "hybrid",
    priority: item.priority || "medium",
    status: item.status || "open",
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function normalizeCandidate(item) {
  const organizations = readOrganizations();
  const context = getPositionContext(item, organizations);

  return {
    ...item,
    ...context,
    name: item.name || "",
    stage: item.stage || "screening",
    status: item.status || "active",
    score: Number(item.score) || 0,
    availability: item.availability || (getLanguage() === "en" ? "Immediate" : "Inmediata"),
    experience: item.experience || (getLanguage() === "en" ? "Profile pending" : "Perfil pendiente"),
    source: item.source || "Direct sourcing",
    summary: item.summary || "",
    contact: item.contact || "",
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function normalizeInterview(item) {
  return {
    ...item,
    candidateName: item.candidateName || "",
    vacancy: item.vacancy || "",
    interviewer: item.interviewer || "",
    date: item.date || new Date().toISOString().slice(0, 10),
    time: item.time || "09:00",
    format: item.format || "virtual",
    status: item.status || "scheduled",
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function normalizeEvaluation(item) {
  return {
    ...item,
    candidateName: item.candidateName || "",
    vacancy: item.vacancy || "",
    score: Number(item.score) || 0,
    technicalScore: Number(item.technicalScore) || 0,
    competencyScore: Number(item.competencyScore) || 0,
    recommendation: item.recommendation || "recommended",
    summary: item.summary || "",
    status: item.status || "completed",
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function getLocalJobRequests() {
  return ensureJobRequests().map(normalizeJobRequest);
}

function getLocalCandidates() {
  return ensureCandidates().map(normalizeCandidate);
}

function getLocalInterviews() {
  return ensureInterviews().map(normalizeInterview);
}

function getLocalEvaluations() {
  return ensureEvaluations().map(normalizeEvaluation);
}

function buildPipelineSummary(candidates) {
  return ["screening", "interview", "evaluation", "offer"].map((key) => ({
    key,
    value: candidates.filter((item) => item.stage === key).length,
  }));
}

function buildRecentActivity({ jobRequests, candidates, interviews, evaluations }) {
  return [
    ...jobRequests.slice(0, 6).map((item) => ({
      id: item.id,
      type: "request",
      title: item.title,
      meta: `${item.department} | ${item.hiringManager}`,
      date: item.createdAt,
      status: item.status,
    })),
    ...candidates.slice(0, 6).map((item) => ({
      id: item.id,
      type: "candidate",
      title: item.name,
      meta: `${item.position} | ${item.stage}`,
      date: item.createdAt,
      status: item.status,
    })),
    ...interviews.slice(0, 6).map((item) => ({
      id: item.id,
      type: "interview",
      title: item.candidateName,
      meta: `${item.vacancy} | ${item.interviewer}`,
      date: item.createdAt,
      status: item.status,
    })),
    ...evaluations.slice(0, 6).map((item) => ({
      id: item.id,
      type: "evaluation",
      title: item.candidateName,
      meta: `${item.vacancy} | ${item.recommendation}`,
      date: item.createdAt,
      status: item.status,
    })),
  ]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 10);
}

function buildStats(jobRequests, candidates, interviews, evaluations) {
  return [
    {
      key: "openVacancies",
      value: jobRequests.filter((item) => ["open", "in_progress", "approved"].includes(item.status)).length,
      trend: getLanguage() === "en" ? "Requisitions in motion" : "Requisiciones en movimiento",
    },
    {
      key: "activeCandidates",
      value: candidates.filter((item) => ["active", "pipeline", "finalist"].includes(item.status)).length,
      trend: getLanguage() === "en" ? "Profiles under follow-up" : "Perfiles bajo seguimiento",
    },
    {
      key: "pendingInterviews",
      value: interviews.filter((item) => ["scheduled", "pending", "confirmed"].includes(item.status)).length,
      trend: getLanguage() === "en" ? "Agenda requiring coordination" : "Agenda que requiere coordinacion",
    },
    {
      key: "evaluations",
      value: evaluations.length,
      trend: getLanguage() === "en" ? "Assessments captured" : "Evaluaciones registradas",
    },
  ];
}

function buildDashboard(jobRequests, candidates, interviews, evaluations) {
  return {
    jobRequests,
    candidates,
    interviews,
    evaluations,
    stats: buildStats(jobRequests, candidates, interviews, evaluations),
    pipelineSummary: buildPipelineSummary(candidates),
    recentActivity: buildRecentActivity({ jobRequests, candidates, interviews, evaluations }),
  };
}

function getLocalRecruitmentDashboardData() {
  const jobRequests = getLocalJobRequests();
  const candidates = getLocalCandidates();
  const interviews = getLocalInterviews();
  const evaluations = getLocalEvaluations();

  return buildDashboard(jobRequests, candidates, interviews, evaluations);
}

export async function getRecruitmentDashboardData() {
  if (hasSupabaseConfig) {
    try {
      const [jobRequests, candidates] = await Promise.all([
        fetchRecruitmentJobRequestsFromSupabase(),
        fetchRecruitmentCandidatesFromSupabase(),
      ]);
      const interviews = getLocalInterviews();
      const evaluations = getLocalEvaluations();
      return buildDashboard(jobRequests, candidates, interviews, evaluations);
    } catch {
      return getLocalRecruitmentDashboardData();
    }
  }

  return getLocalRecruitmentDashboardData();
}

export async function getJobRequests() {
  if (hasSupabaseConfig) {
    try {
      return await fetchRecruitmentJobRequestsFromSupabase();
    } catch {
      return getLocalJobRequests();
    }
  }

  return getLocalJobRequests();
}

export async function getCandidates() {
  if (hasSupabaseConfig) {
    try {
      return await fetchRecruitmentCandidatesFromSupabase();
    } catch {
      return getLocalCandidates();
    }
  }

  return getLocalCandidates();
}

export async function getInterviews() {
  return getLocalInterviews();
}

export async function getEvaluations() {
  return getLocalEvaluations();
}

async function createLocalJobRequest(payload = {}) {
  const items = getLocalJobRequests();
  const nextItem = normalizeJobRequest({
    ...payload,
    id: createId("REQ"),
    createdAt: new Date().toISOString(),
    requestedBy: getActor(),
  });
  writeCollection(STORAGE_KEYS.jobRequests, [nextItem, ...items]);
  return nextItem;
}

async function createLocalCandidate(payload = {}) {
  const items = getLocalCandidates();
  const nextItem = normalizeCandidate({
    ...payload,
    id: createId("CAN"),
    createdAt: new Date().toISOString(),
  });
  writeCollection(STORAGE_KEYS.candidates, [nextItem, ...items]);
  return nextItem;
}

async function createLocalInterview(payload = {}) {
  const items = getLocalInterviews();
  const nextItem = normalizeInterview({
    ...payload,
    id: createId("INT"),
    createdAt: new Date().toISOString(),
  });
  writeCollection(STORAGE_KEYS.interviews, [nextItem, ...items]);
  return nextItem;
}

async function createLocalEvaluation(payload = {}) {
  const items = getLocalEvaluations();
  const nextItem = normalizeEvaluation({
    ...payload,
    id: createId("EVA"),
    createdAt: new Date().toISOString(),
  });
  writeCollection(STORAGE_KEYS.evaluations, [nextItem, ...items]);
  return nextItem;
}

export async function createJobRequest(payload = {}) {
  if (hasSupabaseConfig) {
    try {
      await createRecruitmentJobRequestInSupabase(payload);
      const requests = await fetchRecruitmentJobRequestsFromSupabase();
      return requests[0] || null;
    } catch {
      return createLocalJobRequest(payload);
    }
  }

  return createLocalJobRequest(payload);
}

export async function createCandidate(payload = {}) {
  if (hasSupabaseConfig) {
    try {
      await createRecruitmentCandidateInSupabase(payload);
      const candidates = await fetchRecruitmentCandidatesFromSupabase();
      return candidates[0] || null;
    } catch {
      return createLocalCandidate(payload);
    }
  }

  return createLocalCandidate(payload);
}

export async function createInterview(payload = {}) {
  return createLocalInterview(payload);
}

export async function createEvaluation(payload = {}) {
  return createLocalEvaluation(payload);
}

export const recruitmentCopy = {
  es: {
    moduleTitle: "Recruitment",
    moduleDescription:
      "Centro operativo para requisiciones, pipeline, entrevistas y evaluaciones con lectura ejecutiva.",
    quickActionsTitle: "Acciones rapidas",
    quickActionsDescription: "Atajos de operacion para mantener ritmo de staffing y decision.",
    quickActions: [
      { title: "Nueva requisicion", description: "Abre una nueva solicitud estructural desde Recruitment." },
      { title: "Nuevo candidato", description: "Agrega perfiles al pipeline con contexto de vacante." },
      { title: "Programar entrevista", description: "Coordina la siguiente agenda con el hiring team." },
    ],
    pages: {
      homeTitle: "Centro de reclutamiento",
      homeSummaryTitle: "Resumen operativo",
      homeSummaryDescription: "Visibilidad compacta de requisiciones, carga abierta y ritmo del pipeline.",
      jobRequestsTitle: "Requerimientos",
      candidatesTitle: "Candidatos",
      interviewsTitle: "Entrevistas",
      evaluationsTitle: "Evaluaciones",
      pipelineTitle: "Pipeline y conversion",
      pipelineDescription: "Lectura por etapa para entender momentum, cobertura y riesgo de cierre.",
      profilePreviewTitle: "Perfil destacado",
      activeCandidatesTitle: "Lectura premium del mejor perfil activo.",
      recentActivityTitle: "Actividad reciente",
      recentActivityDescription: "Eventos recientes del dominio para seguimiento ejecutivo.",
    },
    stats: {
      openVacancies: "Vacantes abiertas",
      activeCandidates: "Candidatos activos",
      pendingInterviews: "Entrevistas pendientes",
      evaluations: "Evaluaciones",
    },
    buttons: {
      newRequest: "Nueva requisicion",
      newCandidate: "Nuevo candidato",
      scheduleInterview: "Programar entrevista",
      reviewEvaluation: "Registrar evaluacion",
      openProfile: "Abrir",
      sendReminder: "Recordar",
    },
    forms: {
      title: "Titulo",
      requestTitle: "Nueva requisicion",
      candidateTitle: "Nuevo candidato",
      interviewTitle: "Nueva entrevista",
      evaluationTitle: "Nueva evaluacion",
      department: "Departamento",
      manager: "Hiring manager",
      openings: "Vacantes",
      location: "Ubicacion",
      modality: "Modalidad",
      priority: "Prioridad",
      status: "Estado",
      candidate: "Candidato",
      position: "Posicion",
      contact: "Contacto",
      stage: "Etapa",
      score: "Score",
      availability: "Disponibilidad",
      experience: "Experiencia",
      source: "Fuente",
      summary: "Resumen",
      vacancy: "Vacante",
      interviewer: "Entrevistador",
      date: "Fecha",
      time: "Hora",
      format: "Formato",
      technicalScore: "Score tecnico",
      competencyScore: "Score competencial",
      recommendation: "Recomendacion",
      save: "Guardar",
      cancel: "Cancelar",
    },
    table: {
      request: "Solicitud",
      candidate: "Candidato",
      position: "Posicion",
      department: "Departamento",
      manager: "Manager",
      openings: "Vacantes",
      modality: "Modalidad",
      createdAt: "Creada",
      status: "Estado",
      action: "Accion",
      stage: "Etapa",
      score: "Score",
      availability: "Disponibilidad",
      location: "Ubicacion",
      contact: "Contacto",
      date: "Fecha",
      interviewer: "Entrevistador",
      format: "Formato",
      technicalScore: "Tecnico",
      competencyScore: "Competencias",
      observation: "Observacion",
      recommendation: "Recomendacion",
      source: "Fuente",
    },
    candidateCard: {
      score: "Score",
      experience: "Experiencia",
      availability: "Disponibilidad",
    },
    labels: {
      status: {
        open: "Abierta",
        in_progress: "En ejecucion",
        approved: "Aprobada",
        closed: "Cerrada",
        active: "Activo",
        pipeline: "Pipeline",
        finalist: "Finalista",
        scheduled: "Programada",
        confirmed: "Confirmada",
        pending: "Pendiente",
        completed: "Completada",
        in_review: "En revision",
      },
      stage: {
        screening: "Screening",
        interview: "Entrevista",
        evaluation: "Evaluacion",
        offer: "Oferta",
      },
      priority: {
        high: "Alta",
        medium: "Media",
        low: "Baja",
      },
      modality: {
        remote: "Remoto",
        hybrid: "Hibrido",
        onsite: "Presencial",
      },
      format: {
        virtual: "Virtual",
        onsite: "Presencial",
      },
      recommendation: {
        recommended: "Recomendado",
        recommended_with_observations: "Recomendado con observaciones",
        follow_up: "Requiere seguimiento",
      },
    },
    empty: {
      title: "No hay datos en este workspace",
      description: "Cuando registres requisiciones, candidatos o entrevistas, el modulo mostrara la lectura ejecutiva aqui.",
    },
  },
  en: {
    moduleTitle: "Recruitment",
    moduleDescription:
      "Operational workspace for requisitions, pipeline, interviews, and evaluations with executive clarity.",
    quickActionsTitle: "Quick actions",
    quickActionsDescription: "Shortcuts to keep staffing rhythm and decision velocity visible.",
    quickActions: [
      { title: "New requisition", description: "Open a new structured request from Recruitment." },
      { title: "New candidate", description: "Add profiles to the pipeline with vacancy context." },
      { title: "Schedule interview", description: "Coordinate the next agenda slot with the hiring team." },
    ],
    pages: {
      homeTitle: "Recruitment center",
      homeSummaryTitle: "Operational overview",
      homeSummaryDescription: "Compact visibility into requisitions, open load, and pipeline momentum.",
      jobRequestsTitle: "Job requests",
      candidatesTitle: "Candidates",
      interviewsTitle: "Interviews",
      evaluationsTitle: "Evaluations",
      pipelineTitle: "Pipeline and conversion",
      pipelineDescription: "Stage readout to understand momentum, coverage, and closing risk.",
      profilePreviewTitle: "Featured profile",
      activeCandidatesTitle: "Premium readout of the strongest active profile.",
      recentActivityTitle: "Recent activity",
      recentActivityDescription: "Latest domain events for executive follow-up.",
    },
    stats: {
      openVacancies: "Open vacancies",
      activeCandidates: "Active candidates",
      pendingInterviews: "Pending interviews",
      evaluations: "Evaluations",
    },
    buttons: {
      newRequest: "New request",
      newCandidate: "New candidate",
      scheduleInterview: "Schedule interview",
      reviewEvaluation: "Log evaluation",
      openProfile: "Open",
      sendReminder: "Remind",
    },
    forms: {
      title: "Title",
      requestTitle: "New job request",
      candidateTitle: "New candidate",
      interviewTitle: "New interview",
      evaluationTitle: "New evaluation",
      department: "Department",
      manager: "Hiring manager",
      openings: "Openings",
      location: "Location",
      modality: "Modality",
      priority: "Priority",
      status: "Status",
      candidate: "Candidate",
      position: "Position",
      contact: "Contact",
      stage: "Stage",
      score: "Score",
      availability: "Availability",
      experience: "Experience",
      source: "Source",
      summary: "Summary",
      vacancy: "Vacancy",
      interviewer: "Interviewer",
      date: "Date",
      time: "Time",
      format: "Format",
      technicalScore: "Technical score",
      competencyScore: "Competency score",
      recommendation: "Recommendation",
      save: "Save",
      cancel: "Cancel",
    },
    table: {
      request: "Request",
      candidate: "Candidate",
      position: "Position",
      department: "Department",
      manager: "Manager",
      openings: "Openings",
      modality: "Modality",
      createdAt: "Created",
      status: "Status",
      action: "Action",
      stage: "Stage",
      score: "Score",
      availability: "Availability",
      location: "Location",
      contact: "Contact",
      date: "Date",
      interviewer: "Interviewer",
      format: "Format",
      technicalScore: "Technical",
      competencyScore: "Competency",
      observation: "Observation",
      recommendation: "Recommendation",
      source: "Source",
    },
    candidateCard: {
      score: "Score",
      experience: "Experience",
      availability: "Availability",
    },
    labels: {
      status: {
        open: "Open",
        in_progress: "In progress",
        approved: "Approved",
        closed: "Closed",
        active: "Active",
        pipeline: "Pipeline",
        finalist: "Finalist",
        scheduled: "Scheduled",
        confirmed: "Confirmed",
        pending: "Pending",
        completed: "Completed",
        in_review: "In review",
      },
      stage: {
        screening: "Screening",
        interview: "Interview",
        evaluation: "Evaluation",
        offer: "Offer",
      },
      priority: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },
      modality: {
        remote: "Remote",
        hybrid: "Hybrid",
        onsite: "On site",
      },
      format: {
        virtual: "Virtual",
        onsite: "On site",
      },
      recommendation: {
        recommended: "Recommended",
        recommended_with_observations: "Recommended with observations",
        follow_up: "Needs follow-up",
      },
    },
    empty: {
      title: "No data in this workspace",
      description: "Once you log requisitions, candidates, or interviews, the executive readout will appear here.",
    },
  },
};

const recruitmentService = {
  getRecruitmentDashboardData,
  getJobRequests,
  getCandidates,
  getInterviews,
  getEvaluations,
  createJobRequest,
  createCandidate,
  createInterview,
  createEvaluation,
};

export default recruitmentService;
