import { useState } from "react";
import { Link } from "react-router-dom";
import useI18n from "../../../app/providers/useI18n";
import authService from "../../../services/auth/auth.service";
import { hasSupabaseConfig } from "../../../services/supabase/client";

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4H14v17" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 8h4.5A1.5 1.5 0 0 1 20 9.5V21" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h2M8 12h2M8 16h2M16 12h1.5M12 21v-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.3 3.8 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { language } = useI18n();
  const isSpanish = language === "es";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const unavailableMessage = isSpanish
    ? "La recuperacion de acceso no esta disponible en este momento. Contacta al administrador para asistencia."
    : "Access recovery is not available at the moment. Contact the administrator for assistance.";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError(isSpanish ? "Ingresa tu correo corporativo." : "Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card auth-card--narrow">
      <div className="auth-card__header auth-card__header--centered">
        <div className="auth-brand-mark auth-brand-mark--centered">
          <span className="auth-brand-mark__icon" aria-hidden="true">
            <BuildingIcon />
          </span>
          <div>
            <h2>{isSpanish ? "Restablecer contrasena" : "Reset your password"}</h2>
            <p>
              {isSpanish
                ? "Ingresa tu correo y te enviaremos el proceso de recuperacion."
                : "Enter your email and we will send you the recovery process."}
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="auth-success-panel">
          <span className="auth-success-panel__icon" aria-hidden="true">
            <CheckIcon />
          </span>
          <h3>{isSpanish ? "Revisa tu correo" : "Check your email"}</h3>
          <p>
            {isSpanish
              ? `Enviamos instrucciones de recuperacion a ${email}.`
              : `We sent recovery instructions to ${email}.`}
          </p>

          <div className="auth-links auth-links--single auth-links--compact">
            <Link to="/login" className="auth-back-link">
              <ArrowLeftIcon />
              <span>{isSpanish ? "Volver al login" : "Back to login"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          {error ? (
            <div className="auth-alert auth-alert--error">
              <span className="auth-alert__icon" aria-hidden="true">
                <AlertIcon />
              </span>
              <div>
                <strong>{isSpanish ? "Error" : "Error"}</strong>
                <p>{error}</p>
              </div>
            </div>
          ) : null}

          {!hasSupabaseConfig ? (
            <div className="auth-alert">
              <span className="auth-alert__icon" aria-hidden="true">
                <AlertIcon />
              </span>
              <div>
                <strong>{isSpanish ? "Servicio temporalmente no disponible" : "Service temporarily unavailable"}</strong>
                <p>{unavailableMessage}</p>
              </div>
            </div>
          ) : null}

          <label className="auth-field">
            <span>{isSpanish ? "Correo corporativo" : "Email address"}</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={loading || !hasSupabaseConfig}>
            {loading
              ? (isSpanish ? "Enviando..." : "Sending...")
              : hasSupabaseConfig
                ? (isSpanish ? "Enviar enlace de recuperacion" : "Send reset link")
                : (isSpanish ? "Servicio no disponible" : "Service unavailable")}
          </button>
        </form>
      )}

      {!submitted ? (
        <div className="auth-links auth-links--single auth-links--compact">
          <Link to="/login" className="auth-back-link">
            <ArrowLeftIcon />
            <span>{isSpanish ? "Volver al login" : "Back to login"}</span>
          </Link>
        </div>
      ) : null}
    </section>
  );
}
