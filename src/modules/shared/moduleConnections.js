const MODULE_CONNECTIONS = {
  administration: {
    es: {
      title: "Conexiones del ecosistema",
      description: "Administration gobierna estructuras maestras, permisos, flujos y parametros que sostienen la operacion transversal de la suite.",
      items: [
        { to: "/employees", label: "Employees", relation: "Workforce master", detail: "Consumo directo de companias, departamentos, posiciones, niveles y catalogos." },
        { to: "/recruitment", label: "Recruitment", relation: "Pipeline governance", detail: "Vacantes y evaluaciones dependen de estructuras y aprobaciones administradas aqui." },
        { to: "/vacations", label: "Vacations", relation: "Policy control", detail: "Las politicas, jerarquias y aprobaciones nacen desde la capa administrativa." },
        { to: "/reports", label: "Reports", relation: "Cross-platform intelligence", detail: "La capa analitica consolida contexto, salud y trazabilidad desde Administration." },
      ],
    },
    en: {
      title: "Ecosystem connections",
      description: "Administration governs master structures, permissions, workflows, and parameters that sustain the suite's cross-functional operation.",
      items: [
        { to: "/employees", label: "Employees", relation: "Workforce master", detail: "Direct consumer of companies, departments, positions, levels, and catalogs." },
        { to: "/recruitment", label: "Recruitment", relation: "Pipeline governance", detail: "Openings and evaluations rely on structures and approvals managed here." },
        { to: "/vacations", label: "Vacations", relation: "Policy control", detail: "Policies, hierarchies, and approvals originate from the administrative layer." },
        { to: "/reports", label: "Reports", relation: "Cross-platform intelligence", detail: "The analytics layer consolidates context, health, and traceability from Administration." },
      ],
    },
  },
  recruitment: {
    es: {
      title: "Flujo conectado de talento",
      description: "Recruitment no opera aislado: se conecta con estructura organizacional, alta de colaboradores y reporting ejecutivo.",
      items: [
        { to: "/administration/positions", label: "Administration", relation: "Estructura y reglas", detail: "Posiciones, departamentos, localizaciones y flujos sostienen la operacion de recruitment." },
        { to: "/employees", label: "Employees", relation: "Candidate-to-employee", detail: "Las aprobaciones y contrataciones continúan el ciclo de vida hacia el expediente del colaborador." },
        { to: "/development", label: "Development", relation: "Talent readiness", detail: "El pipeline alimenta movilidad interna, readiness y conversaciones de talento." },
        { to: "/reports/recruitment", label: "Reports", relation: "Funnel analytics", detail: "Conversion, time to hire y efectividad de fuentes se leen en la capa analitica." },
      ],
    },
    en: {
      title: "Connected talent flow",
      description: "Recruitment does not operate in isolation; it connects with org structure, employee onboarding, and executive reporting.",
      items: [
        { to: "/administration/positions", label: "Administration", relation: "Structure and rules", detail: "Positions, departments, locations, and flows sustain recruitment operations." },
        { to: "/employees", label: "Employees", relation: "Candidate-to-employee", detail: "Approvals and hiring continue the lifecycle into the employee file." },
        { to: "/development", label: "Development", relation: "Talent readiness", detail: "The pipeline feeds internal mobility, readiness, and talent conversations." },
        { to: "/reports/recruitment", label: "Reports", relation: "Funnel analytics", detail: "Conversion, time to hire, and source effectiveness are read from the analytics layer." },
      ],
    },
  },
  employees: {
    es: {
      title: "Centro conectado del colaborador",
      description: "Employees es la columna vertebral del ecosistema y se relaciona con desarrollo, acciones, beneficios, autoservicio y salud ocupacional.",
      items: [
        { to: "/development", label: "Development", relation: "Talento y growth", detail: "Skills, evaluaciones, planes y readiness se construyen sobre el expediente del empleado." },
        { to: "/personnel-actions", label: "Personnel Actions", relation: "Lifecycle changes", detail: "Promociones, traslados y cambios sensibles afectan el before/after del colaborador." },
        { to: "/insurance", label: "Insurance", relation: "Benefits coverage", detail: "Afiliaciones, dependientes y costos se conectan al contexto real del empleado." },
        { to: "/occupational-health", label: "Occupational Health", relation: "Health & compliance", detail: "Incidentes, restricciones y casos medicos se trazan por colaborador." },
      ],
    },
    en: {
      title: "Connected employee center",
      description: "Employees is the backbone of the ecosystem and connects with development, personnel actions, benefits, self-service, and occupational health.",
      items: [
        { to: "/development", label: "Development", relation: "Talent and growth", detail: "Skills, evaluations, plans, and readiness are built on top of the employee file." },
        { to: "/personnel-actions", label: "Personnel Actions", relation: "Lifecycle changes", detail: "Promotions, transfers, and sensitive changes affect the employee before/after." },
        { to: "/insurance", label: "Insurance", relation: "Benefits coverage", detail: "Enrollments, dependents, and costs connect to the real employee context." },
        { to: "/occupational-health", label: "Occupational Health", relation: "Health & compliance", detail: "Incidents, restrictions, and medical cases are tracked per employee." },
      ],
    },
  },
  vacations: {
    es: {
      title: "Gobierno vacacional conectado",
      description: "Vacations se apoya en estructura, autoservicio, approvals y reporting para controlar cobertura y pasivo vacacional.",
      items: [
        { to: "/self-service/vacation-requests", label: "Self-Service", relation: "Employee requests", detail: "Las solicitudes del colaborador entran al flujo vacacional desde autoservicio." },
        { to: "/employees/leaves", label: "Employees", relation: "Absence visibility", detail: "Los estados de vacaciones impactan ausencias, disponibilidad y lectura del expediente." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Las rutas de aprobacion y politicas dependen del motor administrativo." },
        { to: "/reports/vacations", label: "Reports", relation: "Operational analytics", detail: "Balances, consumo, conflictos y riesgo se consolidan en analitica transversal." },
      ],
    },
    en: {
      title: "Connected leave governance",
      description: "Vacations relies on structure, self-service, approvals, and reporting to control coverage and leave liability.",
      items: [
        { to: "/self-service/vacation-requests", label: "Self-Service", relation: "Employee requests", detail: "Employee requests enter the leave workflow through self-service." },
        { to: "/employees/leaves", label: "Employees", relation: "Absence visibility", detail: "Leave states affect absences, availability, and employee file visibility." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Approval routes and policies depend on the administration engine." },
        { to: "/reports/vacations", label: "Reports", relation: "Operational analytics", detail: "Balances, consumption, conflicts, and risk are consolidated in cross-platform analytics." },
      ],
    },
  },
  development: {
    es: {
      title: "Talento conectado al ciclo laboral",
      description: "Development cruza datos del colaborador, estructura, recruitment y reporting para sostener decisiones reales de talento y sucesion.",
      items: [
        { to: "/employees/profile", label: "Employees", relation: "Employee dossier", detail: "El desarrollo del talento se construye sobre la lectura 360 del colaborador." },
        { to: "/recruitment", label: "Recruitment", relation: "Internal mobility", detail: "Vacantes y pipeline sirven como insumo para readiness y movilidad interna." },
        { to: "/reports/training", label: "Reports", relation: "Training analytics", detail: "Cumplimiento, gaps y readiness escalan a la capa ejecutiva de reporting." },
        { to: "/administration/positions", label: "Administration", relation: "Role structure", detail: "Posiciones, niveles y departamentos definen brechas y expectativa de crecimiento." },
      ],
    },
    en: {
      title: "Talent connected to the employee lifecycle",
      description: "Development crosses employee, structure, recruitment, and reporting data to support real talent and succession decisions.",
      items: [
        { to: "/employees/profile", label: "Employees", relation: "Employee dossier", detail: "Talent development is built on top of the employee 360 view." },
        { to: "/recruitment", label: "Recruitment", relation: "Internal mobility", detail: "Openings and pipeline signals feed readiness and internal mobility." },
        { to: "/reports/training", label: "Reports", relation: "Training analytics", detail: "Compliance, gaps, and readiness escalate into executive reporting." },
        { to: "/administration/positions", label: "Administration", relation: "Role structure", detail: "Positions, levels, and departments define gaps and growth expectations." },
      ],
    },
  },
  insurance: {
    es: {
      title: "Beneficios conectados al colaborador",
      description: "Insurance opera sobre empleados reales, dependientes, estructura multiempresa y lectura analitica de costos y cobertura.",
      items: [
        { to: "/employees/dependents", label: "Employees", relation: "Dependents and profile", detail: "Afiliaciones y dependientes consumen el expediente y relaciones del colaborador." },
        { to: "/administration/companies", label: "Administration", relation: "Company governance", detail: "Elegibilidad, vigencias y cobertura se organizan por compania y estructura." },
        { to: "/reports/insurance", label: "Reports", relation: "Cost analytics", detail: "Costo empresa, costo empleado y distribucion por plan se leen en reports." },
        { to: "/self-service/requests", label: "Self-Service", relation: "Employee demand", detail: "La experiencia del colaborador termina reflejando solicitudes e impacto en beneficios." },
      ],
    },
    en: {
      title: "Benefits connected to the employee",
      description: "Insurance operates on real employees, dependents, multi-company structure, and analytical visibility on cost and coverage.",
      items: [
        { to: "/employees/dependents", label: "Employees", relation: "Dependents and profile", detail: "Enrollments and dependents consume employee file and relationship data." },
        { to: "/administration/companies", label: "Administration", relation: "Company governance", detail: "Eligibility, effective periods, and coverage are organized by company and structure." },
        { to: "/reports/insurance", label: "Reports", relation: "Cost analytics", detail: "Company cost, employee cost, and plan distribution are read in reports." },
        { to: "/self-service/requests", label: "Self-Service", relation: "Employee demand", detail: "The employee experience ultimately reflects requests and benefits impact." },
      ],
    },
  },
  "personnel-actions": {
    es: {
      title: "Cambios del colaborador con gobierno real",
      description: "Personnel Actions conecta workflow, estructura organizacional, compensacion y analitica para controlar cambios sensibles del workforce.",
      items: [
        { to: "/employees", label: "Employees", relation: "Before / after", detail: "Cada accion parte del estado actual del colaborador y termina impactando su expediente." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Las aprobaciones y reglas de movimiento dependen del motor administrativo." },
        { to: "/reports/rotation", label: "Reports", relation: "Workforce analytics", detail: "Promociones, rotacion y salary changes se reflejan en reportes ejecutivos." },
        { to: "/development/readiness", label: "Development", relation: "Talent progression", detail: "Promociones y cambios de rol se conectan con readiness y crecimiento interno." },
      ],
    },
    en: {
      title: "Employee changes with real governance",
      description: "Personnel Actions connects workflow, org structure, compensation, and analytics to control sensitive workforce changes.",
      items: [
        { to: "/employees", label: "Employees", relation: "Before / after", detail: "Each action starts from the employee current state and ends by impacting the employee file." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Approvals and movement rules depend on the administration engine." },
        { to: "/reports/rotation", label: "Reports", relation: "Workforce analytics", detail: "Promotions, turnover, and salary changes are reflected in executive reports." },
        { to: "/development/readiness", label: "Development", relation: "Talent progression", detail: "Promotions and role changes connect with readiness and internal growth." },
      ],
    },
  },
  "occupational-health": {
    es: {
      title: "Salud ocupacional conectada",
      description: "Occupational Health se cruza con empleados, estructura, beneficios y reporting para sostener cumplimiento y seguimiento de casos.",
      items: [
        { to: "/employees/profile", label: "Employees", relation: "Employee health context", detail: "Los casos medicos y restricciones se trazan por colaborador y expediente." },
        { to: "/insurance", label: "Insurance", relation: "Coverage context", detail: "Beneficios y coberturas pueden dar contexto a seguimiento de salud y dependientes." },
        { to: "/reports/occupational-health", label: "Reports", relation: "Risk analytics", detail: "Incidentes, restricciones y cumplimiento escalan a la capa de reportes." },
        { to: "/administration/locations", label: "Administration", relation: "Operational structure", detail: "Localizaciones y estructura permiten leer severidad, riesgo y cumplimiento por sitio." },
      ],
    },
    en: {
      title: "Connected occupational health",
      description: "Occupational Health crosses employees, structure, benefits, and reporting to sustain compliance and case follow-up.",
      items: [
        { to: "/employees/profile", label: "Employees", relation: "Employee health context", detail: "Medical cases and restrictions are tracked per employee and dossier." },
        { to: "/insurance", label: "Insurance", relation: "Coverage context", detail: "Benefits and coverage can add context to health follow-up and dependents." },
        { to: "/reports/occupational-health", label: "Reports", relation: "Risk analytics", detail: "Incidents, restrictions, and compliance escalate into the reporting layer." },
        { to: "/administration/locations", label: "Administration", relation: "Operational structure", detail: "Locations and structure enable severity, risk, and compliance by site." },
      ],
    },
  },
  reports: {
    es: {
      title: "Capa de inteligencia transversal",
      description: "Reports es la capa que consolida operacion, talento, compensacion, beneficios y riesgo desde toda la suite.",
      items: [
        { to: "/employees", label: "Employees", relation: "Workforce base", detail: "Headcount, estatus, tenencia y composicion nacen del workforce real." },
        { to: "/recruitment", label: "Recruitment", relation: "Hiring analytics", detail: "Vacantes, funnel, time to hire y origen de candidatos alimentan el dominio." },
        { to: "/vacations", label: "Vacations", relation: "Leave analytics", detail: "Balances, solicitudes, conflictos y aprobaciones sostienen la lectura vacacional." },
        { to: "/development", label: "Development", relation: "Talent analytics", detail: "Training, gaps, readiness y planes activos conectan el componente de talento." },
      ],
    },
    en: {
      title: "Cross-platform intelligence layer",
      description: "Reports is the layer that consolidates operations, talent, compensation, benefits, and risk across the whole suite.",
      items: [
        { to: "/employees", label: "Employees", relation: "Workforce base", detail: "Headcount, status, tenure, and composition originate from the real workforce." },
        { to: "/recruitment", label: "Recruitment", relation: "Hiring analytics", detail: "Openings, funnel, time to hire, and candidate sourcing feed the domain." },
        { to: "/vacations", label: "Vacations", relation: "Leave analytics", detail: "Balances, requests, conflicts, and approvals sustain the leave readout." },
        { to: "/development", label: "Development", relation: "Talent analytics", detail: "Training, gaps, readiness, and active plans connect the talent component." },
      ],
    },
  },
  "self-service": {
    es: {
      title: "Experiencia del colaborador conectada",
      description: "Self-Service no es una isla: refleja solicitudes que se resuelven en Vacations, Employees, Administration y Reports.",
      items: [
        { to: "/employees", label: "Employees", relation: "Employee base", detail: "El contexto del colaborador, permisos y datos personales nacen del modulo de empleados." },
        { to: "/vacations", label: "Vacations", relation: "Leave workflow", detail: "Las solicitudes vacacionales se convierten en flujo real dentro del dominio de vacaciones." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Los workflows visibles al colaborador dependen del motor de aprobacion central." },
        { to: "/reports/self-service", label: "Reports", relation: "Experience analytics", detail: "Tiempos, volumen y carga operativa del autoservicio se consolidan en reportes." },
      ],
    },
    en: {
      title: "Connected employee experience",
      description: "Self-Service is not an island: it reflects requests resolved in Vacations, Employees, Administration, and Reports.",
      items: [
        { to: "/employees", label: "Employees", relation: "Employee base", detail: "Employee context, permissions, and personal data originate from Employees." },
        { to: "/vacations", label: "Vacations", relation: "Leave workflow", detail: "Leave requests become real workflow items within the vacations domain." },
        { to: "/administration/authorization-flows", label: "Administration", relation: "Approval governance", detail: "Workflows visible to the employee depend on the central approval engine." },
        { to: "/reports/self-service", label: "Reports", relation: "Experience analytics", detail: "Timing, volume, and operational load from self-service are consolidated in reports." },
      ],
    },
  },
  dashboard: {
    es: {
      title: "Navegacion ejecutiva intermodular",
      description: "Desde el dashboard debes poder saltar a los dominios que explican cada riesgo, cada KPI y cada decision operativa.",
      items: [
        { to: "/administration", label: "Administration", relation: "Governance", detail: "Flujos, parametros y estructura maestra del sistema." },
        { to: "/reports", label: "Reports", relation: "Analytics", detail: "Lectura ejecutiva de workforce, compensacion, riesgo y talento." },
        { to: "/employees", label: "Employees", relation: "Workforce", detail: "Expediente, headcount y base del ciclo del colaborador." },
        { to: "/self-service", label: "Self-Service", relation: "Experience", detail: "Solicitudes y experiencia operativa del colaborador final." },
      ],
    },
    en: {
      title: "Cross-module executive navigation",
      description: "From the dashboard you should be able to jump into the domains explaining every risk, KPI, and operational decision.",
      items: [
        { to: "/administration", label: "Administration", relation: "Governance", detail: "Flows, parameters, and master structure of the system." },
        { to: "/reports", label: "Reports", relation: "Analytics", detail: "Executive workforce, compensation, risk, and talent visibility." },
        { to: "/employees", label: "Employees", relation: "Workforce", detail: "Dossier, headcount, and base employee lifecycle context." },
        { to: "/self-service", label: "Self-Service", relation: "Experience", detail: "Requests and operational experience for the end employee." },
      ],
    },
  },
};

export function getModuleConnections(moduleKey, language = "es") {
  const locale = language === "en" ? "en" : "es";
  return MODULE_CONNECTIONS[moduleKey]?.[locale] || MODULE_CONNECTIONS.dashboard[locale];
}
