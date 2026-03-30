import { Outlet } from "react-router-dom";
import useI18n from "../providers/useI18n";

export default function AuthLayout() {
  const { language } = useI18n();
  const isSpanish = language === "es";

  return (
    <main className="auth-layout">
      <section className="auth-layout__brand">
        <span className="auth-layout__eyebrow">MGAHRCore</span>
        <h1>
          {isSpanish
            ? "Una plataforma de RRHH con estructura, gobierno y lectura ejecutiva."
            : "An HR platform with structure, governance, and executive visibility."}
        </h1>
        <p>
          {isSpanish
            ? "Centraliza administracion, empleados, reclutamiento, vacaciones y modulos transversales en una sola experiencia con estructura operativa y visibilidad empresarial."
            : "Centralize administration, employees, recruitment, vacations, and cross-functional modules in one experience with operational structure and enterprise visibility."}
        </p>

        <div className="auth-layout__highlights">
          <article>
            <strong>{isSpanish ? "Control operativo" : "Operational control"}</strong>
            <span>
              {isSpanish
                ? "Gobierno, aprobaciones, riesgos y seguimiento en una sola capa."
                : "Governance, approvals, risk, and follow-up in one layer."}
            </span>
          </article>
          <article>
            <strong>{isSpanish ? "Suite integrada" : "Integrated suite"}</strong>
            <span>
              {isSpanish
                ? "Dominios conectados para que la plataforma se sienta coherente."
                : "Connected domains so the platform feels coherent."}
            </span>
          </article>
          <article>
            <strong>{isSpanish ? "Acceso corporativo" : "Corporate access"}</strong>
            <span>
              {isSpanish
                ? "Ingreso centralizado para equipos que operan procesos de RRHH con continuidad."
                : "Centralized entry point for teams operating HR processes with continuity."}
            </span>
          </article>
        </div>
      </section>

      <section className="auth-layout__content">
        <Outlet />
      </section>
    </main>
  );
}
