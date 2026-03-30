import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useI18n from "../../../app/providers/useI18n";
import "../../shared/hrSuite.css";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import "../dashboard.css";
import dashboardService from "../services/dashboard.service";

function toneClass(value) {
  return value === "healthy" || value === "strong"
    ? value
    : value === "critical"
      ? "critical"
      : "warning";
}

export default function DashboardPage() {
  const { language } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    dashboardService.getDashboardOverview()
      .then((response) => {
        if (!ignore) {
          setData(response);
          setError("");
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("No pudimos consolidar el dashboard ejecutivo.");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <span className="dashboard-eyebrow">Executive command center</span>
          <div className="dashboard-hero__head">
            <h1>Cargando dashboard operativo</h1>
            <p>Estamos consolidando datos de talento, gobierno, vacaciones y modulos satelite.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <span className="dashboard-eyebrow">Executive command center</span>
          <div className="dashboard-hero__head">
            <h1>No pudimos cargar el dashboard</h1>
            <p>{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__head">
          <span className="dashboard-eyebrow">Executive command center</span>
          <h1>{data.hero.title}</h1>
          <p>{data.hero.description}</p>
        </div>

        <div className="dashboard-hero__stats">
          {data.hero.stats.map((item) => (
            <article key={item.label} className="dashboard-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card__head">
          <div>
            <h2>Salud transversal de la plataforma</h2>
            <p>Lectura rapida del nivel de solidez y de los puntos que todavia exigen intervencion operativa.</p>
          </div>
        </div>

        <div className="dashboard-scorecards">
          {data.moduleScorecards.map((item) => (
            <Link key={item.name} to={item.route} className="dashboard-scorecard">
              <div className="dashboard-scorecard__top">
                <span>{item.name}</span>
                <span className={`dashboard-pill ${toneClass(item.status)}`}>{item.status}</span>
              </div>
              <strong>{item.value}</strong>
              <p>{item.helper}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-layout">
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="dashboard-card__head">
              <div>
                <h2>Registro de riesgos y percepcion</h2>
                <p>Riesgos que afectan estabilidad, compliance o la sensacion de plataforma enterprise.</p>
              </div>
            </div>

            <div className="dashboard-risk-grid">
              {data.riskRegister.map((item) => (
                <article key={item.title} className="dashboard-risk">
                  <span>{item.owner}</span>
                  <strong>{item.value}</strong>
                  <p>{item.title}</p>
                  <small className="dashboard-muted">{item.detail}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card__head">
              <div>
                <h2>Focos operativos del dia</h2>
                <p>Lectura sintetica de continuidad entre talento, workforce, vacaciones y analitica.</p>
              </div>
            </div>

            <div className="dashboard-focus-grid">
              {data.focusAreas.map((item) => (
                <article key={item.title} className="dashboard-focus">
                  <span>{item.title}</span>
                  <strong>{item.metric}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card__head">
              <div>
                <h2>Actividad reciente conectada</h2>
                <p>Eventos traidos desde Administration, Recruitment y Vacations para reforzar la narrativa integrada.</p>
              </div>
            </div>

            <div className="dashboard-list">
              {data.activityFeed.map((item) => (
                <article key={`${item.source}-${item.id}`} className="dashboard-list-item">
                  <div className="dashboard-list-item__head">
                    <div>
                      <small>{item.source}</small>
                      <strong>{item.title}</strong>
                    </div>
                  </div>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="dashboard-card__head">
              <div>
                <h2>Cola de aprobaciones ejecutivas</h2>
                <p>Solicitudes pendientes que hoy sostienen decisiones transversales del ecosistema.</p>
              </div>
              <Link className="dashboard-link" to="/administration/authorization-flows">Abrir Administration</Link>
            </div>

            <div className="dashboard-list">
              {data.approvalQueue.map((item) => (
                <article key={item.id} className="dashboard-list-item">
                  <div className="dashboard-list-item__head">
                    <div>
                      <small>{item.module}</small>
                      <strong>{item.type}</strong>
                    </div>
                    <span className={`dashboard-pill ${toneClass(item.priority === "Critica" ? "critical" : "warning")}`}>{item.priority}</span>
                  </div>
                  <p>{item.requester} | {item.currentLevel}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card__head">
              <div>
                <h2>People spotlight</h2>
                <p>Expedientes visibles para reforzar la sensacion de producto vivo y conectado a RRHH real.</p>
              </div>
              <Link className="dashboard-link" to="/employees/profile">Abrir perfil 360</Link>
            </div>

            <div className="dashboard-people-grid">
              {data.peopleSpotlight.map((person) => (
                <article key={person.id} className="dashboard-person">
                  <span>{person.department}</span>
                  <strong>{person.name}</strong>
                  <p>{person.position} | {person.location}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ModuleConnectionsPanel moduleKey="dashboard" language={language} />
    </main>
  );
}
