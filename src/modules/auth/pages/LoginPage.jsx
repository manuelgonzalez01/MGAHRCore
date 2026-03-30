import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../app/store/authStore";
import useI18n from "../../../app/providers/useI18n";
import authService from "../../../services/auth/auth.service";
import { hasSupabaseConfig } from "../../../services/supabase/client";

function useRedirectTarget() {
  const { search } = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("redirect") || "/dashboard";
  }, [search]);
}

export default function LoginPage() {
  const { language } = useI18n();
  const isSpanish = language === "es";
  const navigate = useNavigate();
  const redirectTarget = useRedirectTarget();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const unavailableMessage = isSpanish
    ? "El acceso se encuentra temporalmente en preparacion. Si necesitas habilitacion inmediata, contacta al administrador de la plataforma."
    : "Access is temporarily being prepared. If you need immediate enablement, contact the platform administrator.";

  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await authService.loginUser(form);
      login(session);
      navigate(redirectTarget, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <div className="auth-brand-mark">
          <span className="auth-brand-mark__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4H14v17" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M14 8h4.5A1.5 1.5 0 0 1 20 9.5V21" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 8h2M8 12h2M8 16h2M16 12h1.5M12 21v-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <span className="auth-card__eyebrow">{isSpanish ? "Acceso seguro" : "Secure access"}</span>
            <h2>{isSpanish ? "Inicia sesion en tu cuenta" : "Sign in to your account"}</h2>
          </div>
        </div>
        <p>{isSpanish ? "Accede a la plataforma corporativa de RRHH con una experiencia clara, segura y orientada a operacion empresarial." : "Access the corporate HR platform through a clear, secure, enterprise-oriented experience."}</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>{isSpanish ? "Correo corporativo" : "Corporate email"}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="name@mgahrcore.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>{isSpanish ? "Contrasena" : "Password"}</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder={isSpanish ? "Ingresa tu contrasena" : "Enter your password"}
            required
          />
        </label>

        {error ? (
          <div className="auth-alert auth-alert--error">
            <span className="auth-alert__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 9v4M12 17h.01M10.3 3.8 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <strong>{isSpanish ? "Error de autenticacion" : "Authentication error"}</strong>
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        {!hasSupabaseConfig ? (
          <div className="auth-alert">
            <span className="auth-alert__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 8v4m0 4h.01M4.5 19.5h15a1.5 1.5 0 0 0 1.3-2.25l-7.5-13a1.5 1.5 0 0 0-2.6 0l-7.5 13A1.5 1.5 0 0 0 4.5 19.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <strong>{isSpanish ? "Acceso temporalmente no disponible" : "Access temporarily unavailable"}</strong>
              <p>{unavailableMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="auth-inline-row">
          <span className="auth-helper-copy">
            {isSpanish ? "Acceso corporativo protegido con sesion persistente." : "Corporate access protected with persistent session."}
          </span>
          <Link to="/forgot-password" className="auth-helper-link">
            {isSpanish ? "Olvidaste tu contrasena?" : "Forgot password?"}
          </Link>
        </div>

        <button type="submit" className="auth-button" disabled={loading || !hasSupabaseConfig}>
          {loading
            ? (isSpanish ? "Validando acceso..." : "Validating access...")
            : hasSupabaseConfig
              ? (isSpanish ? "Entrar al workspace" : "Enter workspace")
              : (isSpanish ? "Acceso temporalmente no disponible" : "Access temporarily unavailable")}
        </button>
      </form>

      <div className="auth-links auth-links--centered">
        <span>{isSpanish ? "No tienes cuenta?" : "Don't have an account?"}</span>
        <Link to="/register">{isSpanish ? "Solicitar acceso" : "Request access"}</Link>
      </div>

      <div className="auth-links auth-links--single">
        <Link to="/" className="auth-subtle-link">{isSpanish ? "Volver al inicio" : "Back to homepage"}</Link>
      </div>
    </section>
  );
}
