import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useI18n from "../../../app/providers/useI18n";
import authService from "../../../services/auth/auth.service";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
};

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const isSpanish = language === "es";
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!acceptedTerms) {
      setError(isSpanish ? "Debes aceptar las condiciones del acceso corporativo." : "You must accept the corporate access conditions.");
      setLoading(false);
      return;
    }

    try {
      await authService.createAccessRequest({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        workEmail: formData.email,
        company: formData.company,
        role: "Requested Access",
        phone: formData.phone,
        reason: isSpanish
          ? "Solicitud enviada desde formulario de acceso corporativo."
          : "Request submitted from the corporate access form.",
      });

      setSuccess(true);
      window.setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (nextError) {
      setError(nextError.message || (isSpanish ? "No fue posible registrar la solicitud." : "The request could not be submitted."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card auth-card--wide">
      <div className="auth-card__header auth-card__header--centered">
        <div className="auth-brand-mark auth-brand-mark--centered">
          <span className="auth-brand-mark__icon" aria-hidden="true">
            <BuildingIcon />
          </span>
          <div>
            <h2>{isSpanish ? "Solicitar acceso" : "Request access"}</h2>
            <p>
              {isSpanish
                ? "Completa el formulario y el equipo revisara tu solicitud dentro de un flujo controlado."
                : "Complete the form and the team will review your request through a controlled workflow."}
            </p>
          </div>
        </div>
      </div>

      {success ? (
        <div className="auth-success-panel">
          <span className="auth-success-panel__icon" aria-hidden="true">
            <CheckIcon />
          </span>
          <h3>{isSpanish ? "Solicitud registrada correctamente" : "Request submitted successfully"}</h3>
          <p>
            {isSpanish
              ? "Tu acceso fue enviado para revision. Redirigiendo al login..."
              : "Your access request has been sent for review. Redirecting to login..."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form auth-form--grid auth-form--spacious">
          {error ? (
            <div className="auth-alert auth-alert--error auth-field--full">
              <span className="auth-alert__icon" aria-hidden="true">
                <AlertIcon />
              </span>
              <div>
                <strong>{isSpanish ? "Error de registro" : "Registration error"}</strong>
                <p>{error}</p>
              </div>
            </div>
          ) : null}

          <label className="auth-field">
            <span>{isSpanish ? "Nombre" : "First name"}</span>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>{isSpanish ? "Apellido" : "Last name"}</span>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>{isSpanish ? "Correo corporativo" : "Business email"}</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>{isSpanish ? "Telefono" : "Phone number"}</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field auth-field--full">
            <span>{isSpanish ? "Compania" : "Company name"}</span>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-checkbox auth-field--full">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
            />
            <span>
              {isSpanish
                ? "Acepto las condiciones del acceso corporativo, el tratamiento de datos y la revision por parte del equipo."
                : "I agree to the corporate access conditions, data handling, and team review process."}
            </span>
          </label>

          <button type="submit" disabled={loading} className="auth-button auth-field--full">
            {loading ? (isSpanish ? "Registrando solicitud..." : "Submitting request...") : (isSpanish ? "Solicitar acceso" : "Request access")}
          </button>
        </form>
      )}

      {!success ? (
        <div className="auth-links auth-links--centered">
          <span>{isSpanish ? "Ya tienes acceso?" : "Already have access?"}</span>
          <Link to="/login">{isSpanish ? "Iniciar sesion" : "Sign in"}</Link>
        </div>
      ) : null}

      <div className="auth-links auth-links--single">
        <Link to="/" className="auth-subtle-link">{isSpanish ? "Volver al inicio" : "Back to homepage"}</Link>
      </div>
    </section>
  );
}
