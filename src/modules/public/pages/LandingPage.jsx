import { Link } from "react-router-dom";
import useI18n from "../../../app/providers/useI18n";
import useAuthStore from "../../../app/store/authStore";

function IconShell({ children, className = "landing-feature-icon" }) {
  return <span className={className}>{children}</span>;
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4H14v17" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 8h4.5A1.5 1.5 0 0 1 20 9.5V21" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h2M8 12h2M8 16h2M16 12h2M12 21v-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 11a2.5 2.5 0 1 0 0-5M4 19a5 5 0 0 1 10 0M14 19a4 4 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7 10 17l-5-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const { language } = useI18n();
  const isSpanish = language === "es";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const primaryCta = isAuthenticated ? "/dashboard" : "/register";
  const primaryLabel = isAuthenticated
    ? (isSpanish ? "Entrar a la plataforma" : "Open platform")
    : (isSpanish ? "Solicitar acceso" : "Request access");

  const headerLinks = [
    { href: "#platform", label: isSpanish ? "Plataforma" : "Platform" },
    { href: "#modules", label: isSpanish ? "Modulos" : "Modules" },
    { href: "#capabilities", label: isSpanish ? "Capacidades" : "Capabilities" },
    { href: "#trust", label: isSpanish ? "Confianza" : "Trust" },
  ];

  const problemPoints = isSpanish
    ? [
        "Procesos de RRHH dispersos entre herramientas y hojas de calculo.",
        "Poca trazabilidad sobre aprobaciones, cambios y decisiones sensibles.",
        "Visibilidad limitada sobre el ciclo completo del colaborador.",
      ]
    : [
        "HR processes scattered across tools and spreadsheets.",
        "Limited traceability over approvals, changes, and sensitive decisions.",
        "Weak visibility into the full employee lifecycle.",
      ];

  const solutionPoints = isSpanish
    ? [
        "Plataforma integrada con dominios conectados sobre una misma base operativa.",
        "Workflows, aprobaciones y estructura organizacional visibles desde un solo entorno.",
        "Lectura transversal del colaborador, la operacion y el riesgo organizacional.",
      ]
    : [
        "Integrated platform with connected domains on one operational base.",
        "Workflows, approvals, and organizational structure visible from one environment.",
        "Cross-platform visibility into employees, operations, and organizational risk.",
      ];

  const modules = [
    {
      title: "Administration",
      description: isSpanish
        ? "Estructura organizacional, catalogos maestros, permisos, flujos y configuracion global."
        : "Organizational structure, master catalogs, permissions, workflows, and global settings.",
    },
    {
      title: "Employees",
      description: isSpanish
        ? "Perfil 360 del colaborador con historial, documentos, compensacion y contexto organizacional."
        : "360 employee profile with history, documents, compensation, and organizational context.",
    },
    {
      title: "Recruitment",
      description: isSpanish
        ? "Requisiciones, pipeline, entrevistas y evaluaciones conectadas con la estructura del negocio."
        : "Requisitions, pipeline, interviews, and evaluations connected to business structure.",
    },
    {
      title: "Vacations",
      description: isSpanish
        ? "Politicas, saldos, solicitudes, aprobaciones y cobertura operativa del tiempo fuera."
        : "Policies, balances, requests, approvals, and operational leave coverage.",
    },
    {
      title: "Development",
      description: isSpanish
        ? "Skills, evaluaciones, planes de desarrollo, readiness y gestion de talento."
        : "Skills, evaluations, development plans, readiness, and talent management.",
    },
    {
      title: "Insurance",
      description: isSpanish
        ? "Planes, afiliaciones, dependientes, costos y movimientos de cobertura con control operativo."
        : "Plans, enrollments, dependents, costs, and coverage movements with operational control.",
    },
    {
      title: "Personnel Actions",
      description: isSpanish
        ? "Promociones, traslados, cambios salariales y acciones de personal con impacto before/after."
        : "Promotions, transfers, salary changes, and personnel actions with before/after impact.",
    },
    {
      title: "Occupational Health",
      description: isSpanish
        ? "Incidentes, visitas medicas, laboratorio, medicamentos y seguimiento de casos."
        : "Incidents, medical visits, lab tests, medicines, and case follow-up.",
    },
    {
      title: "Reports",
      description: isSpanish
        ? "Indicadores ejecutivos, analitica operativa y lectura transversal del workforce."
        : "Executive indicators, operational analytics, and cross-platform workforce visibility.",
    },
    {
      title: "Self-Service",
      description: isSpanish
        ? "Solicitudes, bandeja, aprobaciones y experiencia de autoservicio conectada al ecosistema."
        : "Requests, inbox, approvals, and a self-service experience connected to the ecosystem.",
    },
  ];

  const capabilities = isSpanish
    ? [
        "Trazabilidad de aprobaciones y decisiones",
        "Control de procesos sensibles del colaborador",
        "Lectura integral del ciclo de vida laboral",
        "Estructura organizacional conectada a la operacion",
        "Workflows intermodulares con contexto",
        "Visibilidad ejecutiva y operativa en una sola plataforma",
      ]
    : [
        "Traceability for approvals and decisions",
        "Control over sensitive employee processes",
        "End-to-end employee lifecycle visibility",
        "Organizational structure connected to operations",
        "Cross-module workflows with context",
        "Executive and operational visibility in one platform",
      ];

  const differentiators = [
    {
      title: isSpanish ? "Arquitectura modular conectada" : "Connected modular architecture",
      description: isSpanish
        ? "Cada dominio resuelve una funcion clara, pero opera como parte de un ecosistema coherente."
        : "Each domain solves a clear function while operating as part of one coherent ecosystem.",
    },
    {
      title: isSpanish ? "Consistencia operativa" : "Operational consistency",
      description: isSpanish
        ? "La estructura, los flujos y la informacion se alinean para reducir friccion administrativa."
        : "Structure, workflows, and information stay aligned to reduce administrative friction.",
    },
    {
      title: isSpanish ? "Escalabilidad organizacional" : "Organizational scalability",
      description: isSpanish
        ? "La plataforma esta pensada para organizaciones que requieren claridad, control y crecimiento sostenido."
        : "The platform is designed for organizations that require clarity, control, and sustained growth.",
    },
  ];

  const trustPoints = isSpanish
    ? [
        "Control empresarial sobre estructura, talento y operacion.",
        "Dominios funcionales conectados bajo una sola experiencia.",
        "Lectura clara para RRHH, administracion y liderazgo.",
      ]
    : [
        "Enterprise control over structure, talent, and operations.",
        "Functional domains connected under one experience.",
        "Clear visibility for HR, administration, and leadership.",
      ];

  return (
    <div className="landing-page landing-page--corporate">
      <nav className="landing-nav landing-nav--corporate">
        <div className="landing-nav__brand">
          <IconShell className="landing-brand-icon"><BuildingIcon /></IconShell>
          <span>MGAHRCore</span>
        </div>

        <div className="landing-nav__links">
          {headerLinks.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
          <Link to="/login" className="landing-nav__signin">
            {isSpanish ? "Iniciar sesion" : "Sign in"}
          </Link>
          <Link to="/register" className="landing-nav__cta">
            {isSpanish ? "Solicitar acceso" : "Request access"}
          </Link>
        </div>
      </nav>

      <section className="landing-hero landing-hero--corporate">
        <div className="landing-hero__copy">
          <span className="landing-eyebrow">
            {isSpanish ? "Plataforma integral de RRHH" : "Integrated HR platform"}
          </span>
          <h1>
            {isSpanish
              ? "Control operativo, trazabilidad y estructura para gestionar RRHH con criterio empresarial."
              : "Operational control, traceability, and structure for managing HR with enterprise discipline."}
          </h1>
          <p>
            {isSpanish
              ? "MGAHRCore centraliza administracion, empleados, reclutamiento, vacaciones, talento y operaciones transversales en una sola plataforma, con visibilidad clara sobre procesos, aprobaciones y ciclo del colaborador."
              : "MGAHRCore centralizes administration, employees, recruitment, vacations, talent, and cross-functional operations in one platform, with clear visibility into processes, approvals, and the employee lifecycle."}
          </p>

          <div className="landing-hero__actions landing-hero__actions--primary">
            <Link to={primaryCta} className="landing-button landing-button--search">
              {primaryLabel}
              <IconShell className="landing-inline-icon"><ArrowIcon /></IconShell>
            </Link>
            <a href="#platform" className="landing-button landing-button--ghost">
              {isSpanish ? "Conocer la plataforma" : "Explore the platform"}
            </a>
          </div>

          <div className="landing-trending landing-trending--enterprise">
            <span>{isSpanish ? "Enfoque de la plataforma" : "Platform focus"}</span>
            <div className="landing-trending__tags">
              <strong>{isSpanish ? "Gobierno" : "Governance"}</strong>
              <strong>{isSpanish ? "Trazabilidad" : "Traceability"}</strong>
              <strong>{isSpanish ? "Operacion" : "Operations"}</strong>
              <strong>{isSpanish ? "Talento" : "Talent"}</strong>
              <strong>{isSpanish ? "Visibilidad" : "Visibility"}</strong>
            </div>
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="landing-panel__card landing-panel__card--hero landing-panel__card--executive">
            <span>{isSpanish ? "Vision ejecutiva" : "Executive view"}</span>
            <strong>
              {isSpanish
                ? "Una suite de RRHH pensada para organizaciones que necesitan estructura, control y lectura transversal."
                : "An HR suite built for organizations that need structure, control, and cross-functional visibility."}
            </strong>
            <p>
              {isSpanish
                ? "Desde la estructura organizacional hasta las acciones del colaborador, MGAHRCore conecta dominios operativos para reducir fragmentacion y dar contexto real a la toma de decisiones."
                : "From organizational structure to employee actions, MGAHRCore connects operational domains to reduce fragmentation and bring real context to decision-making."}
            </p>
          </div>

          <div className="landing-panel__grid landing-panel__grid--compact">
            <article>
              <strong>10</strong>
              <span>{isSpanish ? "Modulos funcionales" : "Functional modules"}</span>
            </article>
            <article>
              <strong>Workflow</strong>
              <span>{isSpanish ? "Aprobaciones y gobierno" : "Approvals and governance"}</span>
            </article>
            <article>
              <strong>360</strong>
              <span>{isSpanish ? "Lectura del colaborador" : "Employee visibility"}</span>
            </article>
            <article>
              <strong>{isSpanish ? "Centralizado" : "Centralized"}</strong>
              <span>{isSpanish ? "Operacion y reporting" : "Operations and reporting"}</span>
            </article>
          </div>
        </div>
      </section>

      <section id="platform" className="landing-section landing-section--soft">
        <div className="landing-section__head">
          <h2>
            {isSpanish
              ? "El problema no es operar RRHH. El problema es hacerlo sin estructura compartida."
              : "The challenge is not running HR. It is doing it without shared structure."}
          </h2>
          <p>
            {isSpanish
              ? "Cuando los procesos viven en herramientas separadas, la operacion pierde trazabilidad, los cambios se dispersan y la lectura del colaborador se fragmenta."
              : "When processes live across disconnected tools, operations lose traceability, changes become scattered, and employee visibility gets fragmented."}
          </p>
        </div>

        <div className="landing-value-grid">
          <article className="landing-value-card">
            <span>{isSpanish ? "Lo que suele pasar" : "What usually happens"}</span>
            <ul>
              {problemPoints.map((item) => (
                <li key={item}>
                  <IconShell className="landing-list-icon"><CheckIcon /></IconShell>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="landing-value-card">
            <span>{isSpanish ? "Como responde MGAHRCore" : "How MGAHRCore responds"}</span>
            <ul>
              {solutionPoints.map((item) => (
                <li key={item}>
                  <IconShell className="landing-list-icon"><CheckIcon /></IconShell>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="modules" className="landing-section">
        <div className="landing-section__head">
          <h2>
            {isSpanish
              ? "Un ecosistema de modulos para operar RRHH con continuidad"
              : "A connected module ecosystem for continuous HR operations"}
          </h2>
          <p>
            {isSpanish
              ? "Cada modulo resuelve una capacidad especifica y, al mismo tiempo, aporta a una sola historia operativa del colaborador y de la organizacion."
              : "Each module solves a specific capability while contributing to one operational story across employees and the organization."}
          </p>
        </div>

        <div className="landing-module-grid landing-module-grid--rich">
          {modules.map((module) => (
            <article key={module.title} className="landing-module-card landing-module-card--rich">
              <span>{module.title}</span>
              <strong>{module.description}</strong>
            </article>
          ))}
        </div>
      </section>

      <section id="capabilities" className="landing-section landing-section--soft">
        <div className="landing-section__head">
          <h2>
            {isSpanish
              ? "Capacidades empresariales para una operacion mas controlada"
              : "Enterprise capabilities for more controlled operations"}
          </h2>
          <p>
            {isSpanish
              ? "MGAHRCore concentra estructura, procesos y visibilidad para que RRHH opere con mas contexto y menos friccion."
              : "MGAHRCore brings structure, process control, and visibility together so HR can operate with more context and less friction."}
          </p>
        </div>

        <div className="landing-capability-grid">
          {capabilities.map((item) => (
            <article key={item} className="landing-capability-card">
              <IconShell className="landing-list-icon"><CheckIcon /></IconShell>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__head">
          <h2>
            {isSpanish
              ? "Por que MGAHRCore aporta mas valor"
              : "Why MGAHRCore delivers stronger value"}
          </h2>
          <p>
            {isSpanish
              ? "No se trata de acumular pantallas. Se trata de operar con consistencia, contexto y una arquitectura que soporte crecimiento organizacional."
              : "It is not about adding more screens. It is about operating with consistency, context, and an architecture that supports organizational growth."}
          </p>
        </div>

        <div className="landing-differentiator-grid">
          {differentiators.map((item) => (
            <article key={item.title} className="landing-enterprise-card landing-enterprise-card--compact">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="trust" className="landing-section landing-section--soft">
        <div className="landing-section__head">
          <h2>
            {isSpanish
              ? "Una experiencia orientada a organizaciones que necesitan seriedad operativa"
              : "An experience built for organizations that require operational seriousness"}
          </h2>
          <p>
            {isSpanish
              ? "Sin promesas vacias ni claims artificiales. La propuesta de MGAHRCore se basa en estructura funcional, coherencia entre dominios y control empresarial."
              : "No empty claims and no artificial promises. MGAHRCore is built on functional structure, domain coherence, and enterprise control."}
          </p>
        </div>

        <div className="landing-trust-grid">
          {trustPoints.map((item) => (
            <article key={item} className="landing-trust-card">
              <IconShell className="landing-list-icon"><CheckIcon /></IconShell>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--cta">
        <div className="landing-cta landing-cta--enterprise">
          <h2>
            {isSpanish
              ? "Conoce una plataforma de RRHH pensada para operar con control, estructura y visibilidad."
              : "Explore an HR platform designed to operate with control, structure, and visibility."}
          </h2>
          <p>
            {isSpanish
              ? "Solicita acceso, conoce la plataforma o entra directamente al entorno si ya formas parte de la operacion."
              : "Request access, learn more about the platform, or sign in directly if you already operate within the environment."}
          </p>
          <div className="landing-hero__actions">
            <Link to={primaryCta} className="landing-button">
              {primaryLabel}
              <IconShell className="landing-inline-icon"><ArrowIcon /></IconShell>
            </Link>
            <Link to="/login" className="landing-button landing-button--ghost">
              {isSpanish ? "Iniciar sesion" : "Sign in"}
            </Link>
            <a href="#platform" className="landing-button landing-button--ghost">
              {isSpanish ? "Solicitar informacion" : "Request information"}
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer__grid">
          <div>
            <div className="landing-nav__brand">
              <IconShell className="landing-brand-icon"><BuildingIcon /></IconShell>
              <span>MGAHRCore</span>
            </div>
            <p>
              {isSpanish
                ? "Plataforma enterprise de RRHH para estructura organizacional, ciclo del colaborador y control operativo."
                : "Enterprise HR platform for organizational structure, employee lifecycle, and operational control."}
            </p>
          </div>

          <div>
            <h4>{isSpanish ? "Plataforma" : "Platform"}</h4>
            <ul>
              <li><a href="#platform">{isSpanish ? "Propuesta de valor" : "Value proposition"}</a></li>
              <li><a href="#modules">{isSpanish ? "Modulos" : "Modules"}</a></li>
              <li><a href="#capabilities">{isSpanish ? "Capacidades" : "Capabilities"}</a></li>
            </ul>
          </div>

          <div>
            <h4>{isSpanish ? "Acceso" : "Access"}</h4>
            <ul>
              <li><Link to="/login">{isSpanish ? "Iniciar sesion" : "Sign in"}</Link></li>
              <li><Link to="/register">{isSpanish ? "Solicitar acceso" : "Request access"}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{isSpanish ? "Valor" : "Value"}</h4>
            <ul>
              <li><a href="#trust">{isSpanish ? "Confianza y enfoque" : "Trust and posture"}</a></li>
              <li><a href="#platform">{isSpanish ? "Operacion integrada" : "Integrated operations"}</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer__bottom">© 2026 MGAHRCore. All rights reserved.</div>
      </footer>
    </div>
  );
}
